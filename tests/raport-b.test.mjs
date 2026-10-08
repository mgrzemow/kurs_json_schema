// Komunikaty trenera poprawione po raporcie uczestnika B (2026-10-08).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizujSchemat } from '../trener/rdzen/analiza-schematu.js';
import { utworzWalidator, BladSchematu } from '../trener/rdzen/walidator.js';

const wal = utworzWalidator({ formaty: false });

test('required w gałęzi oneOf bez properties nie daje fałszywego ostrzeżenia', () => {
  const s = { type: 'object', required: ['typ'], oneOf: [
    { properties: { typ: { const: 'przelew' } }, required: ['numerKonta'] },
    { properties: { typ: { const: 'karta' } }, required: ['token'] } ] };
  assert.deepEqual(analizujSchemat(s).filter(u => u.poziom === 'ostrz'), []);
});

test('required bez properties na zwykłym poziomie nadal ostrzega', () => {
  assert.equal(analizujSchemat({ properties: { a: {} }, required: ['b'] }).length, 1);
});

test('słowa z draft-07 dostają informację o odpowiedniku w 2020-12', () => {
  for (const [slowo, nowe] of [['definitions', '$defs'], ['dependencies', 'dependentRequired'], ['additionalItems', 'prefixItems']]) {
    const u = analizujSchemat({ [slowo]: {} });
    assert.ok(u.some(x => x.poziom === 'info' && x.tekst.includes(nowe) && /draft/.test(x.tekst)), slowo);
  }
});

test('exclusiveMinimum: true — komunikat wskazuje zapis z draft-04', () => {
  assert.throws(() => wal.kompiluj({ minimum: 0, exclusiveMinimum: true }), e => e instanceof BladSchematu && /draft-04/.test(e.message) && /"exclusiveMinimum": 0/.test(e.message));
});

test('items jako tablica — komunikat wskazuje prefixItems', () => {
  assert.throws(() => wal.kompiluj({ items: [{ type: 'number' }] }), e => /prefixItems/.test(e.message) && /draft-07/.test(e.message));
});

test('zepsuty JSON Pointer — komunikat o ścieżce, nie o nazwie w $defs', () => {
  assert.throws(() => wal.kompiluj({ $ref: '#/$defs/adres/kodPocztowy', $defs: { adres: { properties: { kodPocztowy: {} } } } }),
    e => /ścieżk/.test(e.message) && !/Sprawdź nazwę w „\$defs”/.test(e.message));
});

test('względny $id w projekcie — komunikat mówi, że ma być pełnym adresem', () => {
  const pliki = { zamowienie: { wartosc: { $id: 'https://kurs.example/schematy/zamowienie', properties: { p: { $ref: 'produkt' } } } }, produkt: { wartosc: { $id: 'produkt' } } };
  assert.throws(() => wal.kompilujProjekt(pliki, 'zamowienie'), e => e.plik === 'produkt' && /pełn/.test(e.message));
});
