// Jedyna funkcja, przez którą trener, testy i skrypt sprawdz-rozwiazanie liczą werdykty ćwiczenia.
// Wejście zależy od rodzaju: 1/5 { schemat }, 2 { dokument }, 3 { odpowiedzi }, 4 { pliki }.
import { parsujJSON, BladSkladni } from './parser-json.js';
import { analizujSchemat } from './analiza-schematu.js';
import { utworzWalidator, BladSchematu } from './walidator.js';
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
function wczytajSchemat(tekst, plik) {
  let p;
  try {
    p = parsujJSON(tekst, 'Schemat jest pusty. Zacznij od nawiasów { }.');
  } catch (e) {
    if (e instanceof BladSkladni) return { diagnoza: [diagnozaSkladni(e, plik)] };
    throw e;
  }
  const diagnoza = uwagiDuplikatow(p.duplikaty, plik);
  if (p.wartosc && typeof p.wartosc === 'object' && !Array.isArray(p.wartosc)) {
    for (const u of analizujSchemat(p.wartosc, p.klucze)) diagnoza.push({ ...u, plik });
  }
  return { wartosc: p.wartosc, klucze: p.klucze, diagnoza };
}

function przykladyCzekaja(przyklady) {
  return przyklady.map(pr => ({ opis: pr.opis, dane: pr.dane, ok: pr.ok, przeszedl: null, zgodny: false, powod: [], wskazowka: pr.wskazowka }));
}

function policzPrzyklady(fn, przyklady, opcjeKomunikatu) {
  return przyklady.map(pr => {
    const w = fn.sprawdz(pr.dane);
    const powod = w.ok ? [] : komunikaty(w.bledy, pr.dane, 3, opcjeKomunikatu ? opcjeKomunikatu(w.bledy[0]) : undefined);
    return { opis: pr.opis, dane: pr.dane, ok: pr.ok, przeszedl: w.ok, zgodny: w.ok === pr.ok, powod, wskazowka: pr.wskazowka };
  });
}

function schematPojedynczy(cw, wejscie, formaty) {
  const s = wczytajSchemat(wejscie.schemat ?? '');
  if (s.wartosc === undefined) return { diagnoza: s.diagnoza, przyklady: przykladyCzekaja(cw.przyklady), zaliczone: false };
  let fn;
  try {
    fn = walidator(formaty).kompiluj(s.wartosc, s.klucze);
  } catch (e) {
    if (!(e instanceof BladSchematu)) throw e;
    return { diagnoza: [diagnozaSchematu(e), ...s.diagnoza], przyklady: przykladyCzekaja(cw.przyklady), zaliczone: false };
  }
  const przyklady = policzPrzyklady(fn, cw.przyklady);
  return { diagnoza: s.diagnoza, przyklady, zaliczone: przyklady.every(p => p.zgodny) };
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
  if (!w.ok) for (const t of komunikaty(w.bledy, p.wartosc)) diagnoza.push({ poziom: 'blad', rodzaj: 'Niezgodność ze schematem', tekst: t });
  return { diagnoza, przyklady: [], zaliczone: w.ok };
}

function zgadnij(cw, wejscie, formaty) {
  const fn = walidator(formaty).kompiluj(cw.schemat);
  const odp = wejscie.odpowiedzi || [];
  const przyklady = cw.odpowiedzi.map((o, i) => {
    const w = fn.sprawdz(o.dane);
    const odpowiedz = typeof odp[i] === 'boolean' ? odp[i] : null;
    return { opis: o.opis, dane: o.dane, ok: o.ok, przeszedl: w.ok, odpowiedz, zgodny: odpowiedz === w.ok, wyjasnienie: o.wyjasnienie, powod: w.ok ? [] : komunikaty(w.bledy, o.dane, 2) };
  });
  const kompletne = przyklady.every(p => p.odpowiedz !== null);
  return { diagnoza: [], przyklady, kompletne, zaliczone: kompletne && przyklady.every(p => p.zgodny) };
}

function projekt(cw, wejscie, formaty) {
  const pliki = {};
  let diagnoza = [];
  for (const [nazwa, tekst] of Object.entries(wejscie.pliki || {})) {
    const s = wczytajSchemat(tekst, nazwa);
    diagnoza = diagnoza.concat(s.diagnoza);
    if (s.wartosc !== undefined) pliki[nazwa] = { wartosc: s.wartosc, klucze: s.klucze };
  }
  const wal = walidator(formaty);
  const odwolania = wal.znajdzOdwolania(pliki);
  const idPlikow = Object.fromEntries(Object.entries(pliki).filter(([, p]) => p.wartosc && typeof p.wartosc.$id === 'string').map(([n, p]) => [n, p.wartosc.$id]));
  if (diagnoza.some(d => d.poziom === 'blad')) {
    return { diagnoza, przyklady: przykladyCzekaja(cw.przyklady), odwolania, idPlikow, zaliczone: false };
  }
  let fn;
  try {
    fn = wal.kompilujProjekt(pliki, cw.glowny);
  } catch (e) {
    if (!(e instanceof BladSchematu)) throw e;
    return { diagnoza: [diagnozaSchematu(e, cw.glowny), ...diagnoza], przyklady: przykladyCzekaja(cw.przyklady), odwolania, idPlikow, zaliczone: false };
  }
  const przyklady = policzPrzyklady(fn, cw.przyklady, blad => ({ plik: fn.plikBledu(blad) }));
  return { diagnoza, przyklady, odwolania: fn.odwolania, idPlikow: fn.idPlikow, zaliczone: przyklady.every(p => p.zgodny) };
}

// Piaskownica: dowolny schemat i dowolny dokument. werdykt: true/false albo null, gdy czegoś nie da się sprawdzić.
export function sprawdzPiaskownice(tekstSchematu, tekstDokumentu, { formaty = false } = {}) {
  const s = wczytajSchemat(tekstSchematu ?? '');
  let diagnozaSchematu = s.diagnoza;
  let fn = null;
  if (s.wartosc !== undefined) {
    try {
      fn = walidator(formaty).kompiluj(s.wartosc, s.klucze);
    } catch (e) {
      if (!(e instanceof BladSchematu)) throw e;
      diagnozaSchematu = [diagnozaSchematu(e), ...s.diagnoza];
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
  if (!fn || dokumentWartosc === undefined) return { diagnozaSchematu, diagnozaDokumentu, werdykt: null, komunikaty: [] };
  const w = fn.sprawdz(dokumentWartosc);
  return { diagnozaSchematu, diagnozaDokumentu, werdykt: w.ok, komunikaty: w.ok ? [] : komunikaty(w.bledy, dokumentWartosc) };
}

export function sprawdzCwiczenie(cw, wejscie, { formaty = false } = {}) {
  switch (cw.rodzaj) {
    case 1:
    case 5: return schematPojedynczy(cw, wejscie, formaty);
    case 2: return dokument(cw, wejscie, formaty);
    case 3: return zgadnij(cw, wejscie, formaty);
    case 4: return projekt(cw, wejscie, formaty);
    default: throw new Error('Nieznany rodzaj ćwiczenia: ' + cw.rodzaj);
  }
}
