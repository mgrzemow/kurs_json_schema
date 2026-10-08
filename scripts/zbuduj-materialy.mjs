// Materiały statyczne po kursie: jeden plik HTML (+ PDF przez Playwright) z tego samego
// źródła treści, co trener. Werdykty policzone walidatorem w trakcie budowania,
// rozwiązania w osobnym dodatku na końcu, ściągawka słów kluczowych z kolumną „w draft-07”.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { wczytajKurs } from './zbuduj-tresc.mjs';
import { sprawdzCwiczenie } from '../trener/rdzen/sprawdz-cwiczenie.js';
import { ladnie } from '../trener/rdzen/pomocnicze.js';

const KORZEN = join(dirname(fileURLToPath(import.meta.url)), '..');
const WYNIK = join(KORZEN, 'materialy', 'wynik');

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const gwiazdki = p => '★'.repeat(p) + '☆'.repeat(3 - p);
const RODZAJE = { 1: 'napisz lub popraw schemat', 2: 'napraw dokument JSON', 3: 'zgadnij, potem sprawdź', 4: 'projekt z wieloma plikami', 5: 'popraw wygenerowany schemat' };

// Odpowiedniki w draft-07 dla słów, które się różnią (kolumna w ściągawce).
const DRAFT07 = {
  $defs: '<code>definitions</code>',
  prefixItems: '<code>items</code> jako tablica schematów',
  items: 'to samo, albo <code>additionalItems</code> przy tablicy w <code>items</code>',
  dependentRequired: '<code>dependencies</code> z listą pól',
  dependentSchemas: '<code>dependencies</code> ze schematem',
  exclusiveMinimum: '<code>"exclusiveMinimum": true</code> obok <code>minimum</code>',
  exclusiveMaximum: '<code>"exclusiveMaximum": true</code> obok <code>maximum</code>',
  $anchor: '<code>$id</code> z fragmentem (<code>"#nazwa"</code>)',
  $dynamicRef: 'brak',
  $dynamicAnchor: 'brak',
  $vocabulary: 'brak',
  unevaluatedProperties: 'brak',
  unevaluatedItems: 'brak',
  minContains: 'brak',
  maxContains: 'brak',
  $ref: 'to samo, ale słowa obok <code>$ref</code> były ignorowane',
  $schema: '<code>http://json-schema.org/draft-07/schema#</code>',
  definitions: 'nazwa obowiązująca w draft-07',
  dependencies: 'nazwa obowiązująca w draft-07',
  additionalItems: 'nazwa obowiązująca w draft-07',
  deprecated: 'brak',
};

// Wykład z trenera bez elementów interaktywnych: przyciski znikają, pytania są otwarte.
function wykladStatyczny(html) {
  return html
    .replace(/<button[^>]*>[^<]*<\/button>/g, '')
    .replace(/<details class="pytanie"/g, '<details class="pytanie" open');
}

function tabelaPrzykladow(przyklady, { kolumnaOdpowiedz = false } = {}) {
  return `<table class="przyklady"><thead><tr><th>Opis</th><th>Dokument</th><th>${kolumnaOdpowiedz ? 'Twoja odpowiedź' : 'Oczekiwany werdykt'}</th></tr></thead><tbody>` +
    przyklady.map(p => `<tr data-werdykt="${p.ok ? 'przechodzi' : 'odrzucony'}"><td>${esc(p.opis)}</td><td><pre>${esc(ladnie(p.dane))}</pre></td><td>${kolumnaOdpowiedz ? '☐ przejdzie ☐ nie przejdzie' : p.ok ? 'musi przejść' : 'musi zostać odrzucony'}</td></tr>`).join('') +
    '</tbody></table>';
}

