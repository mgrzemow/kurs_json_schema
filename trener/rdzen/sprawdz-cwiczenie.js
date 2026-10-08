// Jedyna funkcja, przez którą trener, testy i skrypt sprawdz-rozwiazanie liczą werdykty ćwiczenia.
// Wejście zależy od rodzaju: 1/5 { schemat }, 2 { dokument }, 3 { odpowiedzi }, 4 { pliki }.
import { parsujJSON, BladSkladni } from './parser-json.js';
import { analizujSchemat } from './analiza-schematu.js';
import { utworzWalidator, BladSchematu, przygotujSchemat } from './walidator.js';
import { komunikaty } from './komunikaty.js';

const walidatory = {};
function walidator(formaty) {
  const k = formaty ? 'z' : 'bez';
  return walidatory[k] || (walidatory[k] = utworzWalidator({ formaty }));
}

function diagnozaSkladni(e, plik) {
  return { poziom: 'blad', rodzaj: 'Błąd składni JSON', tekst: e.message, pos: e.pos, linia: e.linia, kolumna: e.kolumna, plik };
}

function diagnozaSchematu(e, plik) {
  return { poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: e.message, pos: e.pos, plik: e.plik || plik };
}

function uwagiDuplikatow(duplikaty, plik) {
  return duplikaty.map(d => ({ poziom: 'ostrz', tekst: 'Pole „' + d.klucz + '” występuje dwa razy w tym samym obiekcie. Liczy się tylko ostatnie wystąpienie.', pos: d.pos, plik }));
}

// Parsuje i analizuje tekst schematu; zwraca { wartosc, klucze, diagnoza } albo { diagnoza } przy błędzie składni.
function wczytajSchemat(tekst, plik, formaty = false) {
  let p;
  try {
    p = parsujJSON(tekst, 'Schemat jest pusty. Zacznij od nawiasów { }.');
  } catch (e) {
    if (e instanceof BladSkladni) return { diagnoza: [diagnozaSkladni(e, plik)] };
    throw e;
  }
  const diagnoza = uwagiDuplikatow(p.duplikaty, plik);
  if (p.wartosc && typeof p.wartosc === 'object' && !Array.isArray(p.wartosc)) {
    for (const u of przygotujSchemat(p.wartosc, p.klucze).uwagi) diagnoza.push({ ...u, plik });
    for (const u of analizujSchemat(p.wartosc, p.klucze, { formaty })) diagnoza.push({ ...u, plik });
  }
  return { wartosc: p.wartosc, klucze: p.klucze, diagnoza };
}

function przykladyCzekaja(przyklady) {
  return przyklady.map(pr => ({ opis: pr.opis, dane: pr.dane, ok: pr.ok, przeszedl: null, zgodny: false, powod: [], wskazowka: pr.wskazowka }));
}

// Każdy wyjątek walidatora kończy się polską diagnozą, nigdy pustym ekranem.
function naDiagnoze(e, plik) {
  if (e instanceof BladSchematu) return diagnozaSchematu(e, plik);
  return { poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: 'Walidator nie może użyć tego schematu: ' + String((e && e.message) || e) + '.', plik };
}

function policzPrzyklady(fn, przyklady, opcjeKomunikatu) {
  return przyklady.map(pr => {
    const w = fn.sprawdz(pr.dane);
    if (w.ok === null) return { opis: pr.opis, dane: pr.dane, ok: pr.ok, przeszedl: null, zgodny: false, powod: [w.blad], wskazowka: pr.wskazowka };
    const powod = w.ok ? [] : komunikaty(w.bledy, pr.dane, 3, opcjeKomunikatu);
    return { opis: pr.opis, dane: pr.dane, ok: pr.ok, przeszedl: w.ok, zgodny: w.ok === pr.ok, powod, wskazowka: pr.wskazowka };
  });
}

function schematPojedynczy(cw, wejscie, formaty) {
  const s = wczytajSchemat(wejscie.schemat ?? '', undefined, formaty);
  if (s.wartosc === undefined) return { diagnoza: s.diagnoza, przyklady: przykladyCzekaja(cw.przyklady), zaliczone: false };
  let fn;
  try {
    fn = walidator(formaty).kompiluj(s.wartosc, s.klucze);
  } catch (e) {
    return { diagnoza: [naDiagnoze(e), ...s.diagnoza], przyklady: przykladyCzekaja(cw.przyklady), zaliczone: false };
  }
  const przyklady = policzPrzyklady(fn, cw.przyklady);
  const diagnoza = s.diagnoza.slice();
  const awaria = przyklady.find(p => p.przeszedl === null);
  if (awaria) diagnoza.unshift({ poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: awaria.powod[0] });
  return { diagnoza, przyklady, zaliczone: przyklady.every(p => p.zgodny) };
}

function dokument(cw, wejscie, formaty) {
  let p;
  try {
    p = parsujJSON(wejscie.dokument ?? '', 'Dokument jest pusty.');
  } catch (e) {
    if (e instanceof BladSkladni) return { diagnoza: [diagnozaSkladni(e)], przyklady: [], zaliczone: false };
    throw e;
  }
  const diagnoza = uwagiDuplikatow(p.duplikaty);
  if (!cw.schemat) return { diagnoza, przyklady: [], zaliczone: true };
  const fn = walidator(formaty).kompiluj(cw.schemat);
  const w = fn.sprawdz(p.wartosc);
  if (w.ok === null) diagnoza.push({ poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: w.blad });
  else if (!w.ok) for (const t of komunikaty(w.bledy, p.wartosc)) diagnoza.push({ poziom: 'blad', rodzaj: 'Niezgodność ze schematem', tekst: t });
  return { diagnoza, przyklady: [], zaliczone: w.ok === true };
}

