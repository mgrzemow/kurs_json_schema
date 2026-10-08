// Rama ćwiczenia: lewa kolumna z zadaniem i pomocą, środek i prawa zależne od rodzaju.
import { esc, md, gwiazdki, koloruj } from '../html.js';
import { hashTrasy } from '../router.js';
import { ladnie } from '../../rdzen/pomocnicze.js';
import { cwiczenieSchemat } from './cwiczenie-schemat.js';
import { cwiczenieDokument } from './cwiczenie-dokument.js';
import { cwiczenieZgadnij } from './cwiczenie-zgadnij.js';
import { cwiczenieProjekt } from './cwiczenie-projekt.js';

const WARIANTY = { 1: cwiczenieSchemat, 5: cwiczenieSchemat, 2: cwiczenieDokument, 3: cwiczenieZgadnij, 4: cwiczenieProjekt };
const RODZAJE = { 1: 'Napisz lub popraw schemat', 2: 'Napraw dokument JSON', 3: 'Zgadnij, potem sprawdź', 4: 'Projekt z wieloma plikami', 5: 'Popraw wygenerowany schemat' };

function htmlRozwiazania(cw) {
  if (cw.rodzaj === 1 || cw.rodzaj === 5) return `<pre>${koloruj(ladnie(cw.rozwiazanie))}</pre>`;
  if (cw.rodzaj === 2) return `<pre>${koloruj(cw.rozwiazanieTekst)}</pre>`;
  if (cw.rodzaj === 3) return `<ul>${cw.odpowiedzi.map(o => `<li>${esc(o.opis)}: <strong>${o.ok ? 'przejdzie' : 'nie przejdzie'}</strong></li>`).join('')}</ul>`;
  if (cw.rodzaj === 4) return Object.entries(cw.rozwiazanie).map(([n, s]) => `<p class="meta">plik <code>${esc(n)}</code></p><pre>${koloruj(ladnie(s))}</pre>`).join('');
  return '';
}

export function renderujCwiczenie(kontener, { modul, cw, stan, ustaw }) {
  const nr = modul.meta.nr;
  const idx = modul.cwiczenia.findIndex(c => c.id === cw.id);
  const nastepne = modul.cwiczenia[idx + 1];
  kontener.innerHTML = `<section class="cwiczenie">
    <aside class="kolumna lewa">
      <p class="eyebrow">Ćwiczenie ${idx + 1} z ${modul.cwiczenia.length} · ${RODZAJE[cw.rodzaj]}</p>
      <h1>${esc(cw.tytul)}</h1>
      <p class="meta"><span class="gwiazdki">${gwiazdki(cw.poziom)}</span> · ok. ${cw.czasMin} min</p>
      <p class="kontekst">${md(cw.kontekst)}</p>
      <p class="polecenie"><strong>Zadanie:</strong> ${md(cw.polecenie)}</p>
      ${cw.slowa.length ? `<p class="slowa">Nowe słowa kluczowe: ${cw.slowa.map(s => `<code>${esc(s)}</code>`).join(' ')}</p>` : ''}
      <div class="pomoc">
        <button type="button" id="b-podp" aria-expanded="false">Podpowiedź</button>
        <button type="button" id="b-roz" aria-expanded="false">Rozwiązanie</button>
        <button type="button" id="b-nowa" title="Przywraca stan początkowy ćwiczenia (Ctrl+Z cofa)">Zacznij od nowa</button>
      </div>
      <div class="pomoc-tresc" id="t-podp" hidden><p>${md(cw.podpowiedz)}</p></div>
      <div class="pomoc-tresc" id="t-roz" hidden>${htmlRozwiazania(cw)}
        ${cw.rodzaj !== 3 ? '<div class="pomoc-akcje"><button class="btn-main" type="button" id="b-wstaw">Wstaw do edytora</button><small>Ctrl+Z przywraca Twoją wersję.</small></div>' : ''}
      </div>
      <p class="meta"><a href="${hashTrasy({ widok: 'modul', nr, zakladka: 'cwiczenia' })}">← Lista ćwiczeń</a></p>
    </aside>
    <div class="kolumna srodek" id="cw-srodek"></div>
    <div class="kolumna prawa"><div id="cw-zaliczone"></div><div id="cw-prawa"></div></div>
  </section>`;

  const $ = s => kontener.querySelector(s);
  const przelacz = (b, t) => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(o)); t.hidden = !o; };
  $('#b-podp').onclick = () => przelacz($('#b-podp'), $('#t-podp'));
  $('#b-roz').onclick = () => przelacz($('#b-roz'), $('#t-roz'));

  let ostatnioZaliczone = false;
  const wynik$ = ({ zaliczone }) => {
    const ramka = $('#cw-zaliczone');
    if (zaliczone) {
      if (!stan.zaliczone[cw.id]) ustaw(s => { s.zaliczone[cw.id] = true; });
      if (!ostatnioZaliczone) {
        ramka.innerHTML = `<div class="zaliczone-ramka"><span class="stempel">Zaliczone</span><p>Wszystko zachowuje się tak, jak trzeba.</p>
          ${nastepne ? `<a class="btn btn-main" href="${hashTrasy({ widok: 'cwiczenie', nr, id: nastepne.id })}">Następne ćwiczenie →</a>` : `<a class="btn" href="${hashTrasy({ widok: 'modul', nr, zakladka: 'cwiczenia' })}">Wróć do listy</a>`}</div>`;
      }
    } else ramka.innerHTML = '';
    ostatnioZaliczone = zaliczone;
  };

  const wariant = WARIANTY[cw.rodzaj];
  const uchwyt = wariant({ srodek: $('#cw-srodek'), prawa: $('#cw-prawa'), cw, stan, ustaw, wynik$ });
  const b = $('#b-wstaw');
  if (b) b.onclick = () => uchwyt.wstawRozwiazanie && uchwyt.wstawRozwiazanie();
  $('#b-nowa').onclick = () => uchwyt.odNowa && uchwyt.odNowa();
  const naFormaty = () => uchwyt.odswiez && uchwyt.odswiez();
  addEventListener('trener:formaty', naFormaty);
  return () => { removeEventListener('trener:formaty', naFormaty); uchwyt.zniszcz(); };
}
