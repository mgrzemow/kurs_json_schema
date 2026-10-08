# Prototyp trenera — plan implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Działający prototyp trenera JSON Schema na GitHub Pages z całą infrastrukturą techniczną kursu i próbną treścią, plus minimalne budowanie materiałów (HTML + PDF).

**Architecture:** SPA w zwykłym JS (Vite), rdzeń logiki (`trener/rdzen/`) bez zależności od przeglądarki, współdzielony przez UI, testy Node i skrypty. Treść w `tresc/` kompilowana skryptem do JSON-ów w `public/tresc/`, z werdyktami liczonymi prawdziwym Ajv. Materiały renderowane z tych samych JSON-ów szablonem HTML i Playwright.

**Tech Stack:** Node 24, Vite 8, monaco-editor 0.57, ajv 8.20 (tryb 2020), ajv-formats 3, marked 18, playwright 1.64, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-08-prototyp-trenera-design.md`

## Global Constraints

- Zero CDN w działaniu: żaden plik w `dist/` nie odwołuje się poza własną domenę; czcionki systemowe (stos `system-ui`, mono `ui-monospace`).
- `base: '/kurs_json_schema/'` w Vite; wszystkie ścieżki względne do tego prefiksu.
- Tylko JSON Schema 2020-12; Ajv `ajv/dist/2020`, `allErrors: true`, `strict: false`, `useDefaults: false`.
- Identyfikatory, nazwy plików i komentarze w kodzie po polsku bez znaków diakrytycznych; nazwy z bibliotek bez zmian.
- Teksty interfejsu po polsku, tryb rozkazujący, nazwy słów kluczowych w `<code>`.
- Każdy odczyt i zapis `localStorage` w `try/catch`; klucz `kurs-json-schema/v1`.
- Rdzeń (`trener/rdzen/`) nie importuje niczego z przeglądarki (`window`, `document`, Monaco).
- Commity małe, komunikaty po polsku, z linią `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. Schemat z `$schema` wskazującym draft-07 w edytorze: ma działać (nagłówek pomijany z informacją), nie wywalać Ajv. Test w Task 4.
2. Schemat z błędnym regexem w `pattern` (np. `[`): komunikat po polsku, bez pustego ekranu i bez „zatrucia” instancji Ajv dla kolejnych kompilacji. Test w Task 4.
3. Projekt wielu plików, w którym dwa pliki mają ten sam `$id`: komunikat po polsku zamiast wyjątku. Test w Task 4.
4. Dokument JSON z duplikatem klucza w `przyklady` treści: skrypt budowania odrzuca treść (test w Task 5), a w edytorze dokumentu uczestnik dostaje ostrzeżenie (Task 2).
5. localStorage niedostępny (tryb prywatny): aplikacja startuje i działa bez zapamiętywania. Test ręczny w Task 12 (symulacja przez nadpisanie `localStorage` getterem rzucającym wyjątek) + jednostkowy test `stan.js` w Task 7.

---

### Task 1: Szkielet Vite + Monaco + Ajv + publikacja na Pages

**Files:**
- Create: `package.json`, `vite.config.js`, `trener/index.html`, `trener/ui/main.js`, `trener/ui/edytor.js`, `trener/ui/style.css`, `.github/workflows/publikuj.yml`, `public/.nojekyll`
- Modify: `.gitignore` (dodać `public/tresc/`, `materialy/wynik/`, `test-results/`)

**Interfaces:**
- Produces: `utworzEdytor(kontener, { wartosc, tylkoDoOdczytu })` → instancja Monaco (`edytor.js`); `ustawMarkery(edytor, lista)` gdzie element listy to `{ od, do, komunikat, poziom: 'blad'|'ostrz'|'info' }` z pozycjami jako offsety w tekście.

- [ ] **Krok 1: `package.json` i instalacja**

```json
{
  "name": "kurs-json-schema",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node scripts/zbuduj-tresc.mjs && vite --config vite.config.js",
    "build": "node scripts/zbuduj-tresc.mjs && vite build --config vite.config.js",
    "preview": "vite preview --config vite.config.js",
    "tresc": "node scripts/zbuduj-tresc.mjs",
    "test": "node --test tests/",
    "materialy": "node scripts/zbuduj-materialy.mjs"
  }
}
```

Run: `npm install --save-exact vite@8.3.4 monaco-editor@0.57.0 ajv@8.20.0 ajv-formats@3.0.1 marked@18.1.0` i `npm install --save-dev --save-exact playwright@1.64.0`. W tym kroku `scripts/zbuduj-tresc.mjs` jeszcze nie istnieje: utwórz plik-zaślepkę, który tylko tworzy katalog `public/tresc/` (Task 5 go zastąpi).

- [ ] **Krok 2: `vite.config.js`**

```js
import { defineConfig } from 'vite';
export default defineConfig({
  root: 'trener',
  publicDir: '../public',
  base: '/kurs_json_schema/',
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022' },
  worker: { format: 'es' },
});
```

- [ ] **Krok 3: `trener/index.html` i `main.js` z jednym edytorem**

`index.html`: `<!doctype html>`, `lang="pl"`, `<meta charset>`, viewport, `<title>Kurs JSON Schema</title>`, `<link rel="stylesheet" href="./ui/style.css">`, `<div id="app"></div>`, `<script type="module" src="./ui/main.js"></script>`.

`edytor.js`:

```js
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution';
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' });
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
  },
};
export { monaco };
export function utworzEdytor(kontener, { wartosc = '', tylkoDoOdczytu = false } = {}) {
  return monaco.editor.create(kontener, {
    value: wartosc, language: 'json', readOnly: tylkoDoOdczytu,
    automaticLayout: true, minimap: { enabled: false }, tabSize: 2, insertSpaces: true,
    fontFamily: 'ui-monospace, Consolas, "Cascadia Mono", monospace', fontSize: 14,
    scrollBeyondLastLine: false, wordWrap: 'off', fixedOverflowWidgets: true,
  });
}
```

Jeśli ścieżki importów kontrybucji nie istnieją w 0.57 (sprawdź w `node_modules/monaco-editor/esm/vs/editor/`), użyj `monaco-editor/esm/vs/editor/editor.main` (pełny zestaw, większy bundle) i odnotuj to w commicie.

`main.js`: tworzy nagłówek „Kurs JSON Schema — prototyp” i edytor z przykładowym schematem zamówienia; importuje `Ajv2020 from 'ajv/dist/2020'`, kompiluje schemat i wypisuje pod edytorem „Ajv działa: true/false”.

- [ ] **Krok 4: Sprawdź lokalnie**

