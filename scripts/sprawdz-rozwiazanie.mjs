#!/usr/bin/env node
// Wypisuje dokładnie te werdykty i komunikaty, które uczestnik zobaczyłby w trenerze.
// Użycie:
//   node scripts/sprawdz-rozwiazanie.mjs <id-cwiczenia> [--formaty] < rozwiazanie
// Wejście przez stdin zależy od rodzaju ćwiczenia:
//   rodzaj 1/5: tekst schematu;  rodzaj 2: tekst dokumentu;
//   rodzaj 3: JSON z tablicą odpowiedzi (true = „przejdzie”), np. [true, false, …];
//   rodzaj 4: JSON { "nazwaPliku": "tekst schematu", … } (brakujące pliki = startowe).
import { readFileSync } from 'node:fs';
import { wczytajKurs } from './zbuduj-tresc.mjs';
import { sprawdzCwiczenie } from '../trener/rdzen/sprawdz-cwiczenie.js';
import { jeden } from '../trener/rdzen/pomocnicze.js';

const argv = process.argv.slice(2);
const formaty = argv.includes('--formaty');
const id = argv.find(a => !a.startsWith('--'));
if (!id) {
  console.error('Podaj identyfikator ćwiczenia, np. 3-1-kod-pocztowy. Lista: ' + wczytajKurs().moduly.flatMap(m => m.cwiczenia.map(c => c.id)).join(', '));
  process.exit(2);
}
const cw = wczytajKurs().moduly.flatMap(m => m.cwiczenia).find(c => c.id === id);
if (!cw) { console.error('Nie ma ćwiczenia „' + id + '”.'); process.exit(2); }

const stdin = readFileSync(0, 'utf8');
let wejscie;
if (cw.rodzaj === 2) wejscie = { dokument: stdin };
else if (cw.rodzaj === 3) wejscie = { odpowiedzi: JSON.parse(stdin) };
else if (cw.rodzaj === 4) wejscie = { pliki: { ...cw.pliki, ...JSON.parse(stdin) } };
else wejscie = { schemat: stdin };

const w = sprawdzCwiczenie(cw, wejscie, { formaty });
const ETYK = { blad: 'Błąd', ostrz: 'Uwaga', info: 'Dobrze wiedzieć' };

console.log(`Ćwiczenie ${cw.id}: ${cw.tytul} (rodzaj ${cw.rodzaj}, walidacja format: ${w.formaty ? 'tak' : 'nie'})`);
console.log('\nDiagnoza:');
if (!w.diagnoza.length) console.log('  (brak uwag)');
for (const d of w.diagnoza) {
  const gdzie = [d.plik ? 'plik „' + d.plik + '”' : null, d.linia ? 'linia ' + d.linia : null].filter(Boolean).join(', ');
  console.log(`  ${ETYK[d.poziom] || d.poziom}${gdzie ? ' (' + gdzie + ')' : ''}: ${d.tekst}`);
}
if (w.przyklady.length) {
  console.log('\nPrzykłady:');
  for (const p of w.przyklady) {
    const werdykt = p.przeszedl === null ? 'czeka' : p.przeszedl ? 'Przechodzi' : 'Odrzucony';
    const znak = p.przeszedl === null ? '…' : p.zgodny ? '✓' : '✗';
    let linia = `  ${znak} ${p.opis} ${jeden(p.dane)} → ${werdykt}`;
    if (cw.rodzaj === 3) linia += ` (Twoja odpowiedź: ${p.odpowiedz === null ? 'brak' : p.odpowiedz ? 'przejdzie' : 'nie przejdzie'})`;
    console.log(linia);
    if (p.przeszedl !== null && !p.zgodny) {
      if (cw.rodzaj === 3) console.log('      ' + p.wyjasnienie);
      else if (p.ok && !p.przeszedl) console.log('      Ten dokument powinien przejść, ale schemat zgłasza: ' + p.powod.join(' '));
      else if (!p.ok && p.przeszedl) console.log('      Ten dokument powinien zostać odrzucony, ale schemat go przepuszcza.' + (p.wskazowka ? ' Wskazówka: ' + p.wskazowka : ''));
    } else if (p.przeszedl === false && p.powod.length) console.log('      Powód: ' + p.powod[0]);
  }
}
if (w.odwolania) {
  console.log('\nOdwołania między plikami:');
  for (const o of w.odwolania) console.log(`  ${o.zPliku} → ${o.ref} → ${o.doPliku ?? 'NIE PROWADZI DO ŻADNEGO PLIKU'}`);
}
console.log('\nWynik: ' + (w.zaliczone ? 'zaliczone' : 'niezaliczone'));
