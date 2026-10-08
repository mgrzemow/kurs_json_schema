// Parser JSON z polskimi komunikatami błędów i pozycją błędu.
// Zwraca wartość, mapę kluczy (JSON Pointer → offset) i listę zduplikowanych kluczy.
// Bez zależności od przeglądarki: działa w Node i w przeglądarce.

import { kodujSegment } from './pomocnicze.js';

const DRUKARSKIE = '“”„‟″';
const RE_LICZBA = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/y;

export class BladSkladni extends Error {
  constructor(message, pos, tekst) {
    super(message);
    this.name = 'BladSkladni';
    this.pos = Math.max(0, Math.min(pos, tekst.length));
    const przed = tekst.slice(0, this.pos);
    const ostatniNowaLinia = przed.lastIndexOf('\n');
    this.linia = przed.split('\n').length;
    this.kolumna = this.pos - ostatniNowaLinia;
  }
}


export function parsujJSON(t, komunikatPusty) {
  let i = 0;
  const n = t.length;
  const klucze = new Map();
  const duplikaty = [];
  const linia = p => t.slice(0, p).split('\n').length;
  const fail = (msg, pos = i) => { throw new BladSkladni(msg, pos, t); };

  const ws = () => {
    for (;;) {
      const c = t[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') i++;
      else if (c === ' ' || c === ' ' || c === ' ') fail('Tu jest twarda spacja (często zostaje po kopiowaniu z Worda lub maila). Usuń ją i wpisz zwykłą spację.');
      else if (c === '/' && (t[i + 1] === '/' || t[i + 1] === '*')) fail('JSON nie pozwala na komentarze. Usuń komentarz. W dokumencie informację wpisz w zwykłym polu (np. "uwagi"), a w schemacie w polu "description".');
      else return;
    }
  };

  const tekst = () => {
    const start = i;
    i++;
    let s = '';
    for (;;) {
      if (i >= n) fail('Tekst nie ma zamykającego cudzysłowu.', start);
      const c = t[i];
      if (c === '"') { i++; return s; }
      if (c === '\n' || c === '\r') fail('Tekst nie ma zamykającego cudzysłowu przed końcem linii.', start);
      if (c === '\\') {
        const d = t[i + 1];
        const mapa = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
        if (d !== undefined && Object.prototype.hasOwnProperty.call(mapa, d)) { s += mapa[d]; i += 2; continue; }
        if (d === 'u' && /^[0-9a-fA-F]{4}$/.test(t.substr(i + 2, 4))) { s += String.fromCharCode(parseInt(t.substr(i + 2, 4), 16)); i += 6; continue; }
        fail('Odwrotny ukośnik \\' + (d || '') + ' nie jest dozwolony w tekście JSON. Ukośnik trzeba podwoić: \\\\' + (d || '') + '.');
      }
      if (c < ' ') fail('Tekst zawiera niedozwolony znak sterujący, np. tabulator. Usuń go.');
      s += c;
      i++;
    }
  };

  const liczba = () => {
    RE_LICZBA.lastIndex = i;
    const m = RE_LICZBA.exec(t);
    if (!m) fail('Po minusie powinna być liczba.');
    const po = t[i + m[0].length];
    if (m[1] === '0' && !m[2] && !m[3] && po >= '0' && po <= '9') fail('Liczba nie może zaczynać się od zera. Jeśli to kod (np. pocztowy), zapisz go jako tekst w cudzysłowie.');
    if (po === '.') fail('Po kropce dziesiętnej musi być cyfra.', i + m[0].length);
    i += m[0].length;
    return Number(m[0]);
  };

  const ustaw = (o, k, v) => Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true });

  const obiekt = p => {
    const start = i;
    i++;
    const o = {};
    let przecinek = -1;
    ws();
    if (t[i] === '}') { i++; return o; }
    for (;;) {
      ws();
      const c = t[i];
      if (i >= n) fail('Brakuje nawiasu „}” zamykającego obiekt otwarty w linii ' + linia(start) + '.');
      if (c === '}' && przecinek >= 0) fail('Zbędny przecinek przed „}”. Po ostatnim polu nie stawiamy przecinka.', przecinek);
      if (c === "'") fail('Nazwa pola musi być w podwójnym cudzysłowie "…", nie w apostrofach.');
      if (DRUKARSKIE.includes(c)) fail('To cudzysłów drukarski. JSON rozumie tylko zwykły cudzysłów " z klawiatury.');
      if (c >= '0' && c <= '9' && przecinek >= 0) fail('Po przecinku powinna być nazwa pola. Jeśli to liczba dziesiętna, użyj kropki zamiast przecinka, np. 2.5.', przecinek);
      if (c !== '"') fail('Nazwa pola musi być w cudzysłowie, np. "nazwa".');
      const kpos = i;
      const k = tekst();
      ws();
      if (t[i] !== ':') fail('Po nazwie pola "' + k + '" brakuje dwukropka.');
      i++;
      const kp = p + '/' + kodujSegment(k);
      if (Object.prototype.hasOwnProperty.call(o, k)) duplikaty.push({ klucz: k, pos: kpos });
      klucze.set(kp, kpos);
      ustaw(o, k, wartosc(kp));
      const koniec = i;
      ws();
      if (t[i] === ',') { przecinek = i; i++; continue; }
      if (t[i] === '}') { i++; return o; }
      if (i >= n) fail('Brakuje nawiasu „}” zamykającego obiekt otwarty w linii ' + linia(start) + '.', koniec);
      if (t[i] === ']') fail('Nawias „]” nie pasuje. Obiekt otwarty nawiasem „{” zamykamy nawiasem „}”.');
      if (t[i] === '"') fail('Brakuje przecinka po tej wartości. Pola obiektu oddzielamy przecinkami.', koniec);
      fail('Spodziewano się przecinka albo „}”, a jest „' + t[i] + '”.');
    }
  };

  const lista = p => {
    const start = i;
    i++;
    const a = [];
    let przecinek = -1;
    ws();
    if (t[i] === ']') { i++; return a; }
    for (;;) {
      ws();
      if (t[i] === ']' && przecinek >= 0) fail('Zbędny przecinek przed „]”. Po ostatnim elemencie nie stawiamy przecinka.', przecinek);
      if (i >= n) fail('Brakuje nawiasu „]” zamykającego listę otwartą w linii ' + linia(start) + '.');
      a.push(wartosc(p + '/' + a.length));
      const koniec = i;
      ws();
      if (t[i] === ',') { przecinek = i; i++; continue; }
      if (t[i] === ']') { i++; return a; }
      if (i >= n) fail('Brakuje nawiasu „]” zamykającego listę otwartą w linii ' + linia(start) + '.', koniec);
      if (t[i] === '}') fail('Nawias „}” nie pasuje. Listę otwartą nawiasem „[” zamykamy nawiasem „]”.');
      fail('Brakuje przecinka między elementami listy.', koniec);
    }
  };

  const wartosc = p => {
    ws();
    if (i >= n) fail('Tekst kończy się w miejscu, gdzie powinna być wartość. Może brakuje nawiasu zamykającego?');
    const c = t[i];
    if (c === '{') return obiekt(p);
    if (c === '[') return lista(p);
    if (c === '"') return tekst();
    if (c === "'") fail('Tekst musi być w podwójnym cudzysłowie "…", nie w apostrofach.');
    if (DRUKARSKIE.includes(c)) fail('To cudzysłów drukarski. JSON rozumie tylko zwykły cudzysłów " z klawiatury.');
    if (c === '-' || (c >= '0' && c <= '9')) return liczba();
    for (const [s, v] of [['true', true], ['false', false], ['null', null]]) {
      if (t.startsWith(s, i) && !/[\wÀ-ſ]/.test(t[i + s.length] || '')) { i += s.length; return v; }
    }
    if (c === '}' || c === ']') fail('W tym miejscu brakuje wartości. Może przed nawiasem jest zbędny przecinek albo po dwukropku nic nie wpisano?');
    if (c === ',') fail('W tym miejscu brakuje wartości, a jest przecinek.');
    if (c === ':') fail('Tu jest zbędny dwukropek.');
    const m = /^[^\s,:{}[\]"]+/.exec(t.slice(i));
    const w = m ? m[0] : c;
    if (/^(true|false|null)$/i.test(w)) fail('Słowa true, false i null piszemy małymi literami.');
    if (/^(None|undefined|NaN|Infinity|nil)$/.test(w)) fail('„' + w + '” nie istnieje w JSON-ie. Brak wartości zapisz jako null.');
    fail('„' + w + '” nie jest poprawną wartością. Jeśli to tekst, otocz go cudzysłowem: "' + w + '".');
  };

  ws();
  if (i >= n) fail(komunikatPusty || 'Pole jest puste.', 0);
  const wynik = wartosc('');
  ws();
  if (i < n) fail((t[i] === '}' || t[i] === ']') ? 'Na końcu jest o jeden nawias za dużo.' : 'Po zamknięciu całości jest jeszcze tekst. Może brakuje przecinka albo nawiasu?');
  return { wartosc: wynik, klucze, duplikaty };
}