Run: `npm run build && npm run preview` → otwórz `http://localhost:4173/kurs_json_schema/`. Oczekiwane: edytor koloruje JSON, w konsoli brak błędów o workerze, `grep -rl "cdn\|googleapis\|unpkg" dist/` zwraca nic.

- [ ] **Krok 5: Workflow Pages**

```yaml
name: Publikuj trener
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Na tym etapie `tests/` nie istnieje, więc `npm test` wywali się: dodaj `tests/smoke.test.mjs` z jednym testem `assert.ok(true)`.

- [ ] **Krok 6: Commit, push, sprawdzenie adresu**

Run: `git add -A && git commit -m "Szkielet: Vite, Monaco, Ajv, workflow Pages" && git push`, potem `gh run watch` i `curl -sI https://mgrzemow.github.io/kurs_json_schema/ | head -1` → `200`. Sprawdź stronę w przeglądarce (Chrome przez narzędzia claude-in-chrome albo poproś prowadzącego): edytor się ładuje, podpowiedzi JSON działają (Ctrl+Spacja w pustym obiekcie proponuje coś lub przynajmniej nie ma błędu workera w konsoli).

---

### Task 2: Rdzeń — parser JSON z polskimi komunikatami

**Files:**
- Create: `trener/rdzen/parser-json.js`, `tests/parser.test.mjs`

**Interfaces:**
- Produces: `parsujJSON(tekst, komunikatPusty?)` → `{ wartosc, klucze: Map<jsonPointer, offset>, duplikaty: [{ klucz, pos }] }`; rzuca `BladSkladni` z polami `message`, `pos` (offset), `linia`, `kolumna`. Eksport `BladSkladni`.

- [ ] **Krok 1: Testy**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujJSON, BladSkladni } from '../trener/rdzen/parser-json.js';

const przypadki = [
  ['{"a": 1,}', /Zbędny przecinek przed „}”/, 1],
  ["{'a': 1}", /podwójnym cudzysłowie/, 1],
  ['{“a”: 1}', /cudzysłów drukarski/, 1],
  ['{"cena": 12,50}', /kropki zamiast przecinka/, 1],
  ['{"a": True}', /małymi literami/, 1],
  ['{"a": None}', /null/, 1],
  ['{"a": "\\d"}', /podwoić/, 1],
  ['{"a": 1 // uwaga\n}', /komentarze/, 1],
  ['{"a": 1}', /twarda spacja/, 1],
  ['{\n"a": 1\n"b": 2}', /Brakuje przecinka/, 2],
  ['{"a": 01}', /zaczynać się od zera/, 1],
  ['[1, 2', /Brakuje nawiasu „\]”/, 1],
];
for (const [tekst, re, linia] of przypadki) test(`komunikat dla ${JSON.stringify(tekst)}`, () => {
  assert.throws(() => parsujJSON(tekst), e => e instanceof BladSkladni && re.test(e.message) && e.linia === linia);
});
test('poprawny JSON zwraca wartosc i klucze', () => {
  const w = parsujJSON('{"a": {"b": [1, 2]}}');
  assert.deepEqual(w.wartosc, { a: { b: [1, 2] } });
  assert.equal(w.klucze.get('/a/b'), 9);
  assert.deepEqual(w.duplikaty, []);
});
test('duplikat klucza jest zgłaszany, liczy się ostatni', () => {
  const w = parsujJSON('{"a": 1, "a": 2}');
  assert.equal(w.wartosc.a, 2);
  assert.equal(w.duplikaty.length, 1);
  assert.equal(w.duplikaty[0].klucz, 'a');
});
test('pusty tekst daje komunikat z parametru', () => {
  assert.throws(() => parsujJSON('   ', 'Schemat jest pusty.'), /Schemat jest pusty/);
});
test('__proto__ jako klucz nie psuje obiektu', () => {
  const w = parsujJSON('{"__proto__": {"x": 1}}');
  assert.equal(Object.getPrototypeOf(w.wartosc), Object.prototype);
});
```

- [ ] **Krok 2: Uruchom, ma oblać** — `node --test tests/parser.test.mjs` → błąd importu.
- [ ] **Krok 3: Implementacja** — przenieś `parsujJSON` z `prototyp/trener.html` (sekcja „Parser JSON z polskimi komunikatami”) do modułu ES; zmień nazwy pól wyniku na `wartosc`, `klucze`, `duplikaty` (`{ klucz, pos }`); zdefiniuj `class BladSkladni extends Error { constructor(message, pos, tekst) }` liczącą `linia` i `kolumna` z `tekst.slice(0, pos)`. Zachowaj wszystkie komunikaty z prototypu.
- [ ] **Krok 4: Uruchom, ma przejść.** Jeśli jakiś offset w teście `klucze` nie zgadza się z implementacją, sprawdź ręcznie, który jest prawidłowy (offset klucza = pozycja otwierającego cudzysłowu) i popraw test tylko wtedy, gdy implementacja jest zgodna z tą definicją.
- [ ] **Krok 5: Commit** — `git add trener/rdzen/parser-json.js tests/parser.test.mjs && git commit -m "Rdzeń: parser JSON z polskimi komunikatami i testami"`.

---

### Task 3: Rdzeń — komunikaty Ajv po polsku i analiza schematu

**Files:**
- Create: `trener/rdzen/komunikaty.js`, `trener/rdzen/analiza-schematu.js`, `trener/rdzen/pomocnicze.js`, `tests/komunikaty.test.mjs`, `tests/analiza-schematu.test.mjs`

**Interfaces:**
- `pomocnicze.js`: `odmiana(n, [poj, kilka, wiele])`, `krotko(v)`, `ladnie(v)`, `segmenty(pointer)`, `wskaz(dane, pointer)`, `kodujSegment(s)`.
- `komunikaty.js`: `komunikat(blad, dane, { plik } = {})` → string; `komunikaty(bledy, dane, limit?)` → string[] bez duplikatów. `blad` to element `ajv.errors` (ma `instancePath`, `keyword`, `params`, `schemaPath`). Gdy `plik` podany, komunikat kończy się ` (reguła z pliku „adres”)`.
- `analiza-schematu.js`: `analizujSchemat(schemat, klucze)` → `[{ poziom: 'ostrz'|'info', tekst, pos }]`; eksport `ZNANE_SLOWA` (Set).

- [ ] **Krok 1: Testy komunikatów** — zbuduj błędy prawdziwym Ajv, nie ręcznie:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import { komunikaty } from '../trener/rdzen/komunikaty.js';
const ajv = new Ajv2020({ allErrors: true, strict: false });
const sprawdz = (schemat, dane) => { const f = ajv.compile(schemat); f(dane); return komunikaty(f.errors || [], dane); };
test('required', () => assert.deepEqual(sprawdz({ required: ['numer'] }, {}), ['Brakuje wymaganego pola „numer”.']));
test('type w zagnieżdżeniu', () => assert.deepEqual(
  sprawdz({ properties: { pozycje: { items: { properties: { ilosc: { type: 'integer' } } } } } }, { pozycje: [{ ilosc: 1 }, { ilosc: '2' }] }),
  ['Pole „ilosc” w elemencie nr 2: oczekiwano liczby całkowitej, a jest tekst.']));
test('pattern', () => assert.match(sprawdz({ pattern: '^\\d{2}-\\d{3}$' }, '123')[0], /nie pasuje do wzorca/));
test('oneOf dwie opcje', () => assert.match(sprawdz({ oneOf: [{ type: 'string' }, { minLength: 1 }] }, 'a')[0], /kilku opcji/));
test('additionalProperties', () => assert.deepEqual(sprawdz({ additionalProperties: false }, { adrs: 1 }), ['Pole „adrs” nie jest przewidziane w schemacie.']));
test('enum z lista', () => assert.match(sprawdz({ enum: ['nowe', 'oplacone'] }, 'x')[0], /"nowe", "oplacone"/));
test('plik w komunikacie', async () => {
  const { komunikat } = await import('../trener/rdzen/komunikaty.js');
  const f = ajv.compile({ required: ['a'] }); f({});
  assert.match(komunikat(f.errors[0], {}, { plik: 'adres' }), /reguła z pliku „adres”/);
});
```

