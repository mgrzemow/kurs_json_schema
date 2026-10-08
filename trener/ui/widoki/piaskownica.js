// Wolny edytor: schemat po lewej, dokument po prawej, werdykt i komunikaty na bieżąco.
import { esc } from '../html.js';
import { hashTrasy } from '../router.js';
import { utworzEdytor, zamienTresc, ustawMarkery } from '../edytor.js';
import { sprawdzPiaskownice } from '../../rdzen/sprawdz-cwiczenie.js';
import { ladnie, odmiana } from '../../rdzen/pomocnicze.js';
import { renderujDiagnoze, markeryZDiagnozy } from './diagnoza.js';

const DOMYSLNY_SCHEMAT = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Zamówienie',
  type: 'object',
  properties: {
    numer: { type: 'string', pattern: '^ZAM-[0-9]{4}-[0-9]{6}$' },
    status: { enum: ['nowe', 'oplacone', 'wyslane', 'dostarczone', 'anulowane'] },
    klient: { type: 'string', minLength: 1 },
    pozycje: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          ean: { type: 'string', pattern: '^[0-9]{13}$' },
          ilosc: { type: 'integer', minimum: 1 },
          cena: { type: 'number', exclusiveMinimum: 0 },
        },
        required: ['ean', 'ilosc', 'cena'],
      },
    },
  },
  required: ['numer', 'status', 'klient', 'pozycje'],
};
const DOMYSLNY_DOKUMENT = {
  numer: 'ZAM-2026-000123',
  status: 'oplacone',
  klient: 'Serwis Rowerowy Pedał',
  pozycje: [{ ean: '5901234123457', ilosc: 2, cena: 12.5 }, { ean: '5901234123464', ilosc: 36, cena: 1.2 }],
};

const IKONA_T = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.3l2.4 2.4 5.2-5.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const IKONA_N = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export function renderujPiaskownice(kontener, { stan, ustaw, z, modul }) {
  const przyklad = z && modul ? modul.wyklad.przyklady : null;
  const schematZ = przyklad && przyklad[z.schemat] ? przyklad[z.schemat].schematTekst : null;
  const dokumentZ = przyklad && z.dokument && przyklad[z.dokument] ? przyklad[z.dokument].dokumentTekst : null;
  const powrot = z ? `<a class="btn" href="${hashTrasy({ widok: 'modul', nr: z.nr, kotwica: z.kotwica })}">← Wróć do wykładu</a>` : '';
  const opis = z
    ? `Schemat <code>${esc(z.schemat)}</code>${z.dokument ? ` i dokument <code>${esc(z.dokument)}</code>` : ''} z wykładu modułu ${z.nr}. Zmieniaj jedno albo drugie i obserwuj werdykt.`
    : 'Tu nie ma zadania. Po lewej schemat zamówienia, po prawej przykładowe zamówienie. Zmieniaj jedno albo drugie i obserwuj wynik. Spróbuj: ustaw ilość na 0, usuń pole <code>klient</code> albo dopisz pole, którego schemat nie zna.';
  kontener.innerHTML = `<section class="piaskownica">
    <div class="pasek-edytora"><div><h1 style="margin:0;font-size:1.3rem">Piaskownica</h1><p class="meta" style="margin:0.2rem 0 0">${opis}</p></div><div class="pomoc">${powrot}<button type="button" id="b-reset">Przywróć domyślne</button></div></div>
    <div class="dwa-edytory">
      <div><div class="pasek-edytora"><span class="tytul">Schemat</span></div><div class="edytor" id="ed-schemat"></div><div class="diagnoza" id="diag-schemat"></div></div>
      <div><div class="pasek-edytora"><span class="tytul">Dokument</span></div><div class="edytor" id="ed-dokument"></div><div id="werdykt"></div></div>
    </div></section>`;
  const $ = s => kontener.querySelector(s);
  const startSchemat = schematZ ?? stan.edytory['piaskownica/schemat'] ?? ladnie(DOMYSLNY_SCHEMAT);
  const startDokument = dokumentZ ?? (schematZ ? '' : stan.edytory['piaskownica/dokument'] ?? ladnie(DOMYSLNY_DOKUMENT));
  const edS = utworzEdytor($('#ed-schemat'), { wartosc: startSchemat });
  const edD = utworzEdytor($('#ed-dokument'), { wartosc: startDokument });
  const mS = edS.getModel();
  const mD = edD.getModel();

  const naLinie = (ed, m) => d => { const p = m.getPositionAt(d.pos ?? 0); ed.focus(); ed.setPosition(p); ed.revealPositionInCenter(p); };

  function sprawdz() {
    const w = sprawdzPiaskownice(mS.getValue(), mD.getValue(), { formaty: !!stan.formaty });
    ustawMarkery(mS, markeryZDiagnozy(w.diagnozaSchematu));
    ustawMarkery(mD, markeryZDiagnozy(w.diagnozaDokumentu));
    const zLinia = (m, lista) => lista.map(d => ({ ...d, linia: d.linia || (typeof d.pos === 'number' ? m.getPositionAt(d.pos).lineNumber : undefined) }));
    renderujDiagnoze($('#diag-schemat'), zLinia(mS, w.diagnozaSchematu), { naLinie: naLinie(edS, mS) });
    const out = $('#werdykt');
    if (w.diagnozaDokumentu.length) {
      renderujDiagnoze(out, zLinia(mD, w.diagnozaDokumentu), { naLinie: naLinie(edD, mD), gdyPusto: null });
      out.classList.add('diagnoza');
      return;
    }
    out.classList.remove('diagnoza');
    if (w.werdykt === null) out.innerHTML = '<div class="werdykt-glowny c">Popraw schemat, żeby sprawdzić dokument.</div>';
    else if (w.werdykt) out.innerHTML = `<div class="werdykt-glowny t">${IKONA_T} Dokument jest zgodny ze schematem.</div>`;
    else out.innerHTML = `<div class="werdykt-glowny n">${IKONA_N} Dokument nie jest zgodny ze schematem · ${w.komunikaty.length} ${odmiana(w.komunikaty.length, ['problem', 'problemy', 'problemów'])}</div><ol class="bledy">${w.komunikaty.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`;
  }

  let timer;
  const pozniej = () => { clearTimeout(timer); timer = setTimeout(sprawdz, 180); };
  const subS = mS.onDidChangeContent(() => { if (!z) ustaw(s => { s.edytory['piaskownica/schemat'] = mS.getValue(); }); pozniej(); });
  const subD = mD.onDidChangeContent(() => { if (!z) ustaw(s => { s.edytory['piaskownica/dokument'] = mD.getValue(); }); pozniej(); });
  $('#b-reset').onclick = () => { zamienTresc(edS, ladnie(DOMYSLNY_SCHEMAT)); zamienTresc(edD, ladnie(DOMYSLNY_DOKUMENT)); };
  const naFormaty = () => sprawdz();
  addEventListener('trener:formaty', naFormaty);
  sprawdz();
  return () => { clearTimeout(timer); removeEventListener('trener:formaty', naFormaty); subS.dispose(); subD.dispose(); edS.dispose(); edD.dispose(); };
}
