// Kompiluje tresc/ do public/tresc/*.json: wykłady (HTML z policzonymi werdyktami)
// i ćwiczenia (metadane + pliki). Eksportuje wczytajKurs() dla testów i materiałów.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { parsujWyklad } from './wyklad-md.mjs';
import { parsujJSON } from '../trener/rdzen/parser-json.js';

const KORZEN = join(dirname(fileURLToPath(import.meta.url)), '..');
const TRESC = join(KORZEN, 'tresc');
const WYJSCIE = join(KORZEN, 'public', 'tresc');

const czytaj = p => readFileSync(p, 'utf8');
export const czytajJSON = p => {
  let w;
  try { w = parsujJSON(czytaj(p)); } catch (e) { throw new Error(`${p}: ${e.message}`); }
  if (w.duplikaty.length) throw new Error(`${p}: pole „${w.duplikaty[0].klucz}” występuje dwa razy w tym samym obiekcie. W treści kursu duplikaty są niedozwolone (liczyłoby się tylko ostatnie).`);
  return w.wartosc;
};

const schematCwiczenia = czytajJSON(join(TRESC, 'schemat-cwiczenia.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const sprawdzCwiczenie = ajv.compile(schematCwiczenia);

function wczytajCwiczenie(katalog) {
  const plikMeta = join(katalog, 'cwiczenie.json');
  const cw = czytajJSON(plikMeta);
  if (!sprawdzCwiczenie(cw)) {
    throw new Error(`${plikMeta}: ${sprawdzCwiczenie.errors.map(e => `${e.instancePath || '/'} ${e.message}`).join('; ')}`);
  }
  const wynik = { ...cw };
  const jesli = (nazwa, fn) => { const p = join(katalog, nazwa); if (existsSync(p)) fn(p); };

  if (cw.rodzaj === 1 || cw.rodzaj === 5) {
    wynik.start = czytaj(join(katalog, 'start.json'));
    czytajJSON(join(katalog, 'start.json'));
    wynik.rozwiazanie = czytajJSON(join(katalog, 'rozwiazanie.json'));
    wynik.bledne = (cw.bledne || []).map(b => ({ nazwa: b.plik, dlaczego: b.dlaczego, schemat: czytajJSON(join(katalog, 'bledne', b.plik + '.json')) }));
  }
  if (cw.rodzaj === 2) {
    wynik.start = czytaj(join(katalog, 'start.txt'));
    wynik.rozwiazanieTekst = czytaj(join(katalog, 'rozwiazanie.json'));
    wynik.rozwiazanie = parsujJSON(wynik.rozwiazanieTekst).wartosc;
    jesli('schemat.json', p => { wynik.schemat = czytajJSON(p); });
  }
  if (cw.rodzaj === 3) {
    wynik.schemat = czytajJSON(join(katalog, 'schemat.json'));
  }
  if (cw.rodzaj === 4) {
    wynik.pliki = {};
    for (const f of readdirSync(join(katalog, 'pliki')).filter(f => f.endsWith('.json')).sort()) {
      czytajJSON(join(katalog, 'pliki', f));
      wynik.pliki[f.replace(/\.json$/, '')] = czytaj(join(katalog, 'pliki', f));
    }
    if (!wynik.pliki[cw.glowny]) throw new Error(`${plikMeta}: plik główny „${cw.glowny}” nie istnieje w pliki/`);
    wynik.rozwiazanie = {};
    for (const f of readdirSync(join(katalog, 'rozwiazanie')).filter(f => f.endsWith('.json'))) {
      wynik.rozwiazanie[f.replace(/\.json$/, '')] = czytajJSON(join(katalog, 'rozwiazanie', f));
    }
  }
  wynik.bledne = wynik.bledne || [];
  return wynik;
}

function wczytajModul(katalog) {
  const meta = czytajJSON(join(katalog, 'modul.json'));
  let wyklad;
  try { wyklad = parsujWyklad(czytaj(join(katalog, 'wyklad.md'))); } catch (e) { throw new Error(`${join(katalog, 'wyklad.md')}: ${e.message}`); }
  const dirCw = join(katalog, 'cwiczenia');
  const cwiczenia = existsSync(dirCw)
    ? readdirSync(dirCw).filter(d => statSync(join(dirCw, d)).isDirectory()).map(d => wczytajCwiczenie(join(dirCw, d))).sort((a, b) => a.kolejnosc - b.kolejnosc)
    : [];
  return { meta, wyklad, cwiczenia };
}

export function wczytajKurs() {
  const kurs = czytajJSON(join(TRESC, 'kurs.json'));
  const moduly = kurs.moduly.map(m => wczytajModul(join(TRESC, 'moduly', m.katalog)));
  return { kurs, moduly };
}

export function zbudujTresc() {
  const { kurs, moduly } = wczytajKurs();
  mkdirSync(WYJSCIE, { recursive: true });
  const spis = {
    tytul: kurs.tytul,
    przerwy: kurs.przerwy || [],
    moduly: moduly.map(m => ({ nr: m.meta.nr, tytul: m.meta.tytul, minuty: m.meta.minuty, probna: !!m.meta.probna, liczbaCwiczen: m.cwiczenia.length })),
  };
  writeFileSync(join(WYJSCIE, 'kurs.json'), JSON.stringify(spis));
  for (const m of moduly) {
    writeFileSync(join(WYJSCIE, `modul-${m.meta.nr}.json`), JSON.stringify({ meta: m.meta, wyklad: m.wyklad, cwiczenia: m.cwiczenia }));
  }
  return spis;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const spis = zbudujTresc();
    console.log(`Treść zbudowana: ${spis.moduly.length} modułów, ${spis.moduly.reduce((s, m) => s + m.liczbaCwiczen, 0)} ćwiczeń → public/tresc/`);
  } catch (e) {
    console.error('Błąd treści: ' + e.message);
    process.exit(1);
  }
}