- [ ] **Krok 2: Testy analizy schematu**

```js
import { analizujSchemat } from '../trener/rdzen/analiza-schematu.js';
import { parsujJSON } from '../trener/rdzen/parser-json.js';
const analizuj = t => { const { wartosc, klucze } = parsujJSON(t); return analizujSchemat(wartosc, klucze); };
test('literówka w słowie kluczowym', () => assert.match(analizuj('{"requried": ["a"]}')[0].tekst, /Czy chodziło o „required”/));
test('pole poza properties', () => assert.match(analizuj('{"numer": {"type": "string"}}')[0].tekst, /przenieś je do „properties”/));
test('required bez properties', () => assert.match(analizuj('{"properties": {"a": {}}, "required": ["b"]}')[0].tekst, /„b” jest w „required”/));
test('format jako adnotacja', () => assert.equal(analizuj('{"format": "email"}')[0].poziom, 'info'));
test('pos wskazuje slowo', () => assert.equal(analizuj('{"requried": []}')[0].pos, 1));
test('poprawny schemat bez uwag', () => assert.deepEqual(analizuj('{"type": "string", "minLength": 1}'), []));
```

- [ ] **Krok 3: Uruchom, mają oblać.**
- [ ] **Krok 4: Implementacja** — przenieś z prototypu `odmiana`, `krotko`, `ladnie`, `jeden`, `segmenty`, `wskaz`, `rodzaj`, `podmiot`, `orzeczenie`, `komunikat`, `komunikaty`, `ZNANE`, `lev`, `najblizsze`, `znajdzUwagi` (→ `analizujSchemat`). `komunikat` z pierwszą literą wielką i kropką na końcu; argument `{ plik }` dopisuje sufiks.
- [ ] **Krok 5: Uruchom, mają przejść. Commit** — „Rdzeń: polskie komunikaty Ajv i analiza schematu”.

---

### Task 4: Rdzeń — opakowanie Ajv (walidator, projekt wielu plików)

**Files:**
- Create: `trener/rdzen/walidator.js`, `tests/walidator.test.mjs`

**Interfaces:**
- `utworzWalidator({ formaty: boolean })` → obiekt `{ kompiluj(schemat), kompilujProjekt(pliki, glowny), opcje }`.
- `kompiluj(schemat)` → `{ sprawdz(dane) → { ok, bledy: ajvErrors[] } }` albo rzuca `BladSchematu` (`message` po polsku, `pos` opcjonalnie, `plik` opcjonalnie).
- `kompilujProjekt(pliki, glowny)`: `pliki` to `{ [nazwa]: { tekst, wartosc } }` (już sparsowane), `glowny` to nazwa; rejestruje przez `addSchema` każdy plik pod jego `$id` (brak `$id` → `BladSchematu` „Plik „x” nie ma `$id`…”), kompiluje główny. Zwraca `{ sprawdz, idPlikow: { [nazwa]: id }, odwolania: [{ zPliku, ref, doPliku|null }] }` gdzie `odwolania` to wszystkie `$ref` znalezione w plikach z rozwiązaniem na nazwę pliku albo `null` (zepsute).
- Eksport `BladSchematu`, `przygotujSchemat(wartosc)` → `{ schemat, uwagi }` (usuwa obcy `$schema` i dodaje info jak w prototypie).

