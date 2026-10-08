import { esc } from '../html.js';
import { hashTrasy } from '../router.js';
import { odmiana } from '../../rdzen/pomocnicze.js';

export function renderujStart(kontener, { kurs, stan }) {
  const moduly = kurs.moduly.map(m => {
    const zrobione = Object.keys(stan.zaliczone).filter(id => id.startsWith(m.nr + '-')).length;
    const cw = m.liczbaCwiczen
      ? `${m.liczbaCwiczen} ${odmiana(m.liczbaCwiczen, ['ćwiczenie', 'ćwiczenia', 'ćwiczeń'])}${zrobione ? ` · zrobione ${zrobione} z ${m.liczbaCwiczen}` : ''}`
      : 'sam wykład';
    return `<li class="modul-karta${m.probna ? ' probna' : ''}">
      <a href="${hashTrasy({ widok: 'modul', nr: m.nr })}">
        <span class="nr">${m.nr}</span>
        <span class="tytul">${esc(m.tytul)}</span>
        <span class="opis">${esc(m.opis || '')}</span>
        <span class="meta">${cw}${m.probna ? ' · treść próbna' : ''}</span>
      </a></li>`;
  }).join('');
  kontener.innerHTML = `<section class="start">
    <h1>${esc(kurs.tytul)}</h1>
    <p class="wstep">Każdy moduł ma wykład i ćwiczenia do samodzielnej pracy. Postęp zapisuje się w tej przeglądarce.</p>
    <ol class="moduly">${moduly}</ol>
    <p class="narzedzia"><a href="#/piaskownica">Piaskownica</a> · <a href="#/generator">Generator schematu z przykładów</a></p>
  </section>`;
}
