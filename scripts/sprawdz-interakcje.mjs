// Narzędzie deweloperskie: klika po zbudowanym trenerze w Chromium bez okna i sprawdza
// kluczowe interakcje (werdykty na żywo, Ctrl+Z po wstawieniu rozwiązania, podpowiedzi Monaco,
// zapamiętywanie w localStorage). Użycie: node scripts/sprawdz-interakcje.mjs [adres bazowy]
import { chromium } from 'playwright';

const baza = (process.argv[2] || 'http://localhost:4173/kurs_json_schema/').replace(/\/?$/, '/');
const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ viewport: { width: 1400, height: 900 } });
const strona = await kontekst.newPage();
const bledy = [];
strona.on('pageerror', e => bledy.push('pageerror: ' + e.message));
strona.on('console', m => { if (m.type() === 'error') bledy.push('console: ' + m.text()); });
const wyniki = [];
const sprawdz = (nazwa, ok, info = '') => { wyniki.push([ok, nazwa, info]); console.log((ok ? '✓ ' : '✗ ') + nazwa + (info ? ' — ' + info : '')); };

// Ustawia treść edytora przez model Monaco (pisanie z klawiatury dopełnia nawiasy i cudzysłowy).
async function ustawEdytor(selektor, tekst) {
  await strona.evaluate(([sel, t]) => {
    const ed = window.__monaco.editor.getEditors().find(e => document.querySelector(sel).contains(e.getDomNode()));
    if (!ed) throw new Error('brak edytora ' + sel);
    ed.getModel().setValue(t);
  }, [selektor, tekst]);
}

// 1. Ćwiczenie 3-1: start → 5/7, po dopisaniu kotwic → zaliczone.
await strona.goto(baza + '#/m/3/cw/3-2-kod-i-numer', { waitUntil: 'networkidle' });
await strona.waitForSelector('.monaco-editor .view-lines');
await strona.waitForTimeout(500);
const licznik1 = await strona.locator('.licznik').textContent();
sprawdz('3-2: start pokazuje 5 z 9', /5 z 9/.test(licznik1), licznik1.trim());
sprawdz('3-2: cztery karty z wskazówką', (await strona.locator('.karta.n .wsk').count()) === 4);

// Edycja przez klawiaturę: klik w edytor, Ctrl+A, wpisanie poprawionego schematu.
await ustawEdytor('#ed-schemat', '{ "type": "object", "properties": { "kodPocztowy": { "type": "string", "pattern": "^[0-9]{2}-[0-9]{3}$" }, "numer": { "type": "string", "pattern": "^ZAM-[0-9]{4}-[0-9]{6}$" } }, "required": ["kodPocztowy", "numer"] }');
await strona.waitForTimeout(600);
sprawdz('3-2: po poprawce „Zaliczone”', (await strona.locator('.zaliczone-ramka').count()) === 1);
sprawdz('3-2: zapisane w localStorage', await strona.evaluate(() => JSON.parse(localStorage.getItem('kurs-json-schema/v1') || '{}').zaliczone?.['3-2-kod-i-numer'] === true));

// 2. Zacznij od nowa → wraca start; Rozwiązanie → Wstaw → zaliczone; Ctrl+Z → wraca start.
await strona.click('#b-nowa');
await strona.waitForTimeout(500);
sprawdz('3-2: „Zacznij od nowa” przywraca start', /5 z 9/.test(await strona.locator('.licznik').textContent()));
await strona.click('#b-roz');
await strona.click('#b-wstaw');
await strona.waitForTimeout(500);
sprawdz('3-2: „Wstaw do edytora” zalicza', (await strona.locator('.zaliczone-ramka').count()) === 1);
await strona.click('#ed-schemat .view-lines');
await strona.keyboard.press('Control+Z');
await strona.waitForTimeout(500);
sprawdz('3-2: Ctrl+Z po wstawieniu przywraca poprzednią wersję', /5 z 9/.test(await strona.locator('.licznik').textContent()));

// 3. Błąd składni → marker i diagnoza z linią.
await strona.keyboard.press('Control+A');
await strona.keyboard.insertText('{\n  "type": "object",\n  "properties": {\n    "kodPocztowy": { "type": "string", },\n  }\n}');
await strona.waitForTimeout(500);
const diag = await strona.locator('.diag.blad').textContent();
sprawdz('3-2: błąd składni po polsku z linią', /Zbędny przecinek/.test(diag) && /linia 4/.test(diag), diag.trim().slice(0, 80));
sprawdz('3-2: marker błędu w edytorze', (await strona.locator('.monaco-editor .squiggly-error').count()) >= 1);

