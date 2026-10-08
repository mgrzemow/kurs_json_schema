// Pomocnicze do składania HTML ze stringów.
export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Minimalny markdown w linii: `kod`, **pogrubienie**.
export function md(s) {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
