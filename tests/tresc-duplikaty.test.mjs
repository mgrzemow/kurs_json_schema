// I4: skrypt budowania odrzuca pliki treści z duplikatem klucza.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { czytajJSON } from '../scripts/zbuduj-tresc.mjs';

test('czytajJSON odrzuca duplikat klucza z nazwą pliku i klucza', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tresc-'));
  const p = join(dir, 'start.json');
  writeFileSync(p, '{ "a": 1, "a": 2 }');
  assert.throws(() => czytajJSON(p), e => /start\.json/.test(e.message) && /„a”/.test(e.message) && /dwa razy/.test(e.message));
  writeFileSync(p, '{ "a": 1 }');
  assert.deepEqual(czytajJSON(p), { a: 1 });
});