- [ ] **Krok 1: Testy**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { utworzWalidator, BladSchematu } from '../trener/rdzen/walidator.js';
test('kompiluj i sprawdz', () => {
  const w = utworzWalidator({ formaty: false }).kompiluj({ type: 'integer' });
  assert.equal(w.sprawdz(1).ok, true); assert.equal(w.sprawdz('1').ok, false);
});
test('format jako adnotacja bez formatów, asercja z formatami', () => {
  const s = { type: 'string', format: 'email' };
  assert.equal(utworzWalidator({ formaty: false }).kompiluj(s).sprawdz('jan@').ok, true);
  assert.equal(utworzWalidator({ formaty: true }).kompiluj(s).sprawdz('jan@').ok, false);
});
test('default niczego nie wpisuje', () => {
  const d = {}; utworzWalidator({ formaty: false }).kompiluj({ properties: { waluta: { default: 'PLN' } } }).sprawdz(d);
  assert.deepEqual(d, {});
});
test('zły regex daje BladSchematu po polsku i nie psuje kolejnych kompilacji', () => {
  const wal = utworzWalidator({ formaty: false });
  assert.throws(() => wal.kompiluj({ pattern: '[' }), e => e instanceof BladSchematu && /wyrażeniem regularnym/.test(e.message));
  assert.equal(wal.kompiluj({ type: 'string' }).sprawdz('a').ok, true);
});
test('nieznany $ref po polsku', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompiluj({ $ref: '#/$defs/adres' }), /Odwołanie #\/\$defs\/adres nie prowadzi/);
});
test('obcy $schema jest pomijany z informacją', async () => {
  const { przygotujSchemat } = await import('../trener/rdzen/walidator.js');
  const { schemat, uwagi } = przygotujSchemat({ $schema: 'http://json-schema.org/draft-07/schema#', type: 'string' });
  assert.equal(schemat.$schema, undefined); assert.match(uwagi[0].tekst, /2020-12/);
});
test('type z nieznaną wartością daje czytelny komunikat', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompiluj({ type: 'text' }), /„type” ma nieznaną wartość "text"/);
});
const pliki = {
  zamowienie: { wartosc: { $id: 'https://kurs.example/schematy/zamowienie', type: 'object', properties: { adres: { $ref: 'adres' }, klient: { $ref: 'klient' } } } },
  adres: { wartosc: { $id: 'https://kurs.example/schematy/adres', type: 'object', required: ['miasto'] } },
};
test('projekt: odwolania i zepsute', () => {
  const wal = utworzWalidator({ formaty: false });
  assert.throws(() => wal.kompilujProjekt(pliki, 'zamowienie'), e => e instanceof BladSchematu && /„klient”/.test(e.message) && e.plik === 'zamowienie');
  const p = wal.kompilujProjekt({ ...pliki, klient: { wartosc: { $id: 'https://kurs.example/schematy/klient', type: 'object' } } }, 'zamowienie');
  assert.equal(p.sprawdz({ adres: {} }).ok, false);
  assert.deepEqual(p.odwolania.find(o => o.ref === 'adres').doPliku, 'adres');
});
test('projekt: dwa pliki z tym samym $id', () => {
  const wal = utworzWalidator({ formaty: false });
  const dwa = { a: { wartosc: { $id: 'https://kurs.example/schematy/x' } }, b: { wartosc: { $id: 'https://kurs.example/schematy/x' } } };
  assert.throws(() => wal.kompilujProjekt(dwa, 'a'), /ten sam \$id/);
});
test('projekt: plik bez $id', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompilujProjekt({ a: { wartosc: {} } }, 'a'), /nie ma „\$id”/);
});
```

- [ ] **Krok 2: Uruchom, mają oblać.**
- [ ] **Krok 3: Implementacja** — `new Ajv2020({ allErrors: true, strict: false, useDefaults: false, validateFormats: formaty })`, z `addFormats(ajv)` gdy `formaty`. `kompiluj`: `przygotujSchemat` → `ajv.validateSchema` (błąd → `bladMeta` z prototypu) → `ajv.compile` w `try`; po wyjątku `wyjatek(e)` z prototypu i **nowa instancja Ajv** (zapisz w zmiennej instancji). Po kompilacji `ajv.removeSchema(schemat)` żeby nie kolidować przy kolejnych. `kompilujProjekt`: świeża instancja, pętla `addSchema` z łapaniem błędu „already exists” → `BladSchematu('Pliki „a” i „b” mają ten sam $id…')`; `getSchema(idGlownego)` w `try`; błąd `can't resolve reference X from id Y` → mapuj `Y` na nazwę pliku i komunikat „Odwołanie „X” w pliku „a” nie prowadzi do żadnego schematu. Sprawdź `$id` plików”. `odwolania`: rekurencyjne przejście po każdym pliku, każde `$ref` rozwiązane przez `new URL(ref, idPliku)` (bez fragmentu) i dopasowane do mapy id → nazwa.
- [ ] **Krok 4: Uruchom, mają przejść. Commit** — „Rdzeń: walidator Ajv z projektem wielu plików”.

---

### Task 5: Format treści, skrypt budowania, treść próbna, testy treści, hooki

**Files:**
- Create: `tresc/kurs.json`, `tresc/schemat-cwiczenia.json`, `tresc/moduly/03-walidacja-wartosci/{modul.json,wyklad.md}`, cztery katalogi ćwiczeń (niżej), `scripts/zbuduj-tresc.mjs`, `scripts/wyklad-md.mjs`, `tests/cwiczenia.test.mjs`, `tests/wyklad.test.mjs`, `tests/zakres.test.mjs`, `.claude/settings.json`
- Delete: `tests/smoke.test.mjs`

**Interfaces:**
- `scripts/wyklad-md.mjs`: `parsujWyklad(md, { walidator })` → `{ html, sekcje: [{ id, tytul }], przyklady: { [nazwa]: { schemat?, dokument?, oczekiwane?, werdykt? } }, twierdzenia: [{ tekst, zrodlo|null }] }`. Rzuca błąd, gdy `oczekiwane` ≠ werdykt.
- `scripts/zbuduj-tresc.mjs`: eksportuje `wczytajKurs()` → `{ kurs, moduly: [{ meta, wyklad, cwiczenia: [cw] }] }` (używane przez testy i materiały) i jako program zapisuje `public/tresc/kurs.json` + `public/tresc/modul-<nr>.json`. `cw` = zawartość `cwiczenie.json` + `start` (string), `rozwiazanie` (obiekt), `bledne: [{ nazwa, dlaczego, schemat }]`, `pliki` (rodzaj 4: `{ [nazwa]: string }`).

- [ ] **Krok 1: Schemat ćwiczenia** (`tresc/schemat-cwiczenia.json`, 2020-12): wymagane `id` (`^\d+-\d+(-[a-z0-9-]+)?$`), `rodzaj` (1–5), `tytul`, `poziom` (1–3), `czasMin` (integer ≥1), `kolejnosc`, `kontekst`, `polecenie`, `slowa` (string[]), `podpowiedz`, `zrodla` (array of `{ twierdzenie, zrodlo }`). `przyklady` wymagane dla rodzaju 1, 4, 5 (`{ opis, dane, ok, wskazowka? }`), `bledy` dla 2 (string[] fragmentów komunikatów), `odpowiedzi` dla 3 (`{ opis, dane, ok, wyjasnienie }`), `glowny` dla 4. `additionalProperties: false`.

