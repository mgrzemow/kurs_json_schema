// Formatowanie JSON-a do pokazania w wykładzie i w edytorze. Kompromis między jedną
// długą linią a pełnym rozwinięciem: fragment, który mieści się w zadanej szerokości,
// zostaje w jednej linii; łamane są tylko te, które się nie mieszczą.
// Zapis wartości zostaje bez zmian (1.0 nie staje się 1, ucieczki zostają, duplikaty pól też),
// bo przykłady w kursie bywają właśnie o zapisie.

function drzewo(tekst) {
  let i = 0;
  const bialy = () => { while (i < tekst.length && ' \t\r\n'.includes(tekst[i])) i++; };
  const blad = () => { throw new Error(`Niepoprawny JSON w pozycji ${i}.`); };
  function napis() {
    const p = i++;
    while (i < tekst.length && tekst[i] !== '"') i += tekst[i] === '\\' ? 2 : 1;
    if (tekst[i] !== '"') blad();
    i++;
    return tekst.slice(p, i);
  }
  function wartosc() {
    bialy();
    const c = tekst[i];
    if (c === '{') {
      i++; bialy();
      const pary = [];
      if (tekst[i] === '}') { i++; return { pary }; }
      for (;;) {
        bialy();
        if (tekst[i] !== '"') blad();
        const k = napis();
        bialy();
        if (tekst[i++] !== ':') blad();
        pary.push([k, wartosc()]);
        bialy();
        if (tekst[i] === ',') { i++; continue; }
        if (tekst[i] === '}') { i++; return { pary }; }
        blad();
      }
    }
    if (c === '[') {
      i++; bialy();
      const el = [];
      if (tekst[i] === ']') { i++; return { el }; }
      for (;;) {
        el.push(wartosc());
        bialy();
        if (tekst[i] === ',') { i++; continue; }
        if (tekst[i] === ']') { i++; return { el }; }
        blad();
      }
    }
    if (c === '"') return { surowe: napis() };
    const m = /^(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(tekst.slice(i));
    if (!m) blad();
    i += m[0].length;
    return { surowe: m[0] };
  }
  const w = wartosc();
  bialy();
  if (i < tekst.length) blad();
  return w;
}

function wLinii(w) {
  if (w.surowe !== undefined) return w.surowe;
  if (w.el) return '[' + w.el.map(wLinii).join(', ') + ']';
  return w.pary.length ? '{ ' + w.pary.map(([k, v]) => k + ': ' + wLinii(v)).join(', ') + ' }' : '{}';
}

function formatuj(w, wciecie, zajete, szerokosc) {
  const linia = wLinii(w);
  if (w.surowe !== undefined || wciecie.length + zajete + linia.length <= szerokosc) return linia;
  const nw = wciecie + '  ';
  if (w.el) return '[\n' + w.el.map(x => nw + formatuj(x, nw, 0, szerokosc)).join(',\n') + '\n' + wciecie + ']';
  return '{\n' + w.pary.map(([k, v]) => nw + k + ': ' + formatuj(v, nw, k.length + 2, szerokosc)).join(',\n') + '\n' + wciecie + '}';
}

export function formatujJSON(tekst, { szerokosc = 56 } = {}) {
  return formatuj(drzewo(tekst), '', 0, szerokosc);
}
