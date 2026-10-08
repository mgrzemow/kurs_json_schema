// Rodzaj 4: projekt z wieloma plikami. Zakładki plików nad jednym edytorem (model na plik),
// diagnoza z nazwą pliku, przykłady, diagram zależności i podgląd „jak to widzi walidator”.
import { esc } from '../html.js';
import { monaco, utworzEdytor, utworzModel, zamienTresc, zamienTrescModelu, ustawMarkery } from '../edytor.js';
import { sprawdzCwiczenie } from '../../rdzen/sprawdz-cwiczenie.js';
import { ladnie } from '../../rdzen/pomocnicze.js';
import { renderujDiagnoze, markeryZDiagnozy } from './diagnoza.js';
import { renderujPrzyklady } from './przyklady.js';
import { rysujDiagram } from '../diagram.js';

// Klik w wartość $ref otwiera plik docelowy: link provider raz na język JSON,
// a otwarcie linku rozgłaszane zdarzeniem, które obsługuje aktywny widok projektu.
let linkiZarejestrowane = false;
function zarejestrujLinkiRef() {
  if (linkiZarejestrowane) return;
  linkiZarejestrowane = true;
  monaco.languages.registerLinkProvider('json', {
    provideLinks(model) {
      const links = [];
      const re = /"\$ref"\s*:\s*"([^"#][^"]*)"/g;
      for (let l = 1; l <= model.getLineCount(); l++) {
        const tekst = model.getLineContent(l);
        let m;
        while ((m = re.exec(tekst))) {
          const start = m.index + m[0].lastIndexOf(m[1]);
          links.push({ range: new monaco.Range(l, start + 1, l, start + 1 + m[1].length), url: 'trener-ref:' + encodeURIComponent(m[1]), tooltip: 'Otwórz plik, do którego prowadzi odwołanie (Ctrl+klik)' });
        }
      }
      return { links };
    },
  });
  monaco.editor.registerLinkOpener({
    open(uri) {
      if (uri.scheme !== 'trener-ref') return false;
      dispatchEvent(new CustomEvent('trener:otworz-ref', { detail: decodeURIComponent(uri.path || uri.authority || '') }));
      return true;
    },
  });
}

