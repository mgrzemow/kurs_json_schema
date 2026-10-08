import { utworzStan } from './stan.js';
import { naTrase, hashTrasy } from './router.js';
import { esc } from './html.js';
import { ustawMotyw, ustawRozmiarCzcionki } from './edytor.js';
import { renderujStart } from './widoki/start.js';
import { renderujModul } from './widoki/modul.js';
import { renderujCwiczenie } from './widoki/cwiczenie.js';
import { renderujPiaskownice } from './widoki/piaskownica.js';
import { renderujGenerator } from './widoki/generator.js';

const BAZA = import.meta.env.BASE_URL;
const { stan, ustaw } = utworzStan();
const app = document.getElementById('app');
const pamiecModulow = new Map();
let sprzatanie = null;

async function pobierzJSON(sciezka) {
  const r = await fetch(BAZA + sciezka);
  if (!r.ok) throw new Error(`Nie udało się wczytać ${sciezka} (${r.status}).`);
  return r.json();
}

async function pobierzModul(nr) {
  if (!pamiecModulow.has(nr)) pamiecModulow.set(nr, pobierzJSON(`tresc/modul-${nr}.json`));
  return pamiecModulow.get(nr);
}

function zastosujUstawienia() {
  const html = document.documentElement;
  const ciemny = stan.motyw === 'ciemny' || (stan.motyw === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  html.classList.toggle('motyw-ciemny', ciemny);
  html.classList.toggle('duzy-tekst', !!stan.duzyTekst);
  ustawMotyw(ciemny);
  ustawRozmiarCzcionki(stan.duzyTekst ? 18 : 14);
  const f = document.getElementById('p-formaty');
  if (f) f.checked = !!stan.formaty;
  const d = document.getElementById('p-duzy');
  if (d) d.checked = !!stan.duzyTekst;
  const m = document.getElementById('p-motyw');
  if (m) m.value = stan.motyw;
}

function renderujPasek(kurs) {
  document.getElementById('pasek').innerHTML = `
    <a class="marka" href="#/">${esc(kurs.tytul)}</a>
    <span id="pasek-modul" class="pasek-modul"></span>
    <span class="rozpychacz"></span>
    <label class="przelacznik" title="Sprawdzanie formatów (date, email…) jako asercji zamiast adnotacji"><input type="checkbox" id="p-formaty"> walidacja <code>format</code></label>
    <label class="przelacznik" title="Większe litery do udostępniania ekranu"><input type="checkbox" id="p-duzy"> Duży tekst</label>
    <label class="przelacznik">Motyw <select id="p-motyw"><option value="auto">systemowy</option><option value="jasny">jasny</option><option value="ciemny">ciemny</option></select></label>`;
  document.getElementById('p-formaty').onchange = e => { ustaw(s => { s.formaty = e.target.checked; }); dispatchEvent(new CustomEvent('trener:formaty')); };
  document.getElementById('p-duzy').onchange = e => { ustaw(s => { s.duzyTekst = e.target.checked; }); zastosujUstawienia(); };
  document.getElementById('p-motyw').onchange = e => { ustaw(s => { s.motyw = e.target.value; }); zastosujUstawienia(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', zastosujUstawienia);
}

function bladWidoku(e) {
  console.error(e);
  return `<section class="awaria"><h1>Coś poszło nie tak</h1><p>${esc(e.message)}</p><p><a href="#/">Wróć do startu</a></p></section>`;
}

async function pokazWidok(trasa, kurs) {
  if (sprzatanie) { try { sprzatanie(); } catch (_) { /* widok już zniszczony */ } sprzatanie = null; }
  const widok = document.getElementById('widok');
  widok.className = 'widok widok-' + trasa.widok;
  const pasekModul = document.getElementById('pasek-modul');
  pasekModul.innerHTML = '';
  try {
    if (trasa.widok === 'start') return renderujStart(widok, { kurs, stan });
    if (trasa.widok === 'generator') { sprzatanie = renderujGenerator(widok, { stan, ustaw }); return; }
    if (trasa.widok === 'piaskownica') {
      const modul = trasa.z ? await pobierzModul(trasa.z.nr) : null;
      sprzatanie = renderujPiaskownice(widok, { stan, ustaw, z: trasa.z, modul });
      return;
    }
    const modul = await pobierzModul(trasa.nr);
    pasekModul.innerHTML = `<a href="${hashTrasy({ widok: 'modul', nr: trasa.nr })}">Moduł ${trasa.nr}: ${esc(modul.meta.tytul)}</a>`;
    if (trasa.widok === 'modul') return renderujModul(widok, { modul, trasa, stan });
    if (trasa.widok === 'cwiczenie') {
      const cw = modul.cwiczenia.find(c => c.id === trasa.id);
      if (!cw) throw new Error(`Nie ma ćwiczenia „${trasa.id}” w module ${trasa.nr}.`);
      sprzatanie = renderujCwiczenie(widok, { modul, cw, stan, ustaw });
    }
  } catch (e) {
    widok.innerHTML = bladWidoku(e);
  }
}

async function start() {
  app.innerHTML = '<header id="pasek" class="pasek"></header><main id="widok" class="widok"></main>';
  let kurs;
  try {
    kurs = await pobierzJSON('tresc/kurs.json');
  } catch (e) {
    document.getElementById('widok').innerHTML = bladWidoku(e);
    return;
  }
  renderujPasek(kurs);
  zastosujUstawienia();
  naTrase(trasa => pokazWidok(trasa, kurs));
}

start();
