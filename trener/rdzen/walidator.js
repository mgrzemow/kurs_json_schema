// Opakowanie Ajv w trybie 2020-12: kompilacja pojedynczego schematu albo projektu
// z wielu plików, z błędami przetłumaczonymi na polski. Bez zależności od przeglądarki.
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { krotko, segmenty, wskaz } from './pomocnicze.js';
import { orzeczenie } from './komunikaty.js';
import { TYPY, PODSCHEMAT, MAPA, LISTA } from './analiza-schematu.js';

export class BladSchematu extends Error {
  constructor(message, { pos, plik } = {}) {
    super(message);
    this.name = 'BladSchematu';
    this.pos = pos;
    this.plik = plik;
  }
}

const OPCJE_AJV = { allErrors: true, strict: false, useDefaults: false, validateSchema: true, allowUnionTypes: true };

function nowyAjv(formaty) {
  // logger: false — ostrzeżenia Ajv (np. „unknown format … ignored”) nie trafiają do konsoli; trener ma własne, polskie.
  const ajv = new Ajv2020({ ...OPCJE_AJV, validateFormats: formaty, logger: false });
  if (formaty) addFormats(ajv, { mode: 'full' });
  return ajv;
}

// Usuwa obcy nagłówek $schema (Ajv 2020 nie zna draft-07) i zwraca informację dla uczestnika.
const SCHEMA_2020 = 'https://json-schema.org/draft/2020-12/schema';

export function przygotujSchemat(wartosc, klucze = new Map()) {
  const uwagi = [];
  let schemat = wartosc;
  if (wartosc && typeof wartosc === 'object' && !Array.isArray(wartosc) && '$schema' in wartosc && wartosc.$schema !== SCHEMA_2020) {
    schemat = { ...wartosc };
    delete schemat.$schema;
    const tekst = typeof wartosc.$schema === 'string' && /draft-0[3-7]|2019-09/.test(wartosc.$schema)
      ? 'Walidator na tej stronie sprawdza według wersji 2020-12. Podstawowe słowa kluczowe działają w niej tak samo jak w starszych wersjach.'
      : 'Nieznana wartość „$schema”. Walidator na tej stronie sprawdza według wersji 2020-12 (' + SCHEMA_2020 + ').';
    uwagi.push({ poziom: 'info', tekst, pos: klucze.get('/$schema') });
  }
  return { schemat, uwagi };
}

const sciezka = ptr => segmenty(ptr).join(' → ');

