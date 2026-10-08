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
await strona.goto(baza + '#/m/3/cw/3-1-kod-pocztowy', { waitUntil: 'networkidle' });
await strona.waitForSelector('.monaco-editor .view-lines');
await strona.waitForTimeout(500);
const licznik1 = await strona.locator('.licznik').textContent();
sprawdz('3-1: start pokazuje 5 z 7', /5 z 7/.test(licznik1), licznik1.trim());
sprawdz('3-1: dwie karty z wskazówką', (await strona.locator('.karta.n .wsk').count()) === 2);

// Edycja przez klawiaturę: klik w edytor, Ctrl+A, wpisanie poprawionego schematu.
await ustawEdytor('#ed-schemat', '{ "type": "object", "properties": { "kodPocztowy": { "type": "string", "pattern": "^[0-9]{2}-[0-9]{3}$" } }, "required": ["kodPocztowy"] }');
await strona.waitForTimeout(600);
sprawdz('3-1: po poprawce „Zaliczone”', (await strona.locator('.zaliczone-ramka').count()) === 1);
sprawdz('3-1: zapisane w localStorage', await strona.evaluate(() => JSON.parse(localStorage.getItem('kurs-json-schema/v1') || '{}').zaliczone?.['3-1-kod-pocztowy'] === true));

// 2. Zacznij od nowa → wraca start; Rozwiązanie → Wstaw → zaliczone; Ctrl+Z → wraca start.
await strona.click('#b-nowa');
await strona.waitForTimeout(500);
sprawdz('3-1: „Zacznij od nowa” przywraca start', /5 z 7/.test(await strona.locator('.licznik').textContent()));
await strona.click('#b-roz');
await strona.click('#b-wstaw');
await strona.waitForTimeout(500);
sprawdz('3-1: „Wstaw do edytora” zalicza', (await strona.locator('.zaliczone-ramka').count()) === 1);
await strona.click('#ed-schemat .view-lines');
await strona.keyboard.press('Control+Z');
await strona.waitForTimeout(500);
sprawdz('3-1: Ctrl+Z po wstawieniu przywraca poprzednią wersję', /5 z 7/.test(await strona.locator('.licznik').textContent()));

// 3. Błąd składni → marker i diagnoza z linią.
await strona.keyboard.press('Control+A');
await strona.keyboard.insertText('{\n  "type": "object",\n  "properties": {\n    "kodPocztowy": { "type": "string", },\n  }\n}');
await strona.waitForTimeout(500);
const diag = await strona.locator('.diag.blad').textContent();
sprawdz('3-1: błąd składni po polsku z linią', /Zbędny przecinek/.test(diag) && /linia 4/.test(diag), diag.trim().slice(0, 80));
sprawdz('3-1: marker błędu w edytorze', (await strona.locator('.monaco-editor .squiggly-error').count()) >= 1);

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
await strona.click('figure[data-nazwa="status-zly"] button.otworz');
await strona.waitForSelector('#ed-dokument .view-lines');
await strona.waitForTimeout(500);
sprawdz('wykład → piaskownica z dokumentem', /Wysłane/.test(await strona.locator('#ed-dokument').textContent()) && (await strona.locator('.werdykt-glowny.n').count()) === 1);
await strona.click('text=Wróć do wykładu');
await strona.waitForTimeout(300);
sprawdz('piaskownica → wróć do wykładu z kotwicą', /#\/m\/3\/wyklad\/walidacja-instancji-dowolnego-typu/.test(strona.url()), strona.url());

// 8. Duży tekst i motyw.
await strona.check('#p-duzy');
sprawdz('Duży tekst ustawia klasę', await strona.evaluate(() => document.documentElement.classList.contains('duzy-tekst')));
await strona.selectOption('#p-motyw', 'ciemny');
sprawdz('Motyw ciemny ustawia klasę', await strona.evaluate(() => document.documentElement.classList.contains('motyw-ciemny')));
await strona.waitForTimeout(500);
await strona.reload({ waitUntil: 'networkidle' });
sprawdz('Ustawienia przeżywają odświeżenie', await strona.evaluate(() => document.documentElement.classList.contains('motyw-ciemny') && document.documentElement.classList.contains('duzy-tekst')));

await przegladarka.close();
const zle = wyniki.filter(w => !w[0]).length;
console.log(bledy.length ? 'Błędy strony:\n' + bledy.join('\n') : 'Brak błędów strony.');
console.log(`${wyniki.length - zle}/${wyniki.length} sprawdzeń OK`);
process.exit(zle || bledy.length ? 1 : 0);
