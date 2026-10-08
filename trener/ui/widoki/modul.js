import { esc, gwiazdki } from '../html.js';
import { hashTrasy } from '../router.js';
import { renderujWyklad } from './wyklad.js';

const RODZAJE = { 1: 'napisz/popraw schemat', 2: 'napraw dokument JSON', 3: 'zgadnij, potem sprawdź', 4: 'projekt z wieloma plikami', 5: 'popraw wygenerowany schemat' };

export function renderujModul(kontener, { modul, trasa, stan }) {
  const nr = modul.meta.nr;
  const zak = trasa.zakladka || 'wyklad';
  const zakladka = (id, nazwa) => `<a class="zakladka${zak === id ? ' aktywna' : ''}" href="${hashTrasy({ widok: 'modul', nr, zakladka: id })}" ${zak === id ? 'aria-current="page"' : ''}>${nazwa}</a>`;
  kontener.innerHTML = `<section class="modul">
    <header class="modul-naglowek">
      <p class="eyebrow">Moduł ${nr}${modul.meta.probna ? ' · treść próbna' : ''}</p>
      <h1>${esc(modul.meta.tytul)}</h1>
      <nav class="zakladki">${zakladka('wyklad', 'Wykład')}${zakladka('cwiczenia', `Ćwiczenia (${modul.cwiczenia.length})`)}</nav>
    </header>
    <div id="modul-tresc"></div>
  </section>`;
  const tresc = kontener.querySelector('#modul-tresc');
  if (zak === 'cwiczenia') renderujListeCwiczen(tresc, modul, stan);
  else renderujWyklad(tresc, { modul, kotwica: trasa.kotwica });
}

function renderujListeCwiczen(kontener, modul, stan) {
  const nr = modul.meta.nr;
  kontener.innerHTML = `<ol class="lista-cwiczen">${modul.cwiczenia.map((cw, i) => `
    <li class="${stan.zaliczone[cw.id] ? 'zrobione' : ''}">
      <a href="${hashTrasy({ widok: 'cwiczenie', nr, id: cw.id })}">
        <span class="nr">${i + 1}</span>
        <span class="tytul">${esc(cw.tytul)}</span>
        <span class="meta"><span class="gwiazdki" title="poziom ${cw.poziom}/3">${gwiazdki(cw.poziom)}</span> · ${RODZAJE[cw.rodzaj]}</span>
        <span class="status">${stan.zaliczone[cw.id] ? '✓ zrobione' : ''}</span>
      </a></li>`).join('')}</ol>
    <p class="uwaga-lista">Ćwiczeń jest więcej, niż zmieści się w czasie. Najważniejsze są pierwsze. Każde da się zrobić niezależnie od poprzednich.</p>`;
}
