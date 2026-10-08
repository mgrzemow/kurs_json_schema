// Pomocnicze do składania HTML ze stringów. Bez zależności od przeglądarki:
// używa ich także budowanie materiałów statycznych.
import { klasaKodu, NAZWY_KLAS } from '../rdzen/kod-w-tekscie.js';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Minimalny markdown w linii: `kod`, **pogrubienie**. Kod dostaje klasę schematu albo dokumentu:
// słowo kluczowe automatycznie, reszta według znacznika `…`{s} / `…`{d}.
export function md(s) {
  const kody = [];
  const bez = String(s ?? '').replace(/`([^`]+)`(?:\{([sd])\})?/g, (_, kod, z) => {
    const k = klasaKodu(kod, z);
    kody.push(k ? `<code class="${NAZWY_KLAS[k]}">${esc(kod)}</code>` : `<code>${esc(kod)}</code>`);
    return `\u0000${kody.length - 1}\u0000`;
  });
  return esc(bez)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => kody[+i]);
}

export function gwiazdki(poziom) {
  return '★'.repeat(poziom) + '<span class="szare">' + '★'.repeat(3 - poziom) + '</span>';
}

// Kolorowanie JSON-a do podglądu (bez edytora).
export function koloruj(json) {
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(json))) {
    out += esc(json.slice(last, m.index));
    if (m[1]) out += m[2] ? '<span class="t-key">' + esc(m[1]) + '</span>' + esc(m[2]) : '<span class="t-str">' + esc(m[1]) + '</span>';
    else out += '<span class="' + (m[3] ? 't-atom' : 't-num') + '">' + m[0] + '</span>';
    last = re.lastIndex;
  }
  return out + esc(json.slice(last));
}
