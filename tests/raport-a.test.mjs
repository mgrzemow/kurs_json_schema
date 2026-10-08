// Komunikaty trenera poprawione po raporcie uczestnika A (2026-10-08).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizujSchemat } from '../trener/rdzen/analiza-schematu.js';
import { utworzWalidator } from '../trener/rdzen/walidator.js';
import { parsujJSON } from '../trener/rdzen/parser-json.js';

test('komentarz w JSON: rada pasuje i do schematu, i do dokumentu', () => {
  assert.throws(() => parsujJSON('{"a": 1 // pilne\n}'), e => /komentarz/.test(e.message) && /dokumencie/.test(e.message));
});

test('required wewnątrz properties: komunikat każe przenieść poziom wyżej', () => {
  assert.throws(() => utworzWalidator().kompiluj({ type: 'object', properties: { numer: { type: 'string' }, required: ['numer'] } }),
    e => /obok „properties”/.test(e.message));
});

test('ścieżki kropkowe w required: komunikat o braku ścieżek', () => {
  const u = analizujSchemat({ properties: { klient: {} }, required: ['klient.adres.miasto'] });
  assert.ok(u.some(x => /kropk/.test(x.tekst) && /ścieżk/.test(x.tekst)), JSON.stringify(u));
});

test('required obok items na liście: ostrzeżenie', () => {
  const u = analizujSchemat({ type: 'array', items: { properties: { ean: {} } }, required: ['ean'] });
  assert.ok(u.some(x => x.poziom === 'ostrz' && /items/.test(x.tekst)), JSON.stringify(u));
});

test('literówka w nazwie formatu: podpowiedź najbliższego', () => {
  const u = analizujSchemat({ type: 'string', format: 'datetime' });
  assert.ok(u.some(x => /„date-time”/.test(x.tekst)), JSON.stringify(u));
});
