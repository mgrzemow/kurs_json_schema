// Ostrzeżenia o schemacie, których walidator sam nie zgłasza:
// nieznane słowa kluczowe (z podpowiedzią), required bez properties, format jako adnotacja.
import { kodujSegment } from './pomocnicze.js';

export const ZNANE_SLOWA = new Set((
  '$schema $id $ref $anchor $dynamicRef $dynamicAnchor $vocabulary $comment $defs definitions ' +
  'type enum const multipleOf maximum exclusiveMaximum minimum exclusiveMinimum maxLength minLength pattern ' +
  'maxItems minItems uniqueItems maxContains minContains maxProperties minProperties required dependentRequired ' +
  'allOf anyOf oneOf not if then else dependentSchemas dependencies prefixItems items additionalItems contains ' +
  'properties patternProperties additionalProperties propertyNames unevaluatedItems unevaluatedProperties ' +
  'format contentEncoding contentMediaType contentSchema title description default deprecated readOnly writeOnly examples'
).split(' '));

export const TYPY = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'];

// Słowa, których wartość jest schematem (albo listą schematów).
const PODSCHEMAT = ['items', 'not', 'if', 'then', 'else', 'additionalProperties', 'additionalItems', 'contains', 'propertyNames', 'unevaluatedItems', 'unevaluatedProperties', 'contentSchema'];
// Słowa, których wartość to mapa nazwa → schemat.
const MAPA = ['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas'];
// Słowa, których wartość to lista schematów.
const LISTA = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];

export { PODSCHEMAT, MAPA, LISTA };

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

export function najblizszeSlowo(k) {
  let best = null;
  let bd = 99;
  for (const z of ZNANE_SLOWA) {
    const d = lev(k.toLowerCase(), z.toLowerCase());
    if (d < bd) { bd = d; best = z; }
  }
  return bd <= (k.length <= 5 ? 1 : 2) ? best : null;
}

export function analizujSchemat(s, klucze = new Map(), { formaty = false } = {}) {
  const out = [];
  let formatPokazany = false;
  (function idz(s, p) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return;
    for (const k of Object.keys(s)) {
      const v = s[k];
      const kp = p + '/' + kodujSegment(k);
      if (!ZNANE_SLOWA.has(k)) {
        const pod = najblizszeSlowo(k);
        let tekst = '„' + k + '” nie jest słowem kluczowym JSON Schema, więc walidator je pomija.';
        if (pod) tekst += ' Czy chodziło o „' + pod + '”?';
        else if (v && typeof v === 'object' && !Array.isArray(v)) tekst += ' Jeśli to nazwa pola, przenieś je do „properties”.';
        out.push({ poziom: 'ostrz', tekst, pos: klucze.get(kp) });
        continue;
      }
      if (k === 'format' && !formatPokazany) {
        formatPokazany = true;
        out.push({ poziom: 'info', tekst: formaty
          ? '„format” jest teraz sprawdzany jak reguła, bo w pasku włączono „walidacja format”. Bez tego przełącznika byłby samą adnotacją.'
          : '„format” to tu tylko opis. Domyślnie walidator go nie sprawdza, więc np. "abc" przejdzie jako e-mail. Włącz „walidacja format” w pasku, żeby to zmienić.', pos: klucze.get(kp) });
      }
      if (k === 'required' && Array.isArray(v) && s.properties && typeof s.properties === 'object') {
        for (const r of v) {
          if (typeof r === 'string' && !Object.prototype.hasOwnProperty.call(s.properties, r)) {
            out.push({ poziom: 'ostrz', tekst: 'Pole „' + r + '” jest w „required”, ale nie ma go w „properties”. To może być literówka.', pos: klucze.get(kp) });
          }
        }
      }
      if (PODSCHEMAT.includes(k)) {
        if (Array.isArray(v)) v.forEach((x, j) => idz(x, kp + '/' + j));
        else idz(v, kp);
      } else if (MAPA.includes(k) && v && typeof v === 'object') {
        for (const nm of Object.keys(v)) idz(v[nm], kp + '/' + kodujSegment(nm));
      } else if (LISTA.includes(k) && Array.isArray(v)) {
        v.forEach((x, j) => idz(x, kp + '/' + j));
      }
    }
  })(s, '');
  return out;
}