- [ ] **Krok 2: Treść próbna** (wszystko w domenie zamówienia; oznaczona w `modul.json` polem `"probna": true`):
  - `tresc/kurs.json`: `{ "tytul": "Kurs JSON Schema 2020-12", "moduly": [{ "nr": 3, "katalog": "03-walidacja-wartosci" }] }`.
  - `modul.json`: `{ "nr": 3, "tytul": "Walidacja wartości", "minuty": 40, "probna": true, "zakres": ["Walidacja instancji tekstowych", "Walidacja instancji numerycznych", "Wyrażenia regularne", "Walidacja instancji dowolnego typu"] }`.
  - `wyklad.md`: sekcje `## Walidacja instancji dowolnego typu` (`type`, `enum` na statusie zamówienia; przykład `schemat=status`, dokumenty `status-ok` przechodzi, `status-zly` odrzucony), `## Walidacja instancji tekstowych`, `## Wyrażenia regularne` (para wzorców z `^…$` i bez, na kodzie pocztowym; pytanie do sali `pytanie=kod-bez-kotwic`), `## Walidacja instancji numerycznych` (`multipleOf: 36` szprychy; ramka `**W draft-07:**` o `exclusiveMinimum`). Każda sekcja ma co najmniej jeden akapit z `<!-- twierdzenie -->` i `<!-- zrodlo: validation §6.1.1 -->` (numery sekcji sprawdź w `spec/tekst/json-schema-validation.txt`). Na początku akapit kursywą: „Treść próbna prototypu, do zastąpienia.”
  - Ćwiczenia (katalogi `cwiczenia/<id>/`):
    - `3-1-kod-pocztowy` rodzaj 1, ★, 5 min: start `{"type":"object","properties":{"kodPocztowy":{"type":"string","pattern":"[0-9]{2}-[0-9]{3}"}},"required":["kodPocztowy"]}`; rozwiązanie z `^…$`; przykłady: `00-950` ok, `80-180` ok, `00950` nie, `kod: 00-950` nie (wskazówka o `^`), `00-9500` nie (wskazówka o `$`), `31042` nie; błędne: `bez-kotwic.json` (= start) „bez kotwic wzorzec znajduje fragment”.
    - `3-2-napraw-zamowienie` rodzaj 2, ★, 5 min: `start.txt` z zamówieniem mającym trzy błędy: cena `12,50`, zbędny przecinek po ostatniej pozycji, `True`; `rozwiazanie.json` poprawne; `bledy`: `["kropki zamiast przecinka", "Zbędny przecinek", "małymi literami"]`; dodatkowo `schemat.json` (opcjonalny) z `required` i typami, który naprawiony dokument musi spełnić.
    - `3-3-opakowania` rodzaj 3, ★★, 5 min: `schemat.json` `{ "type": "integer", "minimum": 36, "multipleOf": 36, "maximum": 360 }`; `odpowiedzi`: 36 ok, 72 ok, 0 nie („`minimum` 36”), 50 nie, 360 ok (granica), 396 nie, 36.0 ok (wyjaśnienie: 36.0 to liczba całkowita wg specyfikacji; źródło validation §6.1.1), `"36"` nie.
    - `3-4-projekt-zamowienia` rodzaj 4, ★★, 8 min: `pliki/zamowienie.json` (`$id` …/zamowienie, `$ref: "adres"` i `$ref: "klinet"` — zepsute), `pliki/adres.json`, `pliki/klient.json`; `glowny: "zamowienie"`; rozwiązanie w `rozwiazanie/zamowienie.json` (poprawiony `$ref`); przykłady: zamówienie z poprawnym adresem i klientem ok; bez miasta nie; klient bez e-maila nie.
  - Każde ćwiczenie ma `zrodla` z co najmniej jednym wpisem.

- [ ] **Krok 3: Testy treści** (`tests/cwiczenia.test.mjs`): dla każdego ćwiczenia z `wczytajKurs()`: `cwiczenie.json` zgodne ze schematem (Ajv), rodzaj 1/4/5: rozwiązanie przechodzi wszystkie przykłady zgodnie z `ok`, start oblewa co najmniej jeden, każde błędne oblewa co najmniej jeden; rodzaj 2: `start.txt` rzuca `BladSkladni`, a po kolejnych naprawach… (uprość: `rozwiazanie.json` parsuje się i, jeśli jest `schemat.json`, przechodzi; każdy fragment z `bledy` występuje w komunikacie parsera dla `start.txt` **po usunięciu poprzednich błędów** — zaimplementuj jako: parsuj, złap komunikat, sprawdź że zawiera `bledy[i]`, zastąp w tekście linijkę błędu odpowiednią linijką z rozwiązania (po numerze linii), powtórz); rodzaj 3: każdy `odpowiedzi[i].ok` zgodny z walidatorem. `tests/wyklad.test.mjs`: `parsujWyklad` nie rzuca; każde twierdzenie ma źródło; każdy `oczekiwane` zgodny. `tests/zakres.test.mjs`: dla każdego hasła z `modul.json.zakres` istnieje nagłówek `##` w `wyklad.md` zawierający je dosłownie.
- [ ] **Krok 4: Uruchom, mają oblać (brak skryptów).**
- [ ] **Krok 5: Implementacja `wyklad-md.mjs`** — `marked` z własnym `renderer.code(tekst, info)`: parsuj `info` jako `json klucz=wartosc ...`; `schemat=X` zapisuje schemat; `dokument=Y schemat=X oczekiwane=przechodzi|odrzucony` liczy werdykt walidatorem (`utworzWalidator({formaty:false})`) i renderuje `<figure class="przyklad" data-nazwa=… data-werdykt=…>` z `<pre>` i przyciskiem `<button data-otworz=X>Otwórz w edytorze</button>`; `pytanie=Z` renderuje `<details class="pytanie"><summary>Przejdzie czy nie?</summary>…werdykt…</details>`. Komentarze `<!-- twierdzenie -->` i `<!-- zrodlo: ... -->` zbieraj tokenami `html`; źródło przypisuje się do ostatniego twierdzenia. Nagłówki `##` dostają `id` ze sluga (polskie znaki → ASCII). Cytat zaczynający się od `**W draft-07:**` dostaje klasę `draft07`.
- [ ] **Krok 6: Implementacja `zbuduj-tresc.mjs`** — czyta `tresc/kurs.json`, każdy moduł, waliduje `cwiczenie.json` schematem, wczytuje pliki, składa obiekty, zapisuje JSON-y; przy błędzie wypisuje ścieżkę i kończy z kodem 1.
- [ ] **Krok 7: Uruchom testy, mają przejść; `npm run build` działa.**
- [ ] **Krok 8: Hooki** — `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "node scripts/hook-testy.mjs" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "node scripts/hook-testy.mjs --stop" }] }]
  }
}
```

`scripts/hook-testy.mjs`: czyta JSON hooka ze stdin; dla `PostToolUse` sprawdza, czy `tool_input.file_path` zaczyna się od `tresc/` lub `trener/rdzen/` (inaczej kończy 0); uruchamia `npm test --silent`; przy niepowodzeniu wypisuje skrót na stderr i kończy z kodem 2 (blokuje / zwraca błąd do Claude). Dla `--stop` uruchamia testy tylko, gdy `git status --porcelain` pokazuje zmiany w `tresc/`, `trener/` lub `tests/`.
- [ ] **Krok 9: Commit** — „Treść: format, skrypt budowania, treść próbna modułu 3, testy i hooki”.

---

### Task 6: `sprawdz-cwiczenie.js` i skrypt `sprawdz-rozwiazanie`

