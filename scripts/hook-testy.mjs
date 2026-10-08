// Hook Claude Code: uruchamia testy po edycji plików w tresc/
// (PostToolUse) albo przed zakończeniem pracy, gdy są niezacommitowane zmiany (Stop).
// Nieprzechodzące testy wracają jako błąd (kod wyjścia 2).
import { spawnSync } from 'node:child_process';

const stop = process.argv.includes('--stop');
let wejscie = '';
try { wejscie = (await import('node:fs')).readFileSync(0, 'utf8'); } catch (_) { /* brak stdin */ }

// Po edycji: tylko treść (zmiany w kodzie testuje się w cyklu TDD). Przed zakończeniem: wszystko.
const PO_EDYCJI = /(^|[\\/])tresc[\\/]/;
const PRZED_KONCEM = /(^|[\\/])(tresc|trener|scripts|tests)[\\/]/;

if (!stop) {
  let sciezka = '';
  try { sciezka = JSON.parse(wejscie || '{}').tool_input?.file_path || ''; } catch (_) { /* nie JSON */ }
  if (!PO_EDYCJI.test(sciezka)) process.exit(0);
} else {
  const st = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).stdout || '';
  if (!st.split('\n').some(l => PRZED_KONCEM.test(l.slice(3)))) process.exit(0);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const wynik = spawnSync(npm, ['test', '--silent'], { encoding: 'utf8', shell: process.platform === 'win32' });
if (wynik.status === 0) process.exit(0);
const linie = (wynik.stdout + '\n' + wynik.stderr).split('\n').filter(l => /^✖|not ok|Error|expected|actual|^ℹ (pass|fail)/.test(l)).slice(0, 40);
console.error('Testy nie przechodzą:\n' + linie.join('\n'));
process.exit(2);