// Tłumaczy błąd metaschematu (schemat nie jest poprawnym schematem) na jeden polski komunikat.
function bladMeta(bledy, schemat, klucze) {
  const typBlad = bledy.find(e => e.keyword === 'enum' && /\/type$/.test(e.instancePath));
  if (typBlad) {
    const v = wskaz(schemat, typBlad.instancePath);
    return new BladSchematu('„type” ma nieznaną wartość ' + krotko(v) + '. Dozwolone: ' + TYPY.map(t => '"' + t + '"').join(', ') + '.', { pos: klucze.get(typBlad.instancePath) });
  }
  // Nawyki ze starych wersji: komunikat mówi, z której wersji pochodzi zapis i jak go przepisać.
  const stary = bledy.find(x => /\/(exclusiveMinimum|exclusiveMaximum)$/.test(x.instancePath) && typeof wskaz(schemat, x.instancePath) === 'boolean');
  if (stary) {
    const slowo = segmenty(stary.instancePath).pop();
    const granica = slowo === 'exclusiveMinimum' ? 'minimum' : 'maximum';
    return new BladSchematu('„' + slowo + '”: true obok „' + granica + '” to zapis z draft-04. W 2020-12 granica wyłączna jest liczbą, np. "' + slowo + '": 0 zamiast "' + granica + '": 0 i "' + slowo + '": true.', { pos: klucze.get(stary.instancePath) });
  }
  const wymWProps = bledy.find(x => /\/properties\/required$/.test(x.instancePath) && Array.isArray(wskaz(schemat, x.instancePath)));
  if (wymWProps) {
    return new BladSchematu('„required” stoi w środku „properties”, więc walidator bierze je za opis pola o nazwie „required”. Przenieś „required” poziom wyżej, obok „properties”.', { pos: klucze.get(wymWProps.instancePath) });
  }
  const krotka = bledy.find(x => /\/items$/.test(x.instancePath) && Array.isArray(wskaz(schemat, x.instancePath)));
  if (krotka) {
    return new BladSchematu('Lista schematów w „items” to zapis krotki z draft-07. W 2020-12 pozycje opisuje „prefixItems”, a „items”: false zabrania dalszych elementów.', { pos: klucze.get(krotka.instancePath) });
  }
  const e = bledy.find(x => !['anyOf', 'oneOf', 'if'].includes(x.keyword)) || bledy[0];
  const v = wskaz(schemat, e.instancePath);
  const seg = segmenty(e.instancePath);
  if (typeof v === 'string' && TYPY.includes(v) && seg.length >= 2 && MAPA.concat(PODSCHEMAT).includes(seg[seg.length - 2])) {
    return new BladSchematu('W „' + sciezka(e.instancePath) + '” zamiast schematu jest samo "' + v + '". Napisz { "type": "' + v + '" }.', { pos: klucze.get(e.instancePath) });
  }
  const gdzie = e.instancePath ? 'W „' + sciezka(e.instancePath) + '”: ' : '';
  const o = orzeczenie(e, v);
  return new BladSchematu(gdzie + (gdzie ? o : o.charAt(0).toUpperCase() + o.slice(1)), { pos: klucze.get(e.instancePath) });
}

// Tłumaczy wyjątek rzucony przez Ajv przy kompilacji.
// Najczęstsze komunikaty silnika regex V8 po polsku.
const REGEX_PO_POLSKU = [
  [/Unterminated character class/i, 'niedomknięta klasa znaków „[”'],
  [/Unterminated group/i, 'niedomknięty nawias „(”'],
  [/Unmatched '\)'/i, 'nawias „)” bez otwierającego „(”'],
  [/Nothing to repeat/i, 'powtórzenie („*”, „+”, „?”, „{n}”) bez niczego przed nim'],
  [/Lone quantifier brackets/i, 'samotny nawias „{” lub „}” (w trybie Unicode nawias klamrowy trzeba poprzedzić „\\”)'],
  [/Invalid escape/i, 'niepoprawna ucieczka po „\\” (w trybie Unicode wolno uciekać tylko znaki specjalne)'],
  [/Invalid property name/i, 'niepoprawna nazwa właściwości Unicode po „\\p”'],
  [/Range out of order/i, 'zakres w klasie znaków ma początek większy niż koniec'],
];

function wyjatek(e, { plik, pliki } = {}) {
  const m = String((e && e.message) || e);
  if (/regular expression|RegExp/i.test(m)) {
    const wzorzec = (/\/(.*)\/[a-z]*:/.exec(m) || [])[1];
    const traf = REGEX_PO_POLSKU.find(([re]) => re.test(m));
    const powod = traf ? traf[1] : m.replace(/^Invalid regular expression:\s*/, '');
    return new BladSchematu('Wzorzec ' + (wzorzec !== undefined ? '„' + wzorzec + '” ' : '') + 'nie jest poprawnym wyrażeniem regularnym: ' + powod + '.', { plik });
  }
  if (/enum must have non-empty array/.test(m)) return new BladSchematu('„enum” musi mieć co najmniej jedną wartość. Pusta lista nie przepuściłaby niczego.', { plik });
  if (/\$dynamicRef|Maximum call stack/.test(m)) return new BladSchematu('Walidator nie radzi sobie z tym schematem (' + (/\$dynamicRef/.test(m) ? '„$dynamicRef” poza zakresem kursu' : 'zbyt głębokie odwołania') + ').', { plik });
  if (/no schema with key or ref/.test(m)) return new BladSchematu('Walidator nie zna schematu, do którego odwołuje się ten plik: ' + m.replace(/^.*key or ref\s*/, '') + '.', { plik });
  const r = /can't resolve reference (\S+) from id (\S+)/.exec(m);
  if (r) {
    if (pliki) {
      const zPliku = Object.keys(pliki).find(n => pliki[n].wartosc && pliki[n].wartosc.$id === r[2]) || plik;
      return new BladSchematu('Odwołanie „' + r[1] + '” w pliku „' + zPliku + '” nie prowadzi do żadnego schematu. Sprawdź „$id” plików i nazwę w odwołaniu.', { plik: zPliku });
    }
    return new BladSchematu('Odwołanie ' + r[1] + ' nie prowadzi do żadnego miejsca w schemacie. Sprawdź całą ścieżkę po „#”: każdy segment musi być kluczem, który naprawdę istnieje, np. „#/$defs/adres/properties/kodPocztowy”.', { plik });
  }
  return new BladSchematu('Walidator nie może użyć tego schematu: ' + m, { plik });
}