// 4. Podpowiedzi Monaco: po najechaniu na "required" opis po polsku.
await strona.keyboard.press('Control+A');
await strona.keyboard.insertText('{\n  "required": ["a"]\n}');
await strona.waitForTimeout(400);
const slowo = strona.locator('#ed-schemat .view-line').nth(1).locator('span', { hasText: 'required' }).first();
await slowo.hover();
await strona.waitForTimeout(1200);
const hover = await strona.locator('.monaco-hover').allTextContents();
sprawdz('Monaco: opis „required” po polsku po najechaniu', hover.some(t => /lista nazw pól/.test(t)), hover.join(' | ').slice(0, 100));

// 5. Podpowiedzi Ctrl+Spacja w pustym obiekcie.
await strona.keyboard.press('Control+A');
await strona.keyboard.insertText('{\n  ');
await strona.keyboard.press('Control+Space');
await strona.waitForTimeout(1200);
const sugestie = await strona.locator('.suggest-widget .monaco-list-row').allTextContents();
sprawdz('Monaco: Ctrl+Spacja proponuje słowa kluczowe', sugestie.length >= 10 && sugestie.some(t => /\$defs|properties|required/.test(t)), sugestie.slice(0, 5).join(', '));
await strona.keyboard.press('Escape');

// 5a. Ćwiczenie 3-2: trzy błędy składni po kolei, potem zgodność ze schematem.
await strona.goto(baza + '#/m/1/cw/1-1-zamowienie-z-maila', { waitUntil: 'networkidle' });
await strona.waitForSelector('#ed-dokument .view-lines');
await strona.waitForTimeout(500);
sprawdz('1-1: start pokazuje błąd w linii 4', /linia 4/.test(await strona.locator('#diagnoza').textContent()));
await ustawEdytor('#ed-dokument', '{\n  "numer": "ZAM-2026-000123",\n  "klient": "Serwis",\n  "faktura": true,\n  "pozycje": [\n    { "ean": "5901234123457", "ilosc": 2, "cena": 12,50 },\n    { "ean": "5901234123464", "ilosc": 36, "cena": 1.20 },\n  ]\n}');
await strona.waitForTimeout(500);
sprawdz('1-1: po pierwszej naprawie błąd przecinka dziesiętnego w linii 6', /kropki zamiast przecinka/.test(await strona.locator('#diagnoza').textContent()) && /linia 6/.test(await strona.locator('#diagnoza').textContent()));
await ustawEdytor('#ed-dokument', '{ "numer": "x", "klient": "", "faktura": true, "pozycje": [] }');
await strona.waitForTimeout(500);
const d32 = await strona.locator('#diagnoza').textContent();
sprawdz('1-1: poprawny JSON niezgodny ze schematem pokazuje komunikaty walidacji', /Niezgodność ze schematem/.test(d32) && /nie pasuje do wzorca/.test(d32) && (await strona.locator('.zaliczone-ramka').count()) === 0);
await strona.click('#b-roz');
await strona.click('#b-wstaw');
await strona.waitForTimeout(500);
sprawdz('1-1: rozwiązanie zalicza', (await strona.locator('.zaliczone-ramka').count()) === 1);

