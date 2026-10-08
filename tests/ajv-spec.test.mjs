// Regresja: Ajv w konfiguracji trenera kontra oficjalny zestaw testów 2020-12.
// Oblewa, gdy pojawi się nowe odstępstwo (regresja) albo gdy znane odstępstwo zniknęło
// (lista w tests/znane-odstepstwa.json jest do odchudzenia: uruchom scripts/testuj-ajv-spec.mjs --zapisz).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uruchomZestaw } from '../scripts/testuj-ajv-spec.mjs';

const znane = JSON.parse(readFileSync(new URL('./znane-odstepstwa.json', import.meta.url), 'utf8'));

test('Ajv kontra oficjalny zestaw testów: tylko znane odstępstwa', () => {
  const { liczba, niezgodne } = uruchomZestaw();
  assert.ok(liczba > 1000, 'zestaw wczytany');
  const nowe = niezgodne.filter(n => !znane.odstepstwa.includes(n));
  const zniknely = znane.odstepstwa.filter(n => !niezgodne.includes(n));
  assert.deepEqual(nowe, [], 'nowe odstępstwa (regresja)');
  assert.deepEqual(zniknely, [], 'znane odstępstwa, które już nie występują — zaktualizuj listę');
});
