import { esc } from '../html.js';
import { hashTrasy } from '../router.js';

export function renderujStart(kontener, { kurs, stan }) {
  const przerwy = kurs.przerwy || [];
  const moduly = kurs.moduly.map(m => {
    const zrobione = Object.keys(stan.zaliczone).filter(id => id.startsWith(m.nr + '-')).length;
    const przerwa = przerwy.find(p => p.po === m.nr);
    return `<li class="modul-karta${m.probna ? ' probna' : ''}">
      <a href="${hashTrasy({ widok: 'modul', nr: m.nr })}">
        <span class="nr">${m.nr}</span>
        <span class="tytul">${esc(m.tytul)}</span>
        <span class="meta">${m.minuty} min · ${m.liczbaCwiczen} ćw.${zrobione ? ` · zrobione ${zrobione}/${m.liczbaCwiczen}` : ''}${m.probna ? ' · treść próbna' : ''}</span>
      </a></li>` + (przerwa ? `<li class="przerwa">Przerwa ${przerwa.minuty} min</li>` : '');
  }).join('');
  kontener.innerHTML = `<section class="start">
    <h1>${esc(kurs.tytul)}</h1>
    <p class="wstep">Wybierz moduł. W każdym jest wykład (prowadzący omawia go na ekranie) i ćwiczenia do samodzielnej pracy. Postęp zapisuje się w tej przeglądarce.</p>
    <ul class="moduly">${moduly}</ul>
    <p class="narzedzia"><a href="#/piaskownica">Piaskownica</a> · <a href="#/generator">Generator schematu z przykładów</a></p>
  </section>`;
}
