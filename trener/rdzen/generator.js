// Generator schematu w stylu genson: opisuje to, co jest w przykładach, a nie to, co powinno być.
// Celowo ma te same wady, co prawdziwe generatory: required z obecności pól, integer gdy
// akurat wszystkie liczby były całkowite, brak enum, wzorców i zakresów.

function typProsty(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'string') return 'string';
  return 'object';
}

// Węzeł zbiera informacje o wszystkich wartościach widzianych w jednym miejscu dokumentu.
function nowyWezel() {
  return { typy: [], obiekt: null, tablica: null };
}

function dodaj(wezel, v) {
  const t = typProsty(v);
  if (t === 'object') {
    if (!wezel.obiekt) wezel.obiekt = { pola: new Map(), wymagane: null, liczba: 0 };
    const o = wezel.obiekt;
    o.liczba++;
    const klucze = Object.keys(v);
    for (const k of klucze) {
      if (!o.pola.has(k)) o.pola.set(k, nowyWezel());
      dodaj(o.pola.get(k), v[k]);
    }
    o.wymagane = o.wymagane === null ? new Set(klucze) : new Set([...o.wymagane].filter(k => klucze.includes(k)));
  } else if (t === 'array') {
    if (!wezel.tablica) wezel.tablica = { elementy: nowyWezel(), niepusta: false };
    for (const x of v) { wezel.tablica.niepusta = true; dodaj(wezel.tablica.elementy, x); }
  } else if (!wezel.typy.includes(t)) {
    wezel.typy.push(t);
  }
  if (t !== 'object' && t !== 'array') return;
  if (!wezel.typy.includes(t)) wezel.typy.push(t);
}

function schematZWezla(wezel) {
  const proste = wezel.typy.filter(t => t !== 'object' && t !== 'array');
  // number pochłania integer
  const typyProste = proste.includes('number') ? proste.filter(t => t !== 'integer') : proste;
  const czesci = [];
  if (typyProste.length) czesci.push({ type: typyProste.length === 1 ? typyProste[0] : typyProste });
  if (wezel.obiekt) {
    const s = { type: 'object' };
    if (wezel.obiekt.pola.size) {
      s.properties = {};
      for (const [k, w] of wezel.obiekt.pola) s.properties[k] = schematZWezla(w);
    }
    const wymagane = [...(wezel.obiekt.wymagane || [])];
    if (wymagane.length) s.required = wymagane;
    czesci.push(s);
  }
  if (wezel.tablica) {
    const s = { type: 'array' };
    if (wezel.tablica.niepusta) s.items = schematZWezla(wezel.tablica.elementy);
    czesci.push(s);
  }
  if (czesci.length === 0) return {};
  if (czesci.length === 1) return czesci[0];
  // Same typy proste można złączyć w jedną listę; obiekt albo tablica obok nich wymagają anyOf.
  return { anyOf: czesci };
}

export function generujSchemat(wartosci) {
  const korzen = nowyWezel();
  for (const v of wartosci) dodaj(korzen, v);
  return { $schema: 'https://json-schema.org/draft/2020-12/schema', ...schematZWezla(korzen) };
}