export function cwiczenieProjekt({ srodek, prawa, cw, stan, ustaw, wynik$ }) {
  zarejestrujLinkiRef();
  const nazwy = [cw.glowny, ...Object.keys(cw.pliki).filter(n => n !== cw.glowny)];
  const klucz = n => cw.id + '/' + n;
  srodek.innerHTML = `<div class="zakladki-plikow" id="zakladki" role="tablist"></div><div class="edytor" id="ed-projekt"></div><div class="diagnoza" id="diagnoza"></div>`;
  prawa.innerHTML = `<div id="przyklady"></div><div class="diagram" id="diagram"></div><div class="jak-widzi" id="jak-widzi"></div>`;
  const edytor = utworzEdytor(srodek.querySelector('#ed-projekt'), { wartosc: '' });
  edytor.getModel().dispose();
  const modele = Object.fromEntries(nazwy.map(n => [n, utworzModel(stan.edytory[klucz(n)] ?? cw.pliki[n])]));
  let aktywny = nazwy.includes(cw.glowny) ? cw.glowny : nazwy[0];
  let ostatniWynik = null;

  const zakladki = srodek.querySelector('#zakladki');
  function renderujZakladki() {
    zakladki.innerHTML = nazwy.map(n => {
      const zBledem = ostatniWynik && ostatniWynik.diagnoza.some(d => d.plik === n && d.poziom === 'blad');
      return `<button type="button" role="tab" data-plik="${esc(n)}" class="${n === aktywny ? 'aktywny' : ''}${zBledem ? ' z-bledem' : ''}" aria-selected="${n === aktywny}">${esc(n)}${n === cw.glowny ? ' (główny)' : ''}</button>`;
    }).join('');
    zakladki.querySelectorAll('button').forEach(b => { b.onclick = () => pokaz(b.dataset.plik); });
  }
  function pokaz(nazwa) {
    if (!modele[nazwa]) return;
    aktywny = nazwa;
    edytor.setModel(modele[nazwa]);
    renderujZakladki();
    edytor.focus();
  }

  const naLinie = d => {
    if (d.plik && d.plik !== aktywny) pokaz(d.plik);
    const m = edytor.getModel();
    const p = typeof d.pos === 'number' ? m.getPositionAt(d.pos) : { lineNumber: d.linia || 1, column: 1 };
    edytor.setPosition(p);
    edytor.revealPositionInCenter(p);
    edytor.focus();
  };

  function sprawdz() {
    const pliki = Object.fromEntries(nazwy.map(n => [n, modele[n].getValue()]));
    const w = sprawdzCwiczenie(cw, { pliki }, { formaty: !!stan.formaty });
    ostatniWynik = w;
    for (const n of nazwy) ustawMarkery(modele[n], markeryZDiagnozy(w.diagnoza, n));
    const zLinia = w.diagnoza.map(d => ({ ...d, linia: d.linia || (typeof d.pos === 'number' && d.plik && modele[d.plik] ? modele[d.plik].getPositionAt(d.pos).lineNumber : undefined) }));
    renderujDiagnoze(srodek.querySelector('#diagnoza'), zLinia, { naLinie, pokazPlik: true, gdyPusto: 'Wszystkie pliki są poprawne, odwołania prowadzą do celu.' });
    renderujZakladki();
    const gotowe = !w.diagnoza.some(d => d.poziom === 'blad');
    renderujPrzyklady(prawa.querySelector('#przyklady'), w.przyklady, { gotowe });
    prawa.querySelector('#diagram').innerHTML = '<h3 style="font-size:0.9rem;margin:0.6rem 0 0.2rem;color:var(--tekst-slaby)">Zależności między plikami</h3>' + rysujDiagram({ pliki: nazwy, glowny: cw.glowny, odwolania: w.odwolania || [] });
    prawa.querySelector('#jak-widzi').innerHTML = '<h3 style="font-size:0.9rem;margin:0.6rem 0 0.2rem;color:var(--tekst-slaby)">Jak to widzi walidator</h3><table><tbody>' +
      nazwy.map(n => `<tr><td>${esc(n)}</td><td>${w.idPlikow && w.idPlikow[n] ? esc(w.idPlikow[n]) : '<em>brak $id</em>'}</td></tr>`).join('') + '</tbody></table>' +
      '<p class="meta" style="margin:0.3rem 0 0">Walidator zna pliki tylko po <code>$id</code>. Odwołanie <code>$ref</code> musi do któregoś pasować.</p>';
    wynik$({ zaliczone: w.zaliczone });
  }

  let timer;
  const suby = nazwy.map(n => modele[n].onDidChangeContent(() => {
    ustaw(s => { s.edytory[klucz(n)] = modele[n].getValue(); });
    clearTimeout(timer);
    timer = setTimeout(sprawdz, 180);
  }));
  const naRef = e => {
    const ref = e.detail;
    const o = (ostatniWynik && ostatniWynik.odwolania || []).find(x => x.ref === ref && x.doPliku);
    if (o) pokaz(o.doPliku);
  };
  addEventListener('trener:otworz-ref', naRef);
  pokaz(aktywny);
  sprawdz();

  return {
    zniszcz() { clearTimeout(timer); removeEventListener('trener:otworz-ref', naRef); suby.forEach(s => s.dispose()); edytor.dispose(); Object.values(modele).forEach(m => m.dispose()); },
    wstawRozwiazanie() {
      for (const [n, s] of Object.entries(cw.rozwiazanie)) if (modele[n]) { if (n === aktywny) zamienTresc(edytor, ladnie(s)); else zamienTrescModelu(modele[n], ladnie(s)); }
      edytor.focus();
    },
    odNowa() {
      for (const n of nazwy) { if (n === aktywny) zamienTresc(edytor, cw.pliki[n]); else zamienTrescModelu(modele[n], cw.pliki[n]); }
      edytor.focus();
    },
    odswiez: sprawdz,
  };
}
