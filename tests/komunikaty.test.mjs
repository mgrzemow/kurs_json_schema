import { test } from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import { komunikat, komunikaty } from '../trener/rdzen/komunikaty.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });
const sprawdz = (schemat, dane) => {
  const f = ajv.compile(schemat);
  f(dane);
  return komunikaty(f.errors || [], dane);
};

test('required', () => {
  assert.deepEqual(sprawdz({ required: ['numer'] }, {}), ['Brakuje wymaganego pola „numer”.']);
});

test('type w zagnieżdżeniu z numerem elementu', () => {
  const s = { properties: { pozycje: { items: { properties: { ilosc: { type: 'integer' } } } } } };
  assert.deepEqual(sprawdz(s, { pozycje: [{ ilosc: 1 }, { ilosc: '2' }] }),
    ['Pole „ilosc” w elemencie nr 2: oczekiwano liczby całkowitej, a jest tekst.']);
});

test('pattern', () => {
  assert.match(sprawdz({ pattern: '^\\d{2}-\\d{3}$' }, '123')[0], /nie pasuje do wzorca/);
});

test('oneOf z dwiema pasującymi opcjami', () => {
  assert.match(sprawdz({ oneOf: [{ type: 'string' }, { minLength: 1 }] }, 'a')[0], /kilku opcji/);
});

test('additionalProperties', () => {
  assert.deepEqual(sprawdz({ additionalProperties: false }, { adrs: 1 }), ['Pole „adrs” nie jest przewidziane w schemacie.']);
});

test('enum wypisuje krótką listę', () => {
  assert.match(sprawdz({ enum: ['nowe', 'oplacone'] }, 'x')[0], /"nowe", "oplacone"/);
});

test('minimum na granicy', () => {
  assert.match(sprawdz({ minimum: 36 }, 35)[0], /35 to mniej niż dozwolone minimum 36/);
});

test('komunikaty nie powtarzają się i respektują limit', () => {
  const s = { properties: { a: { type: 'string' }, b: { type: 'string' }, c: { type: 'string' } } };
  const f = ajv.compile(s);
  f({ a: 1, b: 2, c: 3 });
  assert.equal(komunikaty(f.errors, { a: 1, b: 2, c: 3 }, 2).length, 2);
});

test('nazwa pliku w komunikacie', () => {
  const f = ajv.compile({ required: ['a'] });
  f({});
  assert.match(komunikat(f.errors[0], {}, { plik: 'adres' }), /reguła z pliku „adres”\)\.$/);
});