**Files:**
- Create: `trener/rdzen/sprawdz-cwiczenie.js`, `scripts/sprawdz-rozwiazanie.mjs`, `tests/sprawdz-cwiczenie.test.mjs`

**Interfaces:**
- `sprawdzCwiczenie(cw, wejscie, { formaty })` → `{ diagnoza: [{ poziom:'blad'|'ostrz'|'info', tekst, pos?, plik? }], przyklady: [{ opis, ok, przeszedl|null, zgodny, powod: string[], wskazowka? }], zaliczone: boolean }`. `wejscie`: rodzaj 1/5 → `{ schemat: string }`; rodzaj 2 → `{ dokument: string }`; rodzaj 3 → `{ odpowiedzi: boolean[] }`; rodzaj 4 → `{ pliki: { [nazwa]: string } }`. Dla rodzaju 2 `przyklady` jest puste, a `zaliczone` = brak błędu składni i (jeśli `schemat`) dokument przechodzi. To jedyna funkcja, przez którą UI, testy i skrypt liczą werdykty.

- [ ] **Krok 1: Testy** — na treści próbnej (`wczytajKurs()`): rozwiązanie 3-1 → `zaliczone: true`; start 3-1 → dwa przykłady `zgodny: false` ze `wskazowka`; schemat `{` → `diagnoza[0].poziom === 'blad'` z `pos`; 3-2 start → diagnoza z linią; 3-2 rozwiązanie → `zaliczone`; 3-3 odpowiedzi wszystkie poprawne → `zaliczone`; 3-4 z zepsutym `$ref` → `diagnoza[0].plik === 'zamowienie'`.
- [ ] **Krok 2: Implementacja** (łączy parser, analizę, walidator, komunikaty). Rodzaj 4: parsuj każdy plik (błąd składni → diagnoza z `plik`), `kompilujProjekt`.
- [ ] **Krok 3: `scripts/sprawdz-rozwiazanie.mjs`** — `node scripts/sprawdz-rozwiazanie.mjs 3-1-kod-pocztowy < schemat.json` wypisuje dokładnie to, co widzi uczestnik: sekcja „Schemat:” (diagnoza), „Przykłady:” (`✓/✗ opis — Przechodzi/Odrzucony — powód/wskazówka`), „Wynik: zaliczone / niezaliczone”. Dla rodzaju 4 stdin to JSON `{ "zamowienie": "...tekst...", ... }`; dla 3 JSON z tablicą booleanów; flaga `--formaty`.
- [ ] **Krok 4: Testy przechodzą, commit** — „Rdzeń: sprawdzanie ćwiczenia i skrypt sprawdz-rozwiazanie”.

---

### Task 7: UI — stan, router, widoki start / moduł / wykład, edytor

**Files:**
- Create: `trener/ui/stan.js`, `trener/ui/router.js`, `trener/ui/html.js`, `trener/ui/widoki/start.js`, `trener/ui/widoki/modul.js`, `trener/ui/widoki/wyklad.js`, `trener/ui/schemat-podpowiedzi.json`, `tests/stan.test.mjs`
- Modify: `trener/ui/main.js`, `trener/ui/edytor.js`, `trener/ui/style.css`, `trener/index.html`

