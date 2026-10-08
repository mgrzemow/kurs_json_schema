// Rozszerzenia trenera wymagane przez konspekty (plan tresc-kursu, część A).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { sprawdzCwiczenie } from '../trener/rdzen/sprawdz-cwiczenie.js';
import { analizujSchemat } from '../trener/rdzen/analiza-schematu.js';
import { parsujWyklad } from '../scripts/wyklad-md.mjs';

const schematCwiczenia = JSON.parse(readFileSync(new URL('../tresc/schemat-cwiczenia.json', import.meta.url), 'utf8'));
const poprawne = new Ajv2020({ allErrors: true, strict: false }).compile(schematCwiczenia);
const baza = { id: '9-9', tytul: 'Test', poziom: 1, czasMin: 1, kolejnosc: 1, kontekst: 'Kontekst testowy.', polecenie: 'Polecenie testowe.', slowa: [], podpowiedz: 'Podpowiedź testowa.', zrodla: [{ twierdzenie: 'x', zrodlo: 'y' }] };

test('A1: formaty w ćwiczeniu wymusza tryb niezależnie od przełącznika', () => {
  const cw = { ...baza, rodzaj: 1, formaty: true, przyklady: [{ opis: 'e', dane: 'jan@', ok: false }], bledne: [] };
  assert.ok(poprawne({ ...cw, bledne: undefined }), JSON.stringify(poprawne.errors));
  const r = sprawdzCwiczenie(cw, { schemat: '{ "type": "string", "format": "email" }' }, { formaty: false });
  assert.equal(r.zaliczone, true);
  assert.equal(r.formaty, true);
  const cw2 = { ...cw, formaty: false };
  assert.equal(sprawdzCwiczenie(cw2, { schemat: '{ "type": "string", "format": "email" }' }, { formaty: true }).zaliczone, false);
});

test('A2: rodzaj 3 z wyjasnienieZFormatami', () => {
  const meta = { ...baza, rodzaj: 3, odpowiedzi: [{ opis: 'x', dane: 'jan@', ok: true, wyjasnienie: 'bez', wyjasnienieZFormatami: 'z' }] };
  assert.ok(poprawne(meta), JSON.stringify(poprawne.errors));
  const cw = { ...meta, schemat: { type: 'string', format: 'email' } };
  assert.equal(sprawdzCwiczenie(cw, { odpowiedzi: [true] }, { formaty: false }).przyklady[0].wyjasnienie, 'bez');
  const z = sprawdzCwiczenie(cw, { odpowiedzi: [false] }, { formaty: true });
  assert.equal(z.przyklady[0].wyjasnienie, 'z');
  assert.equal(z.przyklady[0].przeszedl, false);
  assert.equal(z.zaliczone, true);
});

test('A3: nieznany format daje ostrzeżenie, znany nie', () => {
  const u = analizujSchemat({ type: 'string', format: 'telefon' }, new Map(), { formaty: true });
  assert.ok(u.some(d => d.poziom === 'ostrz' && /„telefon”/.test(d.tekst) && /pattern/.test(d.tekst)));
  const z = analizujSchemat({ type: 'string', format: 'email' }, new Map(), { formaty: true });
  assert.ok(!z.some(d => d.poziom === 'ostrz'));
});

test('A4: rodzaj 5 z listą kontrolną przechodzi schemat ćwiczenia', () => {
  const cw = { ...baza, rodzaj: 5, listaKontrolna: ['$schema na 2020-12', 'required według wymagań'], przyklady: [{ opis: 'x', dane: 1, ok: true }] };
  assert.ok(poprawne(cw), JSON.stringify(poprawne.errors));
});

test('A5: lustro — dwa bloki obok siebie z kolorami poziomów', () => {
  const md = '```json lustro=klient strona=dokument\n{\n  "klient": {\n    "nazwa": "x"\n  }\n}\n```\n\n```json lustro=klient strona=schemat\n{\n  "properties": {\n    "klient": {\n      "type": "object"\n    }\n  }\n}\n```\n';
  const w = parsujWyklad(md);
  assert.match(w.html, /<div class="lustro"/);
  assert.equal((w.html.match(/class="lustro-czesc/g) || []).length, 2);
  assert.match(w.html, /class="poziom-1"/);
  assert.match(w.html, /class="poziom-2"/);
  assert.ok(!/Otwórz w edytorze/.test(w.html));
});
