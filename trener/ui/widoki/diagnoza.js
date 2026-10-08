// Lista uwag pod edytorem: błędy składni, błędy schematu, ostrzeżenia, informacje.
import { esc } from '../html.js';

const ZNAK = { blad: '!', ostrz: '?', info: 'i', dobrze: '✓' };
const ETYKIETA = { ostrz: 'Uwaga', info: 'Dobrze wiedzieć' };

// diagnoza: [{ poziom, rodzaj?, tekst, pos?, linia?, plik? }]
// opcje.gdyPusto: tekst pokazywany, gdy nie ma uwag (null = nic nie pokazuj)
// opcje.naLinie(d): wywoływane po kliknięciu przycisku „linia N”
export function renderujDiagnoze(kontener, diagnoza, { gdyPusto = 'Schemat jest poprawny.', naLinie, pokazPlik = false } = {}) {
  if (!diagnoza.length) {
    kontener.innerHTML = gdyPusto ? `<div class="diag dobrze"><span class="znak" aria-hidden="true">✓</span><p>${esc(gdyPusto)}</p><span></span></div>` : '';
    return;
  }
  kontener.innerHTML = diagnoza.map((d, i) => {
    const etykieta = d.rodzaj || ETYKIETA[d.poziom] || '';
    const gdzie = [pokazPlik && d.plik ? `plik „${esc(d.plik)}”` : null, d.linia ? `linia ${d.linia}${d.kolumna ? `, kol. ${d.kolumna}` : ''}` : null].filter(Boolean).join(', ');
    const przycisk = (d.linia || typeof d.pos === 'number') && naLinie ? `<button type="button" class="do-linii" data-i="${i}">${gdzie || 'pokaż'}</button>` : `<span class="gdzie">${gdzie}</span>`;
    return `<div class="diag ${d.poziom}"><span class="znak" aria-hidden="true">${ZNAK[d.poziom] || ''}</span><p>${etykieta ? `<span class="etykieta">${esc(etykieta)}.</span> ` : ''}${esc(d.tekst)}</p>${przycisk}</div>`;
  }).join('');
  if (naLinie) {
    kontener.querySelectorAll('.do-linii').forEach(b => { b.onclick = () => naLinie(diagnoza[+b.dataset.i]); });
  }
}

// Zamienia diagnozę na markery Monaco (tylko wpisy z pozycją w tekście).
export function markeryZDiagnozy(diagnoza, plik) {
  return diagnoza.filter(d => typeof d.pos === 'number' && (!plik || d.plik === plik)).map(d => ({ pos: d.pos, komunikat: d.tekst, poziom: d.poziom }));
}
