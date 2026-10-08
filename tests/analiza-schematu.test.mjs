import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizujSchemat, ZNANE_SLOWA } from '../trener/rdzen/analiza-schematu.js';
import { parsujJSON } from '../trener/rdzen/parser-json.js';

const analizuj = t => {
  const { wartosc, klucze } = parsujJSON(t);
  return analizujSchemat(wartosc, klucze);
};

test('literówka w słowie kluczowym podpowiada najbliższe', () => {
  const u = analizuj('{"requried": ["a"]}');
  assert.equal(u[0].poziom, 'ostrz');
  assert.match(u[0].tekst, /Czy chodziło o „required”/);
});

test('nieznane słowo z obiektem sugeruje properties', () => {
  assert.match(analizuj('{"numer": {"type": "string"}}')[0].tekst, /przenieś je do „properties”/);
});

test('required bez odpowiednika w properties', () => {
  assert.match(analizuj('{"properties": {"a": {}}, "required": ["b"]}')[0].tekst, /„b” jest w „required”/);
});

test('format to informacja, nie ostrzeżenie', () => {
  const u = analizuj('{"format": "email"}');
  assert.equal(u[0].poziom, 'info');
  assert.match(u[0].tekst, /tylko opis/);
});

test('pos wskazuje na słowo', () => {
  assert.equal(analizuj('{"requried": []}')[0].pos, 1);
});

test('poprawny schemat nie ma uwag', () => {
  assert.deepEqual(analizuj('{"type": "string", "minLength": 1}'), []);
});

test('zagnieżdżone schematy też są sprawdzane', () => {
  const u = analizuj('{"properties": {"a": {"minimun": 1}}}');
  assert.match(u[0].tekst, /„minimum”/);
});

test('ZNANE_SLOWA zawiera rdzeń 2020-12', () => {
  for (const s of ['$defs', 'prefixItems', 'dependentRequired', 'unevaluatedProperties', '$dynamicRef']) assert.ok(ZNANE_SLOWA.has(s), s);
});