function sekcjaCwiczenia(cw, nr, i) {
  let tresc = '';
  if (cw.rodzaj === 1 || cw.rodzaj === 5) {
    tresc = `<p class="etykieta">Schemat startowy</p><pre>${esc(cw.start)}</pre>${tabelaPrzykladow(cw.przyklady)}`;
  } else if (cw.rodzaj === 2) {
    tresc = `<p class="etykieta">Dokument do naprawy</p><pre>${esc(cw.start)}</pre>` + (cw.schemat ? `<p class="etykieta">Schemat, który naprawiony dokument ma spełniać</p><pre>${esc(ladnie(cw.schemat))}</pre>` : '');
  } else if (cw.rodzaj === 3) {
    tresc = `<p class="etykieta">Schemat</p><pre>${esc(ladnie(cw.schemat))}</pre>${tabelaPrzykladow(cw.odpowiedzi, { kolumnaOdpowiedz: true })}`;
  } else if (cw.rodzaj === 4) {
    tresc = Object.entries(cw.pliki).map(([n, t]) => `<p class="etykieta">Plik <code>${esc(n)}</code>${n === cw.glowny ? ' (główny)' : ''}</p><pre>${esc(t)}</pre>`).join('') + tabelaPrzykladow(cw.przyklady);
  }
  return `<section class="cwiczenie" id="cw-${esc(cw.id)}">
    <h3>Ćwiczenie ${nr}.${i + 1}: ${esc(cw.tytul)} <span class="meta">${gwiazdki(cw.poziom)} · ok. ${cw.czasMin} min · ${RODZAJE[cw.rodzaj]}</span></h3>
    <p class="kontekst">${md(cw.kontekst)}</p>
    <p class="polecenie"><strong>Zadanie:</strong> ${md(cw.polecenie)}</p>
    ${cw.slowa.length ? `<p class="meta">Słowa kluczowe: ${cw.slowa.map(s => `<code>${esc(s)}</code>`).join(', ')}</p>` : ''}
    ${tresc}
    <p class="meta">Podpowiedź: ${md(cw.podpowiedz)} Rozwiązanie: <a href="#roz-${esc(cw.id)}">dodatek</a>.</p>
  </section>`;
}

function sekcjaRozwiazania(cw, nr, i) {
  let tresc = '';
  if (cw.rodzaj === 1 || cw.rodzaj === 5) {
    const w = sprawdzCwiczenie(cw, { schemat: JSON.stringify(cw.rozwiazanie) });
    tresc = `<pre>${esc(ladnie(cw.rozwiazanie))}</pre><table class="przyklady"><thead><tr><th>Opis</th><th>Werdykt rozwiązania</th><th>Powód</th></tr></thead><tbody>` +
      w.przyklady.map(p => `<tr data-werdykt="${p.przeszedl ? 'przechodzi' : 'odrzucony'}"><td>${esc(p.opis)}</td><td>${p.przeszedl ? 'przechodzi' : 'odrzucony'}</td><td>${esc(p.powod[0] || '')}</td></tr>`).join('') + '</tbody></table>' +
      (cw.bledne.length ? '<p class="etykieta">Typowe błędne rozwiązania</p><ul>' + cw.bledne.map(b => `<li>${md(b.dlaczego)}</li>`).join('') + '</ul>' : '');
  } else if (cw.rodzaj === 2) {
    tresc = `<pre>${esc(cw.rozwiazanieTekst)}</pre><p>Błędy po kolei: ${cw.bledy.map(b => `<em>${esc(b)}</em>`).join(', ')}.</p>`;
  } else if (cw.rodzaj === 3) {
    const w = sprawdzCwiczenie(cw, { odpowiedzi: cw.odpowiedzi.map(o => o.ok) });
    tresc = '<table class="przyklady"><thead><tr><th>Opis</th><th>Werdykt</th><th>Dlaczego</th></tr></thead><tbody>' +
      w.przyklady.map(p => `<tr data-werdykt="${p.przeszedl ? 'przechodzi' : 'odrzucony'}"><td>${esc(p.opis)}</td><td>${p.przeszedl ? 'przechodzi' : 'odrzucony'}</td><td>${md(p.wyjasnienie)}</td></tr>`).join('') + '</tbody></table>';
  } else if (cw.rodzaj === 4) {
    tresc = Object.entries(cw.rozwiazanie).map(([n, s]) => `<p class="etykieta">Plik <code>${esc(n)}</code></p><pre>${esc(ladnie(s))}</pre>`).join('');
  }
  return `<section class="rozwiazanie" id="roz-${esc(cw.id)}"><h3>Rozwiązanie ćwiczenia ${nr}.${i + 1}: ${esc(cw.tytul)}</h3>${tresc}</section>`;
}

