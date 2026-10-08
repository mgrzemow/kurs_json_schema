// Rodzaj 2: napraw dokument JSON. Jeden edytor, błąd składni po polsku z linią;
// gdy składnia jest w porządku, dokument sprawdzany schematem ćwiczenia (jeśli jest).
import { esc } from '../html.js';
import { utworzEdytor, zamienTresc, ustawMarkery } from '../edytor.js';
import { sprawdzCwiczenie } from '../../rdzen/sprawdz-cwiczenie.js';
import { renderujDiagnoze, markeryZDiagnozy } from './diagnoza.js';

export function cwiczenieDokument({ srodek, prawa, cw, stan, ustaw, wynik$ }) {
  srodek.innerHTML = '<div class="pasek-edytora"><span class="tytul dokument">Dokument do naprawy</span><span class="meta">widać pierwszy błąd składni</span></div><div class="edytor dokument" id="ed-dokument"></div>';
  prawa.innerHTML = '<h2 style="font-size:1rem;margin:0 0 0.4rem">Co widzi walidator</h2><div class="diagnoza" id="diagnoza"></div>' +
    (cw.schemat ? '<p class="meta" style="margin-top:0.8rem">Po naprawie składni dokument jest jeszcze sprawdzany schematem zamówienia (po lewej, pod zadaniem).</p>' : '');
  const edytor = utworzEdytor(srodek.querySelector('#ed-dokument'), { wartosc: stan.edytory[cw.id] ?? cw.start });
  const model = edytor.getModel();
  const diagnoza = prawa.querySelector('#diagnoza');

  const naLinie = d => {
    const p = typeof d.pos === 'number' ? model.getPositionAt(d.pos) : { lineNumber: d.linia || 1, column: 1 };
    edytor.focus();
    edytor.setPosition(p);
    edytor.revealPositionInCenter(p);
  };

  function sprawdz() {
    const w = sprawdzCwiczenie(cw, { dokument: model.getValue() }, { formaty: !!stan.formaty });
    ustawMarkery(model, markeryZDiagnozy(w.diagnoza));
    renderujDiagnoze(diagnoza, w.diagnoza, { naLinie, gdyPusto: cw.schemat ? 'Poprawny JSON, zgodny ze schematem.' : 'Poprawny JSON.' });
    wynik$({ zaliczone: w.zaliczone });
  }

  let timer;
  const sub = model.onDidChangeContent(() => {
    ustaw(s => { s.edytory[cw.id] = model.getValue(); });
    clearTimeout(timer);
    timer = setTimeout(sprawdz, 180);
  });
  sprawdz();

  return {
    zniszcz() { clearTimeout(timer); sub.dispose(); edytor.dispose(); },
    wstawRozwiazanie() { zamienTresc(edytor, cw.rozwiazanieTekst); edytor.focus(); },
    odNowa() { zamienTresc(edytor, cw.start); edytor.focus(); },
    odswiez: sprawdz,
  };
}

export { esc };