// 5b. Ćwiczenie 3-3: odpowiedzi, Sprawdź, wyjaśnienia, Spróbuj jeszcze raz.
await strona.goto(baza + '#/m/3/cw/3-4-szprychy', { waitUntil: 'networkidle' });
await strona.waitForSelector('#ed-schemat .view-lines');
sprawdz('3-4: „Sprawdź” nieaktywne bez odpowiedzi', await strona.locator('#b-sprawdz').isDisabled());
const poprawne = [true, true, false, false, true, false, false, false];
for (let i = 0; i < poprawne.length; i++) {
  const v = (i === 2 ? !poprawne[i] : poprawne[i]) ? 't' : 'n';
  await strona.click(`input[name="o-${i}"][value="${v}"]`);
}
await strona.waitForTimeout(200);
sprawdz('3-4: „Sprawdź” aktywne po wszystkich odpowiedziach', !(await strona.locator('#b-sprawdz').isDisabled()));
await strona.click('#b-sprawdz');
await strona.waitForTimeout(300);
sprawdz('3-4: jedna nietrafiona z wyjaśnieniem', (await strona.locator('.karta.nietrafione').count()) === 1 && /minimum/.test(await strona.locator('.karta.nietrafione .wyjasnienie').textContent()));
sprawdz('3-4: 7 z 8 trafionych, bez zaliczenia', /7 z 8/.test(await strona.locator('.licznik').textContent()) && (await strona.locator('.zaliczone-ramka').count()) === 0);
await strona.click('#b-jeszcze');
for (let i = 0; i < poprawne.length; i++) await strona.click(`input[name="o-${i}"][value="${poprawne[i] ? 't' : 'n'}"]`);
await strona.click('#b-sprawdz');
await strona.waitForTimeout(300);
sprawdz('3-4: wszystkie trafione → zaliczone', (await strona.locator('.zaliczone-ramka').count()) === 1);

// 5c. Ćwiczenie 3-4: zepsute odwołanie, diagram, poprawa, przykłady z nazwą pliku.
await strona.goto(baza + '#/m/7/cw/7-2-trzy-pliki', { waitUntil: 'networkidle' });
await strona.waitForSelector('#ed-projekt .view-lines');
await strona.waitForTimeout(500);
sprawdz('7-2: trzy zakładki, główny oznaczony', (await strona.locator('#zakladki button').count()) === 3 && /główny/.test(await strona.locator('#zakladki button.aktywny').textContent()));
const d34 = await strona.locator('#diagnoza').textContent();
sprawdz('7-2: diagnoza wskazuje zepsute odwołanie i plik', /„klinet”/.test(d34) && /plik „zamowienie”/.test(d34), d34.trim().slice(0, 90));
sprawdz('7-2: diagram ma czerwoną krawędź i węzeł „?”', (await strona.locator('#diagram .krawedz.zepsute').count()) === 1 && (await strona.locator('#diagram .wezel.brak').count()) === 1);
sprawdz('7-2: „jak widzi walidator” pokazuje $id', /https:\/\/kurs\.example\/schematy\/adres/.test(await strona.locator('#jak-widzi').textContent()));
await strona.click('#zakladki button[data-plik="adres"]');
await strona.waitForTimeout(200);
sprawdz('7-2: zakładka przełącza plik', /schematy\/adres/.test(await strona.locator('#ed-projekt').textContent()));
await strona.click('#zakladki button[data-plik="zamowienie"]');
await ustawEdytor('#ed-projekt', JSON.stringify({ $id: 'https://kurs.example/schematy/zamowienie', type: 'object', properties: { numer: { type: 'string', pattern: '^ZAM-[0-9]{4}-[0-9]{6}$' }, klient: { $ref: 'klient' }, adresDostawy: { $ref: 'adres' } }, required: ['numer', 'klient', 'adresDostawy'] }, null, 2));
await strona.waitForTimeout(600);
sprawdz('7-2: po poprawce zaliczone', (await strona.locator('.zaliczone-ramka').count()) === 1);
sprawdz('7-2: powód odrzucenia wskazuje plik z regułą', /reguła z pliku „adres”/.test(await strona.locator('#przyklady').textContent()));
sprawdz('7-2: diagram bez zepsutych krawędzi', (await strona.locator('#diagram .krawedz.zepsute').count()) === 0 && (await strona.locator('#diagram .krawedz').count()) === 2);
await ustawEdytor('#ed-projekt', '{ "a": ');
await strona.waitForTimeout(500);
sprawdz('7-2: błąd składni w pliku oznacza zakładkę', (await strona.locator('#zakladki button.z-bledem').count()) === 1);
// M1: „Zacznij od nowa” w nieaktywnym pliku da się cofnąć Ctrl+Z.
await strona.click('#zakladki button[data-plik="adres"]');
await strona.click('#ed-projekt .view-lines');
await strona.keyboard.press('Control+End');
await strona.keyboard.type('   ');
await strona.waitForTimeout(300);
await strona.click('#zakladki button[data-plik="zamowienie"]');
await strona.click('#b-nowa');
await strona.waitForTimeout(300);
await strona.click('#zakladki button[data-plik="adres"]');
const przedCofnieciem = await strona.evaluate(() => window.__monaco.editor.getEditors()[0].getModel().getValue());
await strona.click('#ed-projekt .view-lines');
await strona.keyboard.press('Control+Z');
await strona.waitForTimeout(300);
const poCofnieciu = await strona.evaluate(() => window.__monaco.editor.getEditors()[0].getModel().getValue());
sprawdz('7-2: Ctrl+Z cofa „Zacznij od nowa” także w nieaktywnym pliku', !/   $/.test(przedCofnieciem) && /   $/.test(poCofnieciu));
// Piaskownica: błędny schemat nie wywala widoku i nie blokuje po odświeżeniu (C1).
await strona.goto(baza + '#/piaskownica', { waitUntil: 'networkidle' });
await strona.waitForSelector('#ed-schemat .view-lines');
await ustawEdytor('#ed-schemat', '{ "pattern": "[" }');
await strona.waitForTimeout(500);
sprawdz('piaskownica: zły regex daje polską diagnozę', /wyrażeniem regularnym/.test(await strona.locator('#diag-schemat').textContent()) && (await strona.locator('.werdykt-glowny.c').count()) === 1);
await strona.waitForTimeout(400);
await strona.reload({ waitUntil: 'networkidle' });
await strona.waitForSelector('#ed-schemat .view-lines');
sprawdz('piaskownica: po odświeżeniu z błędnym schematem nadal działa', (await strona.locator('.awaria').count()) === 0 && /wyrażeniem regularnym/.test(await strona.locator('#diag-schemat').textContent()));
await strona.click('#b-reset');

