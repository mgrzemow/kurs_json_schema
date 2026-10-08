// Rodzaj 3: zgadnij, potem sprawdź. Schemat tylko do odczytu, dokumenty z przyciskami
// „przejdzie / nie przejdzie”; po odpowiedzi na wszystkie przycisk „Sprawdź” odsłania werdykty.
import { esc, md, koloruj } from '../html.js';
import { utworzEdytor } from '../edytor.js';
import { sprawdzCwiczenie } from '../../rdzen/sprawdz-cwiczenie.js';
import { ladnie } from '../../rdzen/pomocnicze.js';

export function cwiczenieZgadnij({ srodek, prawa, cw, stan, ustaw, wynik$ }) {
  srodek.innerHTML = '<div class="pasek-edytora"><span class="tytul">Schemat (tylko do odczytu)</span></div><div class="edytor" id="ed-schemat"></div>';
  const edytor = utworzEdytor(srodek.querySelector('#ed-schemat'), { wartosc: ladnie(cw.schemat), tylkoDoOdczytu: true });
  const zapis = () => stan.odpowiedzi[cw.id] || {};
  let sprawdzone = !!zapis().sprawdzone;

  function render() {
    const odp = zapis().lista || [];
    const w = sprawdzCwiczenie(cw, { odpowiedzi: odp }, { formaty: !!stan.formaty });
    const karty = w.przyklady.map((p, i) => {
      const wybor = p.odpowiedz;
      const klasa = sprawdzone ? (p.zgodny ? 'trafione' : 'nietrafione') : 'c';
      const wynik = sprawdzone
        ? `<p class="powod">Werdykt: <strong>${p.przeszedl ? 'przechodzi' : 'odrzucony'}</strong>${p.zgodny ? ' · trafione' : ' · nietrafione'}</p><p class="wyjasnienie">${md(p.wyjasnienie)}</p>`
        : '';
      return `<article class="karta ${klasa}"><header><span class="opis">${esc(p.opis)}</span>
        <span class="odpowiedzi"><label><input type="radio" name="o-${i}" value="t" ${wybor === true ? 'checked' : ''} ${sprawdzone ? 'disabled' : ''}>przejdzie</label>
        <label><input type="radio" name="o-${i}" value="n" ${wybor === false ? 'checked' : ''} ${sprawdzone ? 'disabled' : ''}>nie przejdzie</label></span></header>
        <pre>${koloruj(ladnie(p.dane))}</pre>${wynik}</article>`;
    }).join('');
    const trafione = w.przyklady.filter(p => p.zgodny).length;
    prawa.innerHTML = `<div class="podsum"><div class="podsum-wiersz"><h2>Obstaw werdykty</h2><span class="licznik">${sprawdzone ? `<strong>${trafione} z ${w.przyklady.length}</strong> trafionych` : `${w.przyklady.filter(p => p.odpowiedz !== null).length} z ${w.przyklady.length} odpowiedzi`}</span></div></div>
      ${karty}
      <div class="pomoc">${sprawdzone
        ? '<button type="button" id="b-jeszcze">Spróbuj jeszcze raz</button>'
        : `<button type="button" class="btn-main" id="b-sprawdz" ${w.kompletne ? '' : 'disabled'}>Sprawdź</button>${w.kompletne ? '' : '<small class="meta">Odpowiedz na wszystkie, żeby sprawdzić.</small>'}`}</div>`;
    prawa.querySelectorAll('input[type=radio]').forEach(r => {
      r.onchange = () => {
        const i = +r.name.slice(2);
        ustaw(s => { const z = s.odpowiedzi[cw.id] = s.odpowiedzi[cw.id] || {}; z.lista = z.lista || []; z.lista[i] = r.value === 't'; });
        render();
      };
    });
    const bs = prawa.querySelector('#b-sprawdz');
    if (bs) bs.onclick = () => { sprawdzone = true; ustaw(s => { (s.odpowiedzi[cw.id] = s.odpowiedzi[cw.id] || {}).sprawdzone = true; }); render(); };
    const bj = prawa.querySelector('#b-jeszcze');
    if (bj) bj.onclick = () => { sprawdzone = false; ustaw(s => { s.odpowiedzi[cw.id] = {}; }); render(); };
    wynik$({ zaliczone: sprawdzone && w.zaliczone });
  }
  render();

  return {
    zniszcz() { edytor.dispose(); },
    odNowa() { sprawdzone = false; ustaw(s => { s.odpowiedzi[cw.id] = {}; }); render(); },
    odswiez: render,
  };
}
