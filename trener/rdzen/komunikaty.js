// Tłumaczenie błędów Ajv na polskie zdania z miejscem w dokumencie.
import { odmiana, krotko, segmenty, wskaz } from './pomocnicze.js';

const TYP_D = {
  string: 'tekstu',
  number: 'liczby',
  integer: 'liczby całkowitej',
  boolean: 'wartości logicznej (true/false)',
  object: 'obiektu { }',
  array: 'listy [ ]',
  null: 'wartości null',
};

export function rodzaj(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'lista';
  if (typeof v === 'string') return 'tekst';
  if (typeof v === 'boolean') return 'wartość logiczna';
  if (typeof v === 'number') return Number.isInteger(v) ? 'liczba całkowita' : 'liczba z częścią ułamkową';
  if (typeof v === 'object') return 'obiekt';
  return typeof v;
}

const jestIndeksem = (s, rodzic) => Array.isArray(rodzic) && /^\d+$/.test(s);

// „Pole „x” w elemencie nr 2” — opis miejsca, którego dotyczy błąd.
export function podmiot(dane, pointer) {
  const seg = segmenty(pointer);
  if (!seg.length) return '';
  const rodzic = j => {
    let v = dane;
    for (let x = 0; x < j; x++) {
      if (v == null) return undefined;
      v = v[seg[x]];
    }
    return v;
  };
  const opis = j => jestIndeksem(seg[j], rodzic(j))
    ? ['Element nr ' + (+seg[j] + 1), 'elemencie nr ' + (+seg[j] + 1)]
    : ['Pole „' + seg[j] + '”', 'polu „' + seg[j] + '”'];
  const ost = opis(seg.length - 1)[0];
  return seg.length > 1 ? ost + ' w ' + opis(seg.length - 2)[1] : ost;
}

export function orzeczenie(e, v) {
  const p = e.params || {};
  switch (e.keyword) {
    case 'type': return 'oczekiwano ' + String(p.type).split(',').map(t => TYP_D[t] || t).join(' lub ') + ', a jest ' + rodzaj(v) + '.';
    case 'required': return 'brakuje wymaganego pola „' + p.missingProperty + '”.';
    case 'additionalProperties': return 'pole „' + p.additionalProperty + '” nie jest przewidziane w schemacie.';
    case 'unevaluatedProperties': return 'pole „' + p.unevaluatedProperty + '” nie jest przewidziane w schemacie.';
    case 'unevaluatedItems': return 'lista ma więcej elementów, niż schemat przewiduje.';
    case 'dependentRequired': return 'skoro jest pole „' + p.property + '”, wymagane jest też pole „' + p.missingProperty + '”.';
    case 'minimum': return krotko(v) + ' to mniej niż dozwolone minimum ' + p.limit + '.';
    case 'maximum': return krotko(v) + ' to więcej niż dozwolone maksimum ' + p.limit + '.';
    case 'exclusiveMinimum': return 'wartość musi być większa niż ' + p.limit + ', a jest ' + krotko(v) + '.';
    case 'exclusiveMaximum': return 'wartość musi być mniejsza niż ' + p.limit + ', a jest ' + krotko(v) + '.';
    case 'multipleOf': return krotko(v) + ' nie jest wielokrotnością ' + p.multipleOf + '.';
    case 'minLength': { const d = [...String(v)].length; return 'tekst ma ' + d + ' ' + odmiana(d, ['znak', 'znaki', 'znaków']) + ', a minimum to ' + p.limit + '.'; }
    case 'maxLength': { const d = [...String(v)].length; return 'tekst ma ' + d + ' ' + odmiana(d, ['znak', 'znaki', 'znaków']) + ', a maksimum to ' + p.limit + '.'; }
    case 'pattern': return 'tekst ' + krotko(v) + ' nie pasuje do wzorca ' + p.pattern + '.';
    case 'format': return 'tekst nie ma formatu „' + p.format + '”.';
    case 'enum': {
      const lista = p.allowedValues || [];
      return krotko(v) + ' nie jest na liście dozwolonych wartości' + (lista.length <= 6 ? ' (' + lista.map(krotko).join(', ') + ').' : '.');
    }
    case 'const': return 'wartość musi być dokładnie ' + krotko(p.allowedValue) + '.';
    case 'minItems': { const d = (v || []).length; return 'lista ma ' + d + ' ' + odmiana(d, ['element', 'elementy', 'elementów']) + ', a minimum to ' + p.limit + '.'; }
    case 'maxItems': { const d = (v || []).length; return 'lista ma ' + d + ' ' + odmiana(d, ['element', 'elementy', 'elementów']) + ', a maksimum to ' + p.limit + '.'; }
    case 'uniqueItems': return 'elementy nr ' + (p.j + 1) + ' i ' + (p.i + 1) + ' są takie same.';
    case 'minProperties': return 'obiekt ma za mało pól (minimum ' + p.limit + ').';
    case 'maxProperties': return 'obiekt ma za dużo pól (maksimum ' + p.limit + ').';
    case 'contains': return 'na liście brakuje elementu pasującego do „contains”.';
    case 'minContains': return 'na liście jest za mało elementów pasujących do „contains” (minimum ' + p.minContains + ').';
    case 'maxContains': return 'na liście jest za dużo elementów pasujących do „contains” (maksimum ' + p.maxContains + ').';
    case 'propertyNames': return 'nazwa pola „' + p.propertyName + '” jest niedozwolona.';
    case 'anyOf': return 'nie pasuje do żadnej z opcji w „anyOf”.';
    case 'oneOf': return p.passingSchemas ? 'pasuje do kilku opcji w „oneOf”, a powinien do dokładnie jednej.' : 'nie pasuje do żadnej z opcji w „oneOf”.';
    case 'not': return 'pasuje do schematu w „not”, a nie powinien.';
    case 'if': return 'nie spełnia warunków z „' + p.failingKeyword + '”.';
    case 'false schema': return 'w tym miejscu żadna wartość nie jest dozwolona.';
    default: return (e.message || 'nie spełnia reguły „' + e.keyword + '”') + '.';
  }
}

export function komunikat(e, dane, { plik } = {}) {
  const v = wskaz(dane, e.instancePath);
  const o = orzeczenie(e, v);
  const pd = podmiot(dane, e.instancePath);
  let zdanie;
  if (pd) zdanie = pd + ': ' + o;
  else zdanie = /^[a-ząćęłńóśźż]/.test(o) ? o.charAt(0).toUpperCase() + o.slice(1) : 'Wartość ' + o;
  if (plik) zdanie = zdanie.replace(/\.$/, '') + ' (reguła z pliku „' + plik + '”).';
  return zdanie;
}

// opcje: obiekt { plik } albo funkcja (blad) => { plik }, gdy każdy błąd może pochodzić z innego pliku.
export function komunikaty(bledy, dane, limit, opcje) {
  const dla = typeof opcje === 'function' ? opcje : () => opcje;
  const wszystkie = [...new Set(bledy.map(e => komunikat(e, dane, dla(e))))];
  return limit ? wszystkie.slice(0, limit) : wszystkie;
}
