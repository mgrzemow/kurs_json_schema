import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprawdzPiaskownice } from '../trener/rdzen/sprawdz-cwiczenie.js';

test('piaskownica: zgodny dokument', () => {
  const w = sprawdzPiaskownice('{ "type": "integer" }', '36');
  assert.equal(w.werdykt, true);
  assert.deepEqual(w.komunikaty, []);
  assert.deepEqual(w.diagnozaSchematu, []);
});

test('piaskownica: niezgodny dokument z polskimi komunikatami', () => {
  const w = sprawdzPiaskownice('{ "required": ["numer"] }', '{}');
  assert.equal(w.werdykt, false);
  assert.match(w.komunikaty[0], /Brakuje wymaganego pola „numer”/);
});

test('piaskownica: zepsuty schemat → werdykt null, diagnoza schematu', () => {
  const w = sprawdzPiaskownice('{ "type": ', '{}');
  assert.equal(w.werdykt, null);
  assert.equal(w.diagnozaSchematu[0].poziom, 'blad');
});

test('piaskownica: zepsuty dokument → werdykt null, diagnoza dokumentu z linią', () => {
  const w = sprawdzPiaskownice('{}', '{\n "a": tak }');
  assert.equal(w.werdykt, null);
  assert.equal(w.diagnozaDokumentu[0].linia, 2);
});

test('piaskownica: przełącznik formatów', () => {
  assert.equal(sprawdzPiaskownice('{ "format": "email" }', '"jan@"', { formaty: false }).werdykt, true);
  assert.equal(sprawdzPiaskownice('{ "format": "email" }', '"jan@"', { formaty: true }).werdykt, false);
});

test('piaskownica: błędny schemat (zły regex) → werdykt null i diagnoza schematu, bez wyjątku (C1)', () => {
  const w = sprawdzPiaskownice('{ "pattern": "[" }', '"a"');
  assert.equal(w.werdykt, null);
  assert.equal(w.diagnozaSchematu[0].poziom, 'blad');
  assert.match(w.diagnozaSchematu[0].tekst, /wyrażeniem regularnym/);
});

test('piaskownica: nieoczekiwany wyjątek Ajv zamieniony na diagnozę (I1)', () => {
  for (const s of ['{ "$schema": "https://json-schema.org/draft/2020-12/schema-x" }', '{ "$schema": 5 }', '{ "$dynamicRef": "#x" }', '{ "enum": [] }']) {
    const w = sprawdzPiaskownice(s, '1');
    assert.ok(w.werdykt === null || w.werdykt === true || w.werdykt === false, s);
    if (w.werdykt === null) assert.equal(w.diagnozaSchematu[0].poziom, 'blad', s);
  }
});
