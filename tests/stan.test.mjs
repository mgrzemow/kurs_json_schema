import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wczytajStan, zapiszStan, utworzStan, KLUCZ_STANU } from '../trener/ui/stan.js';

const atrapaZla = { getItem() { throw new Error('brak dostępu'); }, setItem() { throw new Error('brak dostępu'); } };
const atrapaPamiec = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m }; };

test('niedostępny magazyn daje stan domyślny i nie rzuca', () => {
  const s = wczytajStan(atrapaZla);
  assert.equal(s.formaty, false);
  assert.deepEqual(s.zaliczone, {});
  assert.doesNotThrow(() => zapiszStan(s, atrapaZla));
});

test('brak magazynu (null) też daje stan domyślny', () => {
  assert.equal(wczytajStan(null).motyw, 'auto');
});

test('zapis i odczyt w obie strony z przestrzenią nazw', () => {
  const m = atrapaPamiec();
  const s = wczytajStan(m);
  s.zaliczone['3-1'] = true;
  s.edytory['3-1'] = '{}';
  zapiszStan(s, m);
  assert.ok(m.m.has(KLUCZ_STANU));
  const s2 = wczytajStan(m);
  assert.equal(s2.zaliczone['3-1'], true);
  assert.equal(s2.edytory['3-1'], '{}');
});

test('uszkodzony zapis nie psuje startu', () => {
  const m = atrapaPamiec();
  m.setItem(KLUCZ_STANU, '{nie json');
  assert.equal(wczytajStan(m).duzyTekst, false);
});

test('utworzStan: ustaw zmienia stan i zapisuje z opóźnieniem', async () => {
  const m = atrapaPamiec();
  const { stan, ustaw } = utworzStan(m, 5);
  ustaw(s => { s.formaty = true; });
  assert.equal(stan.formaty, true);
  assert.ok(!m.m.has(KLUCZ_STANU), 'jeszcze nie zapisany');
  await new Promise(r => setTimeout(r, 20));
  assert.equal(JSON.parse(m.m.get(KLUCZ_STANU)).formaty, true);
});
