// Drobne funkcje współdzielone przez rdzeń, interfejs i skrypty.

export function odmiana(n, [poj, kilka, wiele]) {
  if (n === 1) return poj;
  const d = n % 10;
  const s = n % 100;
  return (d >= 2 && d <= 4 && !(s >= 12 && s <= 14)) ? kilka : wiele;
}

// Jednolinijkowy zapis wartości (do kart przykładów i komunikatów).
export function jeden(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(jeden).join(', ') + ']';
  const e = Object.entries(v);
  return e.length ? '{ ' + e.map(([k, x]) => JSON.stringify(k) + ': ' + jeden(x)).join(', ') + ' }' : '{}';
}

// Czytelny zapis: krótkie wartości w jednej linii, dłuższe wcięte.
export function ladnie(v, wc = '') {
  if (v === null || typeof v !== 'object' || jeden(v).length + wc.length <= 52) return jeden(v);
  const nw = wc + '  ';
  if (Array.isArray(v)) return '[\n' + v.map(x => nw + ladnie(x, nw)).join(',\n') + '\n' + wc + ']';
  return '{\n' + Object.entries(v).map(([k, x]) => nw + JSON.stringify(k) + ': ' + ladnie(x, nw)).join(',\n') + '\n' + wc + '}';
}

export function krotko(v) {
  const s = JSON.stringify(v);
  return s === undefined ? 'undefined' : s.length > 40 ? s.slice(0, 37) + '…' : s;
}

export function kodujSegment(s) {
  return s.replace(/~/g, '~0').replace(/\//g, '~1');
}

export function segmenty(pointer) {
  return pointer ? pointer.split('/').slice(1).map(s => s.replace(/~1/g, '/').replace(/~0/g, '~')) : [];
}

export function wskaz(dane, pointer) {
  let v = dane;
  for (const s of segmenty(pointer)) {
    if (v == null) return undefined;
    v = v[s];
  }
  return v;
}
