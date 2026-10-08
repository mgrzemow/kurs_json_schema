// Ćwiczenie końcowe: schemat startowy ma być dosłownym wynikiem genson z plików w dane/.
// Gdy genson nie jest dostępny (brak Pythona albo pakietu), test jest pomijany.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../tresc/moduly/08-nie-musicie-pisac-od-zera/cwiczenia/8-1-popraw-wygenerowany/', import.meta.url);
const katalog = decodeURIComponent(dir.pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dane = readdirSync(join(katalog, 'dane')).filter(f => f.endsWith('.json')).sort().map(f => join(katalog, 'dane', f));

function genson() {
  for (const py of ['python', 'python3', 'py']) {
    const w = spawnSync(py, ['-I', '-m', 'genson', '-i', '2', ...dane], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
    if (w.status === 0 && w.stdout.trim().startsWith('{')) return w.stdout;
  }
  return null;
}

const wynik = genson();
test('start.json ćwiczenia końcowego równa się wynikowi genson', { skip: wynik === null ? 'genson niedostępny' : false }, () => {
  const start = JSON.parse(readFileSync(join(katalog, 'start.json'), 'utf8'));
  assert.deepEqual(start, JSON.parse(wynik));
});