function sciagawka() {
  const schemat = JSON.parse(readFileSync(join(KORZEN, 'trener', 'ui', 'schemat-podpowiedzi.json'), 'utf8'));
  const slowa = schemat.definitions.schemat.properties;
  const wiersze = Object.entries(slowa).map(([k, v]) => {
    const opis = (v.markdownDescription || '').replace(/^`[^`]+`\s*—\s*/, '');
    return `<tr><td><code>${esc(k)}</code></td><td>${md(opis)}</td><td>${DRAFT07[k] || 'to samo'}</td></tr>`;
  }).join('');
  return `<section id="sciagawka"><h1>Ściągawka słów kluczowych JSON Schema 2020-12</h1><table class="sciagawka"><thead><tr><th>Słowo</th><th>Co robi</th><th>W draft-07</th></tr></thead><tbody>${wiersze}</tbody></table></section>`;
}

export function zbudujMaterialyHtml({ kurs, moduly }) {
  const szablon = readFileSync(join(KORZEN, 'materialy', 'szablon.html'), 'utf8');
  const styl = readFileSync(join(KORZEN, 'materialy', 'styl.css'), 'utf8');
  const spis = moduly.map(m => `<li><a href="#m-${m.meta.nr}">Moduł ${m.meta.nr}: ${esc(m.meta.tytul)}</a><ol>${m.wyklad.sekcje.map(s => `<li><a href="#m-${m.meta.nr}-${s.id}">${esc(s.tytul)}</a></li>`).join('')}</ol></li>`).join('') +
    '<li><a href="#sciagawka">Ściągawka słów kluczowych</a></li><li><a href="#rozwiazania">Dodatek: rozwiązania ćwiczeń</a></li>';
  const modulyHtml = moduly.map(m => {
    const nr = m.meta.nr;
    const wyklad = wykladStatyczny(m.wyklad.html).replace(/<h2 id="([^"]+)"/g, `<h2 id="m-${nr}-$1"`);
    return `<section class="modul" id="m-${nr}"><h1>Moduł ${nr}: ${esc(m.meta.tytul)}</h1>${m.meta.probna ? '<p class="meta">Treść próbna prototypu.</p>' : ''}
      <article class="wyklad">${wyklad}</article>
      <h2 id="m-${nr}-cwiczenia">Ćwiczenia do modułu ${nr}</h2>
      ${m.cwiczenia.map((cw, i) => sekcjaCwiczenia(cw, nr, i)).join('')}</section>`;
  }).join('');
  const rozwiazania = `<section id="rozwiazania"><h1>Dodatek: rozwiązania ćwiczeń</h1>${moduly.flatMap(m => m.cwiczenia.map((cw, i) => sekcjaRozwiazania(cw, m.meta.nr, i))).join('')}</section>`;
  const tresc = `<header class="okladka"><h1>${esc(kurs.tytul)}</h1><p>Materiały po kursie: wykład, ćwiczenia, ściągawka i rozwiązania. Wygenerowane ${new Date().toISOString().slice(0, 10)}.</p></header>
    <nav class="spis"><h2>Spis treści</h2><ol>${spis}</ol></nav>${modulyHtml}${sciagawka()}${rozwiazania}`;
  return szablon.replace('{{tytul}}', esc(kurs.tytul)).replace('{{styl}}', styl).replace('{{tresc}}', tresc);
}

async function zbudujPdf(htmlSciezka, pdfSciezka) {
  const { chromium } = await import('playwright');
  const przegladarka = await chromium.launch();
  const strona = await przegladarka.newPage();
  await strona.goto('file://' + htmlSciezka.replace(/\\/g, '/'), { waitUntil: 'load' });
  await strona.pdf({ path: pdfSciezka, format: 'A4', printBackground: true, margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' } });
  await przegladarka.close();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    mkdirSync(WYNIK, { recursive: true });
    const html = zbudujMaterialyHtml(wczytajKurs());
    const htmlSciezka = join(WYNIK, 'kurs.html');
    writeFileSync(htmlSciezka, html);
    console.log('Zapisano ' + htmlSciezka);
    if (!process.argv.includes('--bez-pdf')) {
      await zbudujPdf(htmlSciezka, join(WYNIK, 'kurs.pdf'));
      console.log('Zapisano ' + join(WYNIK, 'kurs.pdf'));
    }
  } catch (e) {
    console.error('Błąd materiałów: ' + (e.stack || e.message));
    process.exit(1);
  }
}
