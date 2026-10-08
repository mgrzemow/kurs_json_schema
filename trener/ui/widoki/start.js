import { esc } from '../html.js';
import { hashTrasy } from '../router.js';
import { odmiana } from '../../rdzen/pomocnicze.js';

export function renderujStart(kontener, { kurs }) {
  const moduly = kurs.moduly.map(m => {
    const cw = m.liczbaCwiczen ? `${m.liczbaCwiczen} ${odmiana(m.liczbaCwiczen, ['ćwiczenie', 'ćwiczenia', 'ćwiczeń'])}` : 'sam wykład';
    return `<li class="modul-karta">
      <a href="${hashTrasy({ widok: 'modul', nr: m.nr })}">
        <span class="nr">${m.nr}</span>
        <span class="tytul">${esc(m.tytul)}</span>
        <span class="opis">${esc(m.opis || '')}</span>
        <span class="meta">${cw}</span>
      </a></li>`;
  }).join('');
  const autor = kurs.autor
    ? `<p class="autor">Autor: ${kurs.linkedin ? `<a href="${esc(kurs.linkedin)}" target="_blank" rel="noopener">${esc(kurs.autor)}</a>` : esc(kurs.autor)}${kurs.czas ? ` · Czas trwania: ${esc(kurs.czas)}` : ''}</p>`
    : '';
  kontener.innerHTML = `<section class="start">
    <h1>${esc(kurs.tytul)}</h1>
    ${autor}
    <div class="wstep">${(kurs.opis || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>
    <ol class="moduly">${moduly}</ol>
    <p class="narzedzia"><a href="#/piaskownica">Piaskownica</a> · <a href="#/generator">Generator schematu z przykładów</a></p>
    ${kurs.prawa ? `<footer class="prawa">${esc(kurs.prawa)}</footer>` : ''}
  </section>`;
}
