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