function bezFragmentu(url) {
  return url.replace(/#.*$/, '');
}

// Zbiera wszystkie $ref z pliku (rekurencyjnie po podschematach).
function zbierzRefy(s, out = []) {
  if (!s || typeof s !== 'object') return out;
  if (Array.isArray(s)) { s.forEach(x => zbierzRefy(x, out)); return out; }
  for (const k of Object.keys(s)) {
    const v = s[k];
    if (k === '$ref' && typeof v === 'string') out.push(v);
    else if (PODSCHEMAT.includes(k) || LISTA.includes(k)) zbierzRefy(v, out);
    else if (MAPA.includes(k) && v && typeof v === 'object') Object.values(v).forEach(x => zbierzRefy(x, out));
  }
  return out;
}

export function utworzWalidator({ formaty = false } = {}) {
  let ajv = nowyAjv(formaty);

  // sprawdz(dane) → { ok: true|false|null, bledy, blad? }; ok === null, gdy walidator wywrócił się
  // w czasie sprawdzania (np. nieskończona rekurencja przez „$dynamicRef”).
  function opakuj(fn, projekt) {
    const sprawdz = dane => {
      let ok;
      try {
        ok = fn(dane);
      } catch (e) {
        return { ok: null, bledy: [], blad: 'Walidator nie radzi sobie z tym schematem przy tym dokumencie (' + (/Maximum call stack/.test(String(e.message)) ? 'nieskończone odwołania' : String(e.message)) + ').' };
      }
      return { ok, bledy: ok ? [] : (fn.errors || []).slice() };
    };
    return projekt ? { sprawdz, ...projekt } : { sprawdz };
  }

  function kompiluj(wartosc, klucze = new Map()) {
    const { schemat, uwagi } = przygotujSchemat(wartosc, klucze);
    if (typeof schemat !== 'boolean' && (schemat === null || typeof schemat !== 'object' || Array.isArray(schemat))) {
      throw new BladSchematu('Schemat musi być obiektem w nawiasach klamrowych { }.', { pos: 0 });
    }
    try {
      if (!ajv.validateSchema(schemat)) throw bladMeta(ajv.errors, schemat, klucze);
      const fn = ajv.compile(schemat);
      try { ajv.removeSchema(schemat); } catch (_) { /* schemat bez $id nie jest zarejestrowany */ }
      return opakuj(fn, { uwagi });
    } catch (e) {
      ajv = nowyAjv(formaty);
      throw e instanceof BladSchematu ? e : wyjatek(e);
    }
  }

  // Mapa nazwa pliku → $id oraz lista odwołań z rozwiązaniem na nazwę pliku (null = zepsute).
  function znajdzOdwolania(pliki) {
    const idPlikow = {};
    for (const [nazwa, p] of Object.entries(pliki)) {
      if (p.wartosc && typeof p.wartosc.$id === 'string') idPlikow[nazwa] = bezFragmentu(p.wartosc.$id);
    }
    const naNazwe = Object.fromEntries(Object.entries(idPlikow).map(([n, id]) => [id, n]));
    const odwolania = [];
    for (const [nazwa, p] of Object.entries(pliki)) {
      for (const ref of zbierzRefy(p.wartosc)) {
        if (ref.startsWith('#')) continue;
        let cel = null;
        try { cel = naNazwe[bezFragmentu(new URL(ref, idPlikow[nazwa] || 'https://kurs.example/').href)] ?? null; } catch (_) { cel = null; }
        odwolania.push({ zPliku: nazwa, ref, doPliku: cel });
      }
    }
    return odwolania;
  }

  function kompilujProjekt(pliki, glowny) {
    const inst = nowyAjv(formaty);
    const idPlikow = {};
    const uwagi = [];
    for (const [nazwa, p] of Object.entries(pliki)) {
      const przygotowany = przygotujSchemat(p.wartosc, p.klucze);
      const schemat = przygotowany.schemat;
      for (const u of przygotowany.uwagi) uwagi.push({ ...u, plik: nazwa });
      if (schemat && typeof schemat === 'object' && typeof schemat.$id === 'string' && !/^[a-z][a-z0-9+.-]*:/i.test(schemat.$id)) {
        throw new BladSchematu('„$id” w pliku „' + nazwa + '” jest względny („' + schemat.$id + '”). Plik na najwyższym poziomie musi mieć pełny adres, bo nie ma względem czego go rozwiązać, np. „https://kurs.example/schematy/' + schemat.$id + '”.', { plik: nazwa });
      }
      if (!schemat || typeof schemat !== 'object' || typeof schemat.$id !== 'string') {
        throw new BladSchematu('Plik „' + nazwa + '” nie ma „$id”. W projekcie z wieloma plikami każdy schemat musi mieć „$id”, żeby inne mogły się do niego odwołać.', { plik: nazwa });
      }
      let poprawny;
      try { poprawny = inst.validateSchema(schemat); } catch (e) { throw wyjatek(e, { plik: nazwa, pliki }); }
      if (!poprawny) {
        const b = bladMeta(inst.errors, schemat, p.klucze || new Map());
        b.plik = nazwa;
        throw b;
      }
      const inny = Object.keys(idPlikow).find(n => idPlikow[n] === bezFragmentu(schemat.$id));
      if (inny) throw new BladSchematu('Pliki „' + inny + '” i „' + nazwa + '” mają ten sam „$id”. Każdy plik musi mieć inny identyfikator.', { plik: nazwa });
      idPlikow[nazwa] = bezFragmentu(schemat.$id);
      try { inst.addSchema(schemat); } catch (e) { throw wyjatek(e, { plik: nazwa, pliki }); }
    }
    if (!pliki[glowny]) throw new BladSchematu('Plik główny „' + glowny + '” nie istnieje.', { plik: glowny });
    let fn;
    try {
      fn = inst.getSchema(idPlikow[glowny]);
    } catch (e) {
      throw wyjatek(e, { plik: glowny, pliki });
    }
    if (!fn) throw new BladSchematu('Walidator nie znalazł pliku głównego pod „$id” ' + idPlikow[glowny] + '.', { plik: glowny });
    const odwolania = znajdzOdwolania(pliki);
    // Kandydaci do dopasowania schemaPath błędu: $id pliku i surowe odwołania, które do niego prowadzą.
    const prefiksy = Object.entries(idPlikow).map(([n, id]) => [id, n]);
    for (const o of odwolania) if (o.doPliku) prefiksy.push([bezFragmentu(o.ref), o.doPliku]);
    prefiksy.sort((a, b) => b[0].length - a[0].length);
    const plikBledu = blad => {
      const sp = String(blad.schemaPath || '');
      if (sp.startsWith('#')) return glowny;
      const traf = prefiksy.find(([pref]) => sp === pref || sp.startsWith(pref + '/') || sp.startsWith(pref + '#'));
      return traf ? traf[1] : glowny;
    };
    return opakuj(fn, { idPlikow, odwolania, plikBledu, uwagi });
  }

  return { kompiluj, kompilujProjekt, znajdzOdwolania, opcje: { formaty } };
}