function zgadnij(cw, wejscie, formaty) {
  const fn = walidator(formaty).kompiluj(cw.schemat);
  const odp = wejscie.odpowiedzi || [];
  const przyklady = cw.odpowiedzi.map((o, i) => {
    const w = fn.sprawdz(o.dane);
    const odpowiedz = typeof odp[i] === 'boolean' ? odp[i] : null;
    const wyjasnienie = formaty && o.wyjasnienieZFormatami ? o.wyjasnienieZFormatami : o.wyjasnienie;
    return { opis: o.opis, dane: o.dane, ok: o.ok, przeszedl: w.ok, odpowiedz, zgodny: w.ok !== null && odpowiedz === w.ok, wyjasnienie, powod: w.ok ? [] : w.ok === null ? [w.blad] : komunikaty(w.bledy, o.dane, 2) };
  });
  const kompletne = przyklady.every(p => p.odpowiedz !== null);
  return { diagnoza: [], przyklady, kompletne, zaliczone: kompletne && przyklady.every(p => p.zgodny) };
}

function projekt(cw, wejscie, formaty) {
  const pliki = {};
  let diagnoza = [];
  for (const [nazwa, tekst] of Object.entries(wejscie.pliki || {})) {
    const s = wczytajSchemat(tekst, nazwa, formaty);
    diagnoza = diagnoza.concat(s.diagnoza);
    if (s.wartosc !== undefined) pliki[nazwa] = { wartosc: s.wartosc, klucze: s.klucze };
  }
  const wal = walidator(formaty);
  let odwolania = [];
  try { odwolania = wal.znajdzOdwolania(pliki); } catch (_) { /* zepsute $id; walidator zgłosi to niżej */ }
  const idPlikow = Object.fromEntries(Object.entries(pliki).filter(([, p]) => p.wartosc && typeof p.wartosc.$id === 'string').map(([n, p]) => [n, p.wartosc.$id]));
  if (diagnoza.some(d => d.poziom === 'blad')) {
    return { diagnoza, przyklady: przykladyCzekaja(cw.przyklady), odwolania, idPlikow, zaliczone: false };
  }
  let fn;
  try {
    fn = wal.kompilujProjekt(pliki, cw.glowny);
  } catch (e) {
    return { diagnoza: [naDiagnoze(e, cw.glowny), ...diagnoza], przyklady: przykladyCzekaja(cw.przyklady), odwolania, idPlikow, zaliczone: false };
  }
  const przyklady = policzPrzyklady(fn, cw.przyklady, blad => ({ plik: fn.plikBledu(blad) }));
  const awaria = przyklady.find(p => p.przeszedl === null);
  if (awaria) diagnoza.unshift({ poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: awaria.powod[0], plik: cw.glowny });
  return { diagnoza, przyklady, odwolania: fn.odwolania, idPlikow: fn.idPlikow, zaliczone: przyklady.every(p => p.zgodny) };
}

// Piaskownica: dowolny schemat i dowolny dokument. werdykt: true/false albo null, gdy czegoś nie da się sprawdzić.
export function sprawdzPiaskownice(tekstSchematu, tekstDokumentu, { formaty = false } = {}) {
  const s = wczytajSchemat(tekstSchematu ?? '', undefined, formaty);
  let diagS = s.diagnoza;
  let fn = null;
  if (s.wartosc !== undefined) {
    try {
      fn = walidator(formaty).kompiluj(s.wartosc, s.klucze);
    } catch (e) {
      diagS = [naDiagnoze(e), ...s.diagnoza];
    }
  }
  let dokumentWartosc;
  let diagnozaDokumentu = [];
  try {
    const p = parsujJSON(tekstDokumentu ?? '', 'Dokument jest pusty.');
    dokumentWartosc = p.wartosc;
    diagnozaDokumentu = uwagiDuplikatow(p.duplikaty);
  } catch (e) {
    if (!(e instanceof BladSkladni)) throw e;
    diagnozaDokumentu = [diagnozaSkladni(e)];
  }
  if (!fn || dokumentWartosc === undefined) return { diagnozaSchematu: diagS, diagnozaDokumentu, werdykt: null, komunikaty: [] };
  const w = fn.sprawdz(dokumentWartosc);
  if (w.ok === null) return { diagnozaSchematu: [{ poziom: 'blad', rodzaj: 'Błąd w schemacie', tekst: w.blad }, ...diagS], diagnozaDokumentu, werdykt: null, komunikaty: [] };
  return { diagnozaSchematu: diagS, diagnozaDokumentu, werdykt: w.ok, komunikaty: w.ok ? [] : komunikaty(w.bledy, dokumentWartosc) };
}

// Ćwiczenie może wymusić tryb walidacji `format` (pole `formaty` w cwiczenie.json); inaczej decyduje przełącznik.
export function sprawdzCwiczenie(cw, wejscie, { formaty = false } = {}) {
  const tryb = typeof cw.formaty === 'boolean' ? cw.formaty : formaty;
  let w;
  switch (cw.rodzaj) {
    case 1:
    case 5: w = schematPojedynczy(cw, wejscie, tryb); break;
    case 2: w = dokument(cw, wejscie, tryb); break;
    case 3: w = zgadnij(cw, wejscie, tryb); break;
    case 4: w = projekt(cw, wejscie, tryb); break;
    default: throw new Error('Nieznany rodzaj ćwiczenia: ' + cw.rodzaj);
  }
  w.formaty = tryb;
  return w;
}
