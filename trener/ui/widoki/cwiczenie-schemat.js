// Rodzaj 1 i 5: edytor schematu w środku, przykłady z werdyktami po prawej.
import { utworzEdytor, zamienTresc, ustawMarkery } from '../edytor.js';
import { sprawdzCwiczenie } from '../../rdzen/sprawdz-cwiczenie.js';
import { ladnie } from '../../rdzen/pomocnicze.js';
import { renderujDiagnoze, markeryZDiagnozy } from './diagnoza.js';
import { renderujPrzyklady } from './przyklady.js';

export function cwiczenieSchemat({ srodek, prawa, cw, stan, ustaw, wynik$ }) {
  srodek.innerHTML = '<div class="pasek-edytora"><span class="tytul schemat">Twój schemat</span><span class="meta">werdykty liczą się przy każdej zmianie</span></div><div class="edytor schemat" id="ed-schemat"></div><div class="diagnoza" id="diagnoza"></div>';
  const edytor = utworzEdytor(srodek.querySelector('#ed-schemat'), { wartosc: stan.edytory[cw.id] ?? cw.start });
  const model = edytor.getModel();
  const diagnoza = srodek.querySelector('#diagnoza');

  const naLinie = d => {
    const p = model.getPositionAt(d.pos ?? 0);
    edytor.focus();
    edytor.setPosition(p);
    edytor.revealPositionInCenter(p);
  };

  function sprawdz() {
    const w = sprawdzCwiczenie(cw, { schemat: model.getValue() }, { formaty: !!stan.formaty });
    ustawMarkery(model, markeryZDiagnozy(w.diagnoza));
    renderujDiagnoze(diagnoza, w.diagnoza.map(d => ({ ...d, linia: d.linia || (typeof d.pos === 'number' ? model.getPositionAt(d.pos).lineNumber : undefined) })), { naLinie });
    const gotowe = !w.diagnoza.some(d => d.poziom === 'blad');
    renderujPrzyklady(prawa, w.przyklady, { gotowe });
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
    wstawRozwiazanie() { zamienTresc(edytor, ladnie(cw.rozwiazanie)); edytor.focus(); },
    odNowa() { zamienTresc(edytor, cw.start); edytor.focus(); },
    odswiez: sprawdz,
  };
}
