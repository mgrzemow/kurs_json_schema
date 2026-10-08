// Oficjalny zestaw testów JSON Schema (spec/tests/draft2020-12, bez optional/) kontra Ajv
// w konfiguracji trenera. Wypisuje niezgodności; z flagą --zapisz aktualizuje
// tests/znane-odstepstwa.json. Eksportuje uruchomZestaw() dla testu regresji.
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const KORZEN = join(dirname(fileURLToPath(import.meta.url)), '..');
const TESTY = join(KORZEN, 'spec', 'tests', 'draft2020-12');
const ZDALNE = join(KORZEN, 'spec', 'tests', 'remotes');
const PLIK_ODSTEPSTW = join(KORZEN, 'tests', 'znane-odstepstwa.json');

function plikiRekurencyjnie(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? plikiRekurencyjnie(p) : [p];
  });
}

function nowyAjv() {
  // Ta sama konfiguracja, co w trener/rdzen/walidator.js (bez formatów: zestaw podstawowy ich nie wymaga).
  const ajv = new Ajv2020({ allErrors: true, strict: false, useDefaults: false, validateFormats: false, allowUnionTypes: true });
  addFormats(ajv);
  for (const p of plikiRekurencyjnie(ZDALNE)) {
    if (!p.endsWith('.json')) continue;
    const rel = relative(ZDALNE, p).replace(/\\/g, '/');
    const schemat = JSON.parse(readFileSync(p, 'utf8'));
    try { ajv.addSchema(schemat, 'http://localhost:1234/' + rel); } catch (_) { /* duplikat $id w remotes */ }
  }
  return ajv;
}

export function uruchomZestaw() {
  const niezgodne = [];
  let liczba = 0;
  for (const plik of readdirSync(TESTY).filter(f => f.endsWith('.json')).sort()) {
    const grupy = JSON.parse(readFileSync(join(TESTY, plik), 'utf8'));
    // Jedna instancja Ajv na plik; świeża tylko wtedy, gdy grupa ma $id już zarejestrowane.
    let ajv = nowyAjv();
    for (const g of grupy) {
      let fn;
      try {
        try {
          fn = ajv.compile(g.schema);
        } catch (e) {
          if (!/already exists/.test(String(e.message))) throw e;
          ajv = nowyAjv();
          fn = ajv.compile(g.schema);
        }
      } catch (e) {
        for (const t of g.tests) { liczba++; niezgodne.push(`${plik}#${g.description}#${t.description} (kompilacja: ${String(e.message).slice(0, 60)})`); }
        ajv = nowyAjv();
        continue;
      }
      for (const t of g.tests) {
        liczba++;
        let wynik;
        try { wynik = fn(t.data); } catch (e) { wynik = 'wyjątek: ' + e.message; }
        if (wynik !== t.valid) niezgodne.push(`${plik}#${g.description}#${t.description}`);
      }
    }
  }
  return { liczba, niezgodne };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { liczba, niezgodne } = uruchomZestaw();
  console.log(`Testów: ${liczba}, niezgodnych: ${niezgodne.length}`);
  for (const n of niezgodne) console.log('  ' + n);
  if (process.argv.includes('--zapisz')) {
    writeFileSync(PLIK_ODSTEPSTW, JSON.stringify({ ajv: JSON.parse(readFileSync(join(KORZEN, 'node_modules', 'ajv', 'package.json'), 'utf8')).version, liczbaTestow: liczba, odstepstwa: niezgodne }, null, 2) + '\n');
    console.log('Zapisano ' + PLIK_ODSTEPSTW);
  }
}
