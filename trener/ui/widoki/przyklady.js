// Prawa kolumna ćwiczeń ze schematem: przykłady „muszą przejść” / „muszą zostać odrzucone”.
import { esc, md, koloruj } from '../html.js';
import { ladnie } from '../../rdzen/pomocnicze.js';

const IKONA_T = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.3l2.4 2.4 5.2-5.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const IKONA_N = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

function stan(p) {
  return p.przeszedl === null ? 'c' : p.zgodny ? 't' : 'n';
}

function karta(p) {
  const st = stan(p);
  let chip;
  let powod = '';
  if (st === 'c') chip = '<span class="chip c">czeka</span>';
  else {
    chip = `<span class="chip ${st}">${st === 't' ? IKONA_T : IKONA_N} ${p.przeszedl ? 'Przechodzi' : 'Odrzucony'}</span>`;
    if (p.ok && !p.przeszedl) powod = `<p class="powod">Ten dokument powinien przejść, ale schemat zgłasza: ${p.powod.map(esc).join(' ')}</p>`;
    else if (!p.ok && p.przeszedl) powod = '<p class="powod">Ten dokument powinien zostać odrzucony, ale schemat go przepuszcza.</p>' + (p.wskazowka ? `<p class="powod"><span class="wsk">Wskazówka:</span> ${md(p.wskazowka)}</p>` : '');
    else if (!p.ok) powod = `<p class="powod">Powód: ${esc(p.powod[0] || '')}</p>`;
  }
  return `<article class="karta ${st}"><header><span class="opis">${esc(p.opis)}</span>${chip}</header><pre>${koloruj(ladnie(p.dane))}</pre>${powod}</article>`;
}

// przyklady: wynik sprawdzCwiczenie().przyklady; opcje.gotowe: czy schemat się skompilował
export function renderujPrzyklady(kontener, przyklady, { gotowe = true } = {}) {
  const zgodne = przyklady.filter(p => stan(p) === 't').length;
  const licznik = gotowe ? `<strong>${zgodne} z ${przyklady.length}</strong> zgadza się z oczekiwaniem` : 'Popraw schemat, żeby sprawdzić przykłady';
  const grupa = (tytul, ok) => {
    const lista = przyklady.filter(p => p.ok === ok);
    return lista.length ? `<section class="grupa"><h3>${tytul}</h3>${lista.map(karta).join('')}</section>` : '';
  };
  kontener.innerHTML = `<div class="podsum"><div class="podsum-wiersz"><h2>Przykłady</h2><span class="licznik">${licznik}</span></div>
    <div class="pasek-postepu" aria-hidden="true">${przyklady.map(p => `<span class="${stan(p)}"></span>`).join('')}</div></div>
    ${grupa('Muszą przejść', true)}${grupa('Muszą zostać odrzucone', false)}`;
}