// 6. Przełącznik formatów w piaskownicy.
await strona.goto(baza + '#/piaskownica', { waitUntil: 'networkidle' });
await strona.waitForSelector('.monaco-editor .view-lines');
await ustawEdytor('#ed-schemat', '{ "type": "string", "format": "email" }');
await ustawEdytor('#ed-dokument', '"jan@"');
await strona.waitForTimeout(500);
sprawdz('piaskownica: format jako adnotacja przepuszcza "jan@"', (await strona.locator('.werdykt-glowny.t').count()) === 1);
sprawdz('piaskownica: informacja o format jako adnotacji', /tylko opis/.test(await strona.locator('#diag-schemat').textContent()));
await strona.check('#p-formaty');
await strona.waitForTimeout(500);
sprawdz('piaskownica: po włączeniu formatów "jan@" odrzucony', (await strona.locator('.werdykt-glowny.n').count()) === 1);

// 7. Wykład → Otwórz w edytorze → piaskownica z przykładem → Wróć do wykładu.
await strona.goto(baza + '#/m/3', { waitUntil: 'networkidle' });
await strona.click('figure[data-nazwa="status-wielka-litera"] button.otworz');
await strona.waitForSelector('#ed-dokument .view-lines');
await strona.waitForTimeout(500);
sprawdz('wykład → piaskownica z dokumentem', /Wyslane/.test(await strona.locator('#ed-dokument').textContent()) && (await strona.locator('.werdykt-glowny.n').count()) === 1);
await strona.click('text=Wróć do wykładu');
await strona.waitForTimeout(300);
sprawdz('piaskownica → wróć do wykładu z kotwicą podrozdziału', /#\/m\/3\/wyklad\/enum$/.test(strona.url()), strona.url());

// 7b. Przycisk pod schematem otwiera schemat razem z pierwszym dokumentem; „Przywróć przykład” cofa zmiany.
await strona.goto(baza + '#/m/2', { waitUntil: 'networkidle' });
await strona.waitForSelector('figure.schemat[data-nazwa="reqired"]');
await strona.click('figure.schemat[data-nazwa="reqired"] button.otworz');
await strona.waitForSelector('#ed-dokument .view-lines');
await strona.waitForTimeout(500);
sprawdz('schemat z wykładu otwiera się z dokumentem', /reqired/.test(await strona.locator('#ed-schemat').textContent()) && /Jan.Nowak/.test(await strona.locator('#ed-dokument').textContent()));
await ustawEdytor('#ed-schemat', '{ "type": "string" }');
await strona.waitForTimeout(400);
await strona.click('#b-reset');
await strona.waitForTimeout(400);
sprawdz('„Przywróć przykład” wraca do schematu z wykładu', /reqired/.test(await strona.locator('#ed-schemat').textContent()) && /Przywróć przykład/.test(await strona.locator('#b-reset').textContent()));

// 7c. Wykład: spis treści modułu, pary schemat–dokument, kolory kodu w tekście.
await strona.goto(baza + '#/m/4', { waitUntil: 'networkidle' });
await strona.waitForSelector('.wyklad > .spis-modulu');
sprawdz('wykład: spis treści modułu na górze', (await strona.locator('.wyklad > .spis-modulu').count()) === 1);
sprawdz('wykład: schemat obok dokumentów', (await strona.locator('.wyklad .para .para-schemat figure.schemat').count()) >= 3);
sprawdz('wykład: kod schematu i dokumentu ma klasy', (await strona.locator('.wyklad code.kod-schemat').count()) > 5 && (await strona.locator('.wyklad code.kod-dokument').count()) > 0);
await strona.click('.spis-sekcji a >> nth=0');
await strona.waitForTimeout(300);
sprawdz('wykład: link w spisie części prowadzi do trasy z kotwicą', /#\/m\/4\/wyklad\/[a-z-]+$/.test(strona.url()), strona.url());

// 8. Duży tekst i motyw.
await strona.check('#p-duzy');
sprawdz('Duży tekst ustawia klasę', await strona.evaluate(() => document.documentElement.classList.contains('duzy-tekst')));
await strona.selectOption('#p-motyw', 'ciemny');
sprawdz('Motyw ciemny ustawia klasę', await strona.evaluate(() => document.documentElement.classList.contains('motyw-ciemny')));
await strona.waitForTimeout(500);
await strona.reload({ waitUntil: 'networkidle' });
sprawdz('Ustawienia przeżywają odświeżenie', await strona.evaluate(() => document.documentElement.classList.contains('motyw-ciemny') && document.documentElement.classList.contains('duzy-tekst')));

// 9. Ciemny motyw: zrzut ćwiczenia; wąski ekran: kolumny jedna pod drugą, bez poziomego przewijania.
await strona.goto(baza + '#/m/3/cw/3-2-kod-i-numer', { waitUntil: 'networkidle' });
await strona.waitForSelector('.monaco-editor .view-lines');
await strona.waitForTimeout(400);
await strona.screenshot({ path: '.superpowers/ciemny.png' });
sprawdz('Motyw ciemny: Monaco w vs-dark', (await strona.locator('.monaco-editor.vs-dark').count()) >= 1);
await strona.setViewportSize({ width: 420, height: 900 });
await strona.waitForTimeout(400);
const szerokosc = await strona.evaluate(() => document.documentElement.scrollWidth);
sprawdz('Wąski ekran: brak poziomego przewijania', szerokosc <= 420, 'scrollWidth=' + szerokosc);
const kolumny = await strona.evaluate(() => getComputedStyle(document.querySelector('.cwiczenie')).gridTemplateColumns.split(' ').length);
sprawdz('Wąski ekran: jedna kolumna', kolumny === 1, 'kolumn=' + kolumny);
await strona.screenshot({ path: '.superpowers/waski.png', fullPage: true });

// 10. Zablokowany localStorage: aplikacja startuje i działa.
const k2 = await przegladarka.newContext({ viewport: { width: 1200, height: 800 } });
await k2.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('localStorage zablokowany'); } }); });
const s2 = await k2.newPage();
const bledy2 = [];
s2.on('pageerror', e => bledy2.push(e.message));
await s2.goto(baza + '#/m/3/cw/3-2-kod-i-numer', { waitUntil: 'networkidle' });
await s2.waitForSelector('.monaco-editor .view-lines');
await s2.waitForTimeout(400);
sprawdz('Zablokowany localStorage: ćwiczenie działa bez błędów', bledy2.length === 0 && /5 z 9/.test(await s2.locator('.licznik').textContent()), bledy2.join('; '));
await k2.close();

await przegladarka.close();
const zle = wyniki.filter(w => !w[0]).length;
console.log(bledy.length ? 'Błędy strony:\n' + bledy.join('\n') : 'Brak błędów strony.');
console.log(`${wyniki.length - zle}/${wyniki.length} sprawdzeń OK`);
process.exit(zle || bledy.length ? 1 : 0);