**Interfaces:**
- `stan.js`: `wczytajStan()` → obiekt (domyślny `{ edytory: {}, zaliczone: {}, odpowiedzi: {}, duzyTekst: false, motyw: 'auto', formaty: false }`), `zapiszStan(stan)` (debounce 300 ms, try/catch), `ustaw(sciezka, wartosc)`; bez dostępu do `window` poza `localStorage` przekazywanym jako parametr (`wczytajStan(magazyn = globalThis.localStorage)`), żeby test w Node mógł podać atrapę rzucającą wyjątek.
- `router.js`: `parsujTrase(hash)` → `{ widok: 'start'|'modul'|'cwiczenie'|'piaskownica'|'generator', nr?, zakladka?, kotwica?, id? }`; `naTrase(fn)`; `idz(trasa)`.
- `html.js`: `esc`, `md` (inline: `` ` `` → `<code>`, `**` → `<strong>`), `h(tag, atrybuty, dzieci)`.
- `edytor.js` dodatkowo: `zamienTresc(edytor, tekst)` przez `executeEdits` (Ctrl+Z działa), `ustawMarkery(edytor, lista)` (offsety → `Range`, `monaco.editor.setModelMarkers(model, 'trener', ...)`), `skonfigurujPodpowiedzi(schematPodpowiedzi)` (`jsonDefaults.setDiagnosticsOptions({ validate: false, enableSchemaRequest: false, schemas: [{ uri: 'https://json-schema.org/draft/2020-12/schema', fileMatch: ['*'], schema }] })`; jeśli podpowiedzi po wyłączeniu `validate` nie działają, `validate: true` + `monaco.editor.onDidChangeMarkers` filtrujący właściciela `json`).
- `schemat-podpowiedzi.json`: spłaszczony 2020-12 (draft-07 składnia dla language service: `definitions` + `$ref` rekurencyjny) ze wszystkimi słowami z `ZNANE_SLOWA` i polskimi `markdownDescription` (jedno zdanie, np. „`required` — lista nazw pól, które muszą wystąpić w obiekcie.”).

- [ ] **Krok 1: Test `stan.js`** — atrapa magazynu rzucająca w `getItem`/`setItem` → `wczytajStan` zwraca domyślny stan, `zapiszStan` nie rzuca; atrapa działająca → zapis i odczyt w obie strony.
- [ ] **Krok 2: Implementacja stanu, routera, html.**
- [ ] **Krok 3: Widoki** — `start.js` renderuje listę modułów z `public/tresc/kurs.json` (`fetch` z `import.meta.env.BASE_URL + 'tresc/kurs.json'`); `modul.js` pobiera `modul-<nr>.json`, zakładki Wykład/Ćwiczenia; `wyklad.js` wstawia `html` wykładu, obsługuje `data-otworz` → `idz({ widok: 'piaskownica', z: { modul: nr, kotwica, przyklad } })`, przewija do kotwicy. Pasek górny w `main.js`: tytuł, link do startu, przełączniki (klasy `duzy-tekst`, `motyw-ciemny` na `<html>`; `formaty` w stanie).
- [ ] **Krok 4: Styl** — zmienne CSS: `--tlo`, `--tekst`, `--akcent`, `--ok`, `--blad`, `--ostrz`; `html.motyw-ciemny` i `@media (prefers-color-scheme: dark)` gdy `motyw === 'auto'`; `html.duzy-tekst { font-size: 125% }` + większy font Monaco (opcja `fontSize` ustawiana przy przełączeniu, `editor.updateOptions`). Układ: pasek górny sticky, treść `max-width: 72rem`, wykład `max-width: 48rem` dla czytelności.
- [ ] **Krok 5: `npm run build`, sprawdź w preview: start → moduł 3 → wykład → „Otwórz w edytorze” (na razie prowadzi do pustej piaskownicy z komunikatem „wkrótce”). Commit** — „UI: stan, router, start, moduł, wykład, podpowiedzi Monaco”.

---

### Task 8: UI — ćwiczenie rodzaju 1 i piaskownica

**Files:**
- Create: `trener/ui/widoki/cwiczenie.js`, `trener/ui/widoki/cwiczenie-schemat.js`, `trener/ui/widoki/piaskownica.js`, `trener/ui/widoki/przyklady.js`
- Modify: `trener/ui/main.js`, `trener/ui/style.css`

**Interfaces:**
- `cwiczenie.js`: `renderujCwiczenie(kontener, modul, cw, stan)` — wspólna rama (lewa kolumna: numer, tytuł, gwiazdki, czas, kontekst, polecenie, słowa, Podpowiedź, Rozwiązanie z „Wstaw do edytora”, „Zacznij od nowa”); wybiera wariant po `cw.rodzaj` z mapy `{ 1: cwiczenieSchemat, 5: cwiczenieSchemat, 2: cwiczenieDokument, 3: cwiczenieZgadnij, 4: cwiczenieProjekt }`; każdy wariant to `({ srodek, prawa, cw, stan, wynik$ }) => { zniszcz() }` gdzie `wynik$` to funkcja, przez którą wariant zgłasza `{ zaliczone }` do ramy (rama zapisuje `stan.zaliczone[cw.id]`, pokazuje „Zaliczone” i „Następne ćwiczenie”).
- `przyklady.js`: `renderujPrzyklady(kontener, wynik.przyklady)` — grupy „Muszą przejść” / „Muszą zostać odrzucone”, karty z `ladnie(dane)`, chip Przechodzi/Odrzucony/czeka, powód, wskazówka, pasek postępu.
- `cwiczenie-schemat.js`: edytor Monaco z `stan.edytory[cw.id] ?? cw.start`; na zmianę (debounce 180 ms) `sprawdzCwiczenie(cw, { schemat }, { formaty: stan.formaty })` → markery z diagnozy + lista diagnozy pod edytorem + `renderujPrzyklady`.
- `piaskownica.js`: dwa edytory (schemat, dokument), werdykt dokumentu z listą komunikatów; przyjmuje `z` z trasy (schemat i dokument z przykładu wykładu) i przycisk „Wróć do wykładu”; domyślna zawartość: schemat zamówienia z `docs/domena.md` w wersji z modułu 3.

- [ ] **Krok 1: Implementacja wszystkich plików.** Zasada: wariant nie dotyka localStorage bezpośrednio, tylko przez `stan`.
- [ ] **Krok 2: Test ręczny w preview**: 3-1: start pokazuje 2 czerwone wskazówki; dodanie `^` i `$` → „Zaliczone”; wstawienie rozwiązania i Ctrl+Z przywraca; przełącznik formatów zmienia werdykt w piaskownicy dla `format: email`; odświeżenie strony zachowuje treść edytora.
- [ ] **Krok 3: Commit** — „UI: ćwiczenie ze schematem, przykłady, piaskownica”.

---

### Task 9: UI — ćwiczenia rodzaju 2 (napraw JSON) i 3 (zgadnij, potem sprawdź)

**Files:**
- Create: `trener/ui/widoki/cwiczenie-dokument.js`, `trener/ui/widoki/cwiczenie-zgadnij.js`

- [ ] **Krok 1: `cwiczenie-dokument.js`** — jeden edytor z `cw.start`; na zmianę `sprawdzCwiczenie(cw, { dokument })`; marker błędu składni + komunikat z przyciskiem „linia N” (ustawia kursor); gdy brak błędów i jest `cw.schemat`: lista komunikatów walidacji; `zaliczone` → rama.
- [ ] **Krok 2: `cwiczenie-zgadnij.js`** — środek: edytor tylko do odczytu ze `cw.schemat`; prawa: karty dokumentów z dwoma przyciskami radio „przejdzie” / „nie przejdzie” (stan w `stan.odpowiedzi[cw.id]`), przycisk „Sprawdź” aktywny po odpowiedzi na wszystkie; po sprawdzeniu karta dostaje kolor (trafione/nietrafione), prawdziwy werdykt i `wyjasnienie`; „Spróbuj jeszcze raz” czyści odpowiedzi; `zaliczone` = wszystkie trafione.
- [ ] **Krok 3: Test ręczny: 3-2 pokazuje błąd w linii z `12,50`, po trzech poprawkach zaliczone; 3-3 po odpowiedziach odsłania werdykty.**
- [ ] **Krok 4: Commit** — „UI: ćwiczenia napraw JSON i zgadnij-sprawdź”.

---

### Task 10: UI — projekt wielu plików i diagram zależności

**Files:**
- Create: `trener/ui/widoki/cwiczenie-projekt.js`, `trener/ui/diagram.js`, `tests/diagram.test.mjs`

**Interfaces:**
- `diagram.js`: `rysujDiagram({ pliki: string[], glowny, odwolania: [{ zPliku, ref, doPliku|null }], bledy: string[] })` → string SVG. Czysta funkcja (testowalna w Node): węzły w rzędzie/siatce, główny pogrubiony, strzałki; zepsute odwołanie jako czerwona przerywana strzałka do węzła „?” z etykietą `ref`.

- [ ] **Krok 1: Test diagramu** — wynik zawiera `<svg`, jeden `<text>` na plik, klasa `zepsute` dla `doPliku: null`.
- [ ] **Krok 2: `cwiczenie-projekt.js`** — zakładki plików nad edytorem (główny z oznaczeniem „główny”), jeden edytor Monaco z modelem na plik (`monaco.editor.createModel` per plik, `editor.setModel`); stan edytorów pod `stan.edytory[cw.id + '/' + nazwa]`; na zmianę `sprawdzCwiczenie(cw, { pliki })`; diagnoza z `plik` pokazuje nazwę i przycisk przełączający zakładkę; prawa kolumna: przykłady + diagram + „Jak to widzi walidator”: lista `nazwa → $id`. Klik w `$ref` w edytorze: `editor.onMouseDown` → jeśli słowo pod kursorem to wartość `$ref` rozwiązująca się na plik, przełącz zakładkę (prosty wariant: `monaco.languages.registerLinkProvider('json', …)` tworzący linki dla wartości `$ref` z `url` jako `#plik:nazwa`, obsłużone w `editor.onDidChangeModelContent`… wybierz prostszy: link provider + `monaco.editor.registerLinkOpener`).
- [ ] **Krok 3: Test ręczny: 3-4 pokazuje czerwoną strzałkę do „klinet”, po poprawie `$ref` diagram zielony i przykłady liczone.**
- [ ] **Krok 4: Commit** — „UI: projekt z wieloma plikami i diagram zależności”.

---

### Task 11: Generator schematów w stylu genson

**Files:**
- Create: `trener/rdzen/generator.js`, `trener/ui/widoki/generator.js`, `tests/generator.test.mjs`

**Interfaces:**
- `generujSchemat(wartosci: any[])` → schemat 2020-12 (`$schema` ustawiony). Reguły jak genson: typ z wartości (`integer` gdy wszystkie całkowite, `number` gdy mieszane), obiekt → `properties` z rekurencją i `required` = klucze obecne we **wszystkich** przykładach, tablica → `items` z połączeniem typów elementów, różne typy → `anyOf` typów (albo `type: [..]` gdy same typy proste), `null` jako typ.

- [ ] **Krok 1: Testy** — `[{a:1},{a:2,b:'x'}]` → `required: ['a']`, `b` string; `[1, 2.5]` → `number`; `[1, 'a']` → `type: ['integer','string']` w kolejności wystąpienia; `[{x:null},{x:'a'}]` → `type: ['null','string']`; `[[1,2],[3]]` → `items: { type: 'integer' }`.
- [ ] **Krok 2: Implementacja. Krok 3: Widok** — lewy edytor „Wklej jeden albo kilka dokumentów JSON (kilka: tablica)”, prawy tylko do odczytu z wynikiem, przycisk „Otwórz w piaskownicy”.
- [ ] **Krok 4: Commit** — „Generator schematów z przykładów”.

---

### Task 12: Motywy, „Duży tekst”, wąski ekran, odporność localStorage

**Files:**
- Modify: `trener/ui/style.css`, `trener/ui/main.js`, `trener/ui/edytor.js`

- [ ] **Krok 1:** motyw Monaco przełączany razem z motywem strony (`monaco.editor.setTheme('vs' | 'vs-dark')`); „Duży tekst” → `fontSize` 18 w edytorach.
- [ ] **Krok 2:** `@media (max-width: 900px)`: trzy kolumny → jedna, edytor min. wysokość 18rem; pasek górny zawija przełączniki.
- [ ] **Krok 3:** test ręczny w preview z `Object.defineProperty(window, 'localStorage', { get() { throw new Error('x') } })` w konsoli przed przeładowaniem (przez DevTools „Override”) albo w trybie incognito z blokadą danych: aplikacja startuje.
- [ ] **Krok 4: Commit** — „UI: motywy, duży tekst, wąski ekran”.

---

### Task 13: Materiały statyczne (HTML + PDF) i workflow „Materiały”

**Files:**
- Create: `scripts/zbuduj-materialy.mjs`, `materialy/szablon.html`, `materialy/styl.css`, `.github/workflows/materialy.yml`, `tests/materialy.test.mjs`

**Interfaces:**
- `zbudujMaterialyHtml(kurs)` (eksport) → string HTML; program zapisuje `materialy/wynik/kurs.html` i `kurs.pdf`.

- [ ] **Krok 1: Test** — HTML zawiera każdy nagłówek z `modul.json.zakres` jako `<h2>`/`<h3>`, każde ćwiczenie jako sekcję z poleceniem i przykładami z policzonym werdyktem, a rozwiązania wyłącznie w sekcji `<section id="rozwiazania">` na końcu; ściągawka: tabela słów kluczowych z `schemat-podpowiedzi.json` (słowo, opis, kolumna „w draft-07” z mapy w skrypcie: `$defs→definitions`, `prefixItems→items (tablica)`, `dependentRequired→dependencies`, `exclusiveMinimum (liczba)→exclusiveMinimum: true + minimum`).
- [ ] **Krok 2: Implementacja** — szablon z `{{tresc}}`; styl do druku (`@page { size: A4; margin: 2cm }`, `break-before: page` przed modułem); PDF: `chromium.launch()` → `page.setContent(html)` → `page.pdf({ path, format: 'A4', printBackground: true })`. Lokalnie `npx playwright install chromium` raz.
- [ ] **Krok 3: Workflow**

```yaml
name: Materiały
on: { workflow_dispatch: {} }
jobs:
  materialy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run tresc && npm run materialy
      - uses: actions/upload-artifact@v4
        with: { name: materialy, path: materialy/wynik/ }
```

- [ ] **Krok 4: Uruchom `gh workflow run Materiały`, pobierz artefakt `gh run download`, obejrzyj PDF (Read). Commit** — „Materiały: HTML i PDF z jednego źródła treści”.

---

### Task 14: Ajv kontra oficjalny zestaw testów, CLAUDE.md, README

**Files:**
- Create: `scripts/testuj-ajv-spec.mjs`, `tests/znane-odstepstwa.json`, `tests/ajv-spec.test.mjs`
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Krok 1: Skrypt** — ładuje `spec/tests/draft2020-12/*.json` (bez `optional/`), rejestruje `spec/tests/remotes/**` pod `http://localhost:1234/<ścieżka>` przez `addSchema`, metaschematy z `spec/metaschematy` są w Ajv wbudowane; dla każdego testu porównuje `ajv.validate` z `valid`; wypisuje listę niezgodnych jako `plik#opis#test`. Zapisz wynik do `tests/znane-odstepstwa.json`. Test `ajv-spec.test.mjs` uruchamia to samo i oblewa, gdy pojawia się odstępstwo spoza listy (regresja) lub gdy coś z listy zaczęło przechodzić (lista do odchudzenia).
- [ ] **Krok 2: CLAUDE.md** — w „Architektura techniczna” zastąp punkt o `vendor/` opisem: npm + `package-lock.json`, Vite buduje wszystko do `dist/`, zero CDN; dodaj decyzję o polskich identyfikatorach w kodzie; w „Otwarte kwestie” usuń konwencję nazewnictwa, strukturę strony (zrealizowana w prototypie, do oceny) i generator (zrobiony); w „Proponowana struktura” zamień `vendor/` na `public/`, dodaj `docs/superpowers/`.
- [ ] **Krok 3: README** — jak uruchomić lokalnie, jak publikować, jak zbudować materiały, adres Pages.
- [ ] **Krok 4: Commit, push, `gh run watch`, sprawdź adres Pages w przeglądarce.**
