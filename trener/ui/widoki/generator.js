// Generator: wklej jeden dokument albo listę dokumentów, zobacz schemat w stylu genson.
import { utworzEdytor, ustawMarkery, zamienTresc } from '../edytor.js';
import { parsujJSON, BladSkladni } from '../../rdzen/parser-json.js';
import { generujSchemat } from '../../rdzen/generator.js';
import { ladnie } from '../../rdzen/pomocnicze.js';
import { renderujDiagnoze, markeryZDiagnozy } from './diagnoza.js';

const PRZYKLAD = [
  { numer: 'ZAM-2026-000123', status: 'oplacone', klient: 'Serwis Rowerowy Dętka', uwagi: null, pozycje: [{ ean: '5901234123457', ilosc: 2, cena: 12.5 }] },
  { numer: 'ZAM-2026-000124', status: 'nowe', klient: 'Jan Nowak', uwagi: 'Proszę dzwonić domofonem', kodRabatowy: 'WIOSNA10', pozycje: [{ ean: '5901234123464', ilosc: 36, cena: 1 }, { ean: '5901234123471', ilosc: 1, cena: 249 }] },
];

export function renderujGenerator(kontener, { stan, ustaw }) {
  kontener.innerHTML = `<section class="generator">
    <div class="pasek-edytora"><div><h1 style="margin:0;font-size:1.3rem">Generator schematu z przykładów</h1>
      <p class="meta" style="margin:0.2rem 0 0">Wklej jeden dokument JSON albo listę dokumentów <code>[…]</code>. Generator działa jak genson: opisuje to, co jest w przykładach, a nie to, co powinno być. Zobacz, czego brakuje.</p></div>
      <div class="pomoc"><button type="button" id="b-przyklad">Wstaw przykładowe zamówienia</button></div></div>
    <div class="dwa-edytory">
      <div><div class="pasek-edytora"><span class="tytul schemat">Wygenerowany schemat</span><span class="meta" id="info"></span></div><div class="edytor schemat" id="ed-wynik"></div></div>
      <div><div class="pasek-edytora"><span class="tytul dokument">Przykłady (wklej tutaj)</span></div><div class="edytor dokument" id="ed-przyklady"></div><div class="diagnoza" id="diag"></div></div>
    </div></section>`;
  const $ = s => kontener.querySelector(s);
  const edP = utworzEdytor($('#ed-przyklady'), { wartosc: stan.edytory['generator'] ?? ladnie(PRZYKLAD) });
  const edW = utworzEdytor($('#ed-wynik'), { wartosc: '', tylkoDoOdczytu: true });
  const mP = edP.getModel();

  function generuj() {
    let w;
    try {
      w = parsujJSON(mP.getValue(), 'Wklej dokument JSON.');
    } catch (e) {
      if (!(e instanceof BladSkladni)) throw e;
      const d = [{ poziom: 'blad', rodzaj: 'Błąd składni JSON', tekst: e.message, pos: e.pos, linia: e.linia }];
      ustawMarkery(mP, markeryZDiagnozy(d));
      renderujDiagnoze($('#diag'), d, { naLinie: x => { const p = mP.getPositionAt(x.pos); edP.setPosition(p); edP.revealPositionInCenter(p); edP.focus(); } });
      $('#info').textContent = '';
      return;
    }
    ustawMarkery(mP, []);
    const lista = Array.isArray(w.wartosc) ? w.wartosc : [w.wartosc];
    renderujDiagnoze($('#diag'), [], { gdyPusto: Array.isArray(w.wartosc) ? `Lista: ${lista.length} ${lista.length === 1 ? 'przykład' : lista.length < 5 ? 'przykłady' : 'przykładów'}.` : 'Jeden przykład. Wklej listę, żeby zobaczyć, jak generator wnioskuje required.' });
    edW.getModel().setValue(ladnie(generujSchemat(lista)));
    $('#info').textContent = 'required = pola obecne we wszystkich przykładach';
  }

  let timer;
  const sub = mP.onDidChangeContent(() => { ustaw(s => { s.edytory['generator'] = mP.getValue(); }); clearTimeout(timer); timer = setTimeout(generuj, 200); });
  $('#b-przyklad').onclick = () => { zamienTresc(edP, ladnie(PRZYKLAD)); edP.focus(); };
  generuj();
  return () => { clearTimeout(timer); sub.dispose(); edP.dispose(); edW.dispose(); };
}
