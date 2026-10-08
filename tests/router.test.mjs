import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujTrase, hashTrasy } from '../trener/ui/router.js';

test('trasy w obie strony', () => {
  for (const t of [{ widok: 'start' }, { widok: 'modul', nr: 3, zakladka: 'wyklad', kotwica: null }, { widok: 'modul', nr: 3, zakladka: 'cwiczenia' }, { widok: 'cwiczenie', nr: 3, id: '3-1-kod-pocztowy' }, { widok: 'piaskownica' }, { widok: 'piaskownica', z: { nr: 3, schemat: 'status', dokument: null, kotwica: 'sekcja-a' } }, { widok: 'generator' }]) {
    const z = parsujTrase(hashTrasy(t));
    assert.equal(z.widok, t.widok);
    if (t.nr) assert.equal(z.nr, t.nr);
    if (t.id) assert.equal(z.id, t.id);
    if (t.z) assert.deepEqual(z.z, t.z);
  }
});

test('zepsuty adres (niepoprawne %) nie rzuca, prowadzi na start', () => {
  assert.doesNotThrow(() => parsujTrase('#/m/3/cw/%E0%A4%A'));
  assert.equal(parsujTrase('#/m/3/cw/%E0%A4%A').widok, 'start');
  assert.equal(parsujTrase('#/cokolwiek/innego').widok, 'start');
});
