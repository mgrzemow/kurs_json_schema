import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprawdzCwiczenie } from '../trener/rdzen/sprawdz-cwiczenie.js';
import { wczytajKurs } from '../scripts/zbuduj-tresc.mjs';

const { moduly } = wczytajKurs();
const cw = id => moduly.flatMap(m => m.cwiczenia).find(c => c.id === id);

test('rodzaj 1: rozwiązanie zalicza, start nie', () => {
  const c = cw('3-2-kod-i-numer');
  const r = sprawdzCwiczenie(c, { schemat: JSON.stringify(c.rozwiazanie) });
  assert.equal(r.zaliczone, true);
  assert.equal(r.diagnoza.length, 0);
  assert.ok(r.przyklady.every(p => p.zgodny));
  const s = sprawdzCwiczenie(c, { schemat: c.start });
  assert.equal(s.zaliczone, false);
  const niezgodne = s.przyklady.filter(p => !p.zgodny);
  assert.equal(niezgodne.length, 4);
  assert.ok(niezgodne.every(p => p.wskazowka));
  assert.equal(niezgodne[0].przeszedl, true);
});

test('rodzaj 1: odrzucony przykład ma powód po polsku', () => {
  const c = cw('3-2-kod-i-numer');
  const r = sprawdzCwiczenie(c, { schemat: JSON.stringify(c.rozwiazanie) });
  const zly = r.przyklady.find(p => p.opis === 'Kod bez myślnika');
  assert.match(zly.powod[0], /Pole „kodPocztowy”: tekst "00950" nie pasuje do wzorca/);
});

test('rodzaj 1: błąd składni daje diagnozę z pozycją, przykłady czekają', () => {
  const c = cw('3-2-kod-i-numer');
  const r = sprawdzCwiczenie(c, { schemat: '{ "type": ' });
  assert.equal(r.diagnoza[0].poziom, 'blad');
  assert.equal(typeof r.diagnoza[0].pos, 'number');
  assert.ok(r.przyklady.every(p => p.przeszedl === null));
  assert.equal(r.zaliczone, false);
});

test('rodzaj 1: ostrzeżenie o nieznanym słowie', () => {
  const c = cw('3-2-kod-i-numer');
  const r = sprawdzCwiczenie(c, { schemat: '{ "requried": ["kodPocztowy"] }' });
  assert.equal(r.diagnoza[0].poziom, 'ostrz');
});

test('rodzaj 1: przełącznik formatów zmienia werdykt', () => {
  const c = { ...cw('3-2-kod-i-numer'), przyklady: [{ opis: 'e', dane: 'jan@', ok: false }] };
  const schemat = '{ "type": "string", "format": "email" }';
  assert.equal(sprawdzCwiczenie(c, { schemat }, { formaty: false }).zaliczone, false);
  assert.equal(sprawdzCwiczenie(c, { schemat }, { formaty: true }).zaliczone, true);
});

test('rodzaj 2: start daje błąd składni z linią, rozwiązanie zalicza', () => {
  const c = cw('1-1-zamowienie-z-maila');
  const s = sprawdzCwiczenie(c, { dokument: c.start });
  assert.equal(s.diagnoza[0].poziom, 'blad');
  assert.equal(s.diagnoza[0].linia, 4);
  assert.equal(s.zaliczone, false);
  const r = sprawdzCwiczenie(c, { dokument: c.rozwiazanieTekst });
  assert.equal(r.zaliczone, true);
});

test('rodzaj 2: poprawny JSON niezgodny ze schematem nie zalicza i pokazuje komunikaty', () => {
  const c = cw('1-1-zamowienie-z-maila');
  const r = sprawdzCwiczenie(c, { dokument: '{ "numer": "x" }' });
  assert.equal(r.zaliczone, false);
  assert.ok(r.diagnoza.some(d => /Brakuje wymaganego pola/.test(d.tekst)));
});

test('rodzaj 3: odpowiedzi', () => {
  const c = cw('3-4-szprychy');
  const dobre = c.odpowiedzi.map(o => o.ok);
  const r = sprawdzCwiczenie(c, { odpowiedzi: dobre });
  assert.equal(r.zaliczone, true);
  assert.ok(r.przyklady.every(p => p.zgodny));
  const zle = dobre.map((x, i) => (i === 0 ? !x : x));
  const z = sprawdzCwiczenie(c, { odpowiedzi: zle });
  assert.equal(z.zaliczone, false);
  assert.equal(z.przyklady[0].zgodny, false);
  assert.equal(z.przyklady[0].wyjasnienie, c.odpowiedzi[0].wyjasnienie);
  const niepelne = sprawdzCwiczenie(c, { odpowiedzi: [true] });
  assert.equal(niepelne.zaliczone, false);
});

test('rodzaj 4: zepsute odwołanie wskazuje plik, rozwiązanie zalicza', () => {
  const c = cw('7-2-trzy-pliki');
  const s = sprawdzCwiczenie(c, { pliki: c.pliki });
  assert.equal(s.zaliczone, false);
  assert.equal(s.diagnoza[0].plik, 'zamowienie');
  assert.match(s.diagnoza[0].tekst, /„klinet”/);
  assert.ok(s.odwolania.some(o => o.ref === 'klinet' && o.doPliku === null));
  const naprawione = { ...c.pliki, zamowienie: JSON.stringify(c.rozwiazanie.zamowienie) };
  const r = sprawdzCwiczenie(c, { pliki: naprawione });
  assert.equal(r.zaliczone, true);
  assert.deepEqual(Object.keys(r.idPlikow).sort(), ['adres', 'klient', 'zamowienie']);
  const zly = r.przyklady.find(p => p.opis === 'Adres bez miasta');
  assert.match(zly.powod[0], /reguła z pliku „adres”/);
});

test('rodzaj 4: błąd składni w jednym pliku wskazuje ten plik', () => {
  const c = cw('7-2-trzy-pliki');
  const s = sprawdzCwiczenie(c, { pliki: { ...c.pliki, adres: '{ "a": ' } });
  assert.equal(s.diagnoza[0].plik, 'adres');
  assert.equal(s.diagnoza[0].poziom, 'blad');
});

test('I1: nieoczekiwany wyjątek Ajv w ćwiczeniu daje diagnozę, nie wyjątek', () => {
  const c = cw('3-2-kod-i-numer');
  for (const s of ['{ "$schema": "https://json-schema.org/draft/2020-12/schema-x" }', '{ "$schema": 5 }', '{ "$dynamicRef": "#x" }']) {
    const r = sprawdzCwiczenie(c, { schemat: s });
    assert.equal(r.zaliczone, false, s);
    assert.ok(r.przyklady.every(p => p.przeszedl === null) || r.diagnoza.length > 0, s);
  }
  assert.equal(sprawdzCwiczenie(c, { schemat: '{ "$dynamicRef": "#x" }' }).diagnoza[0].poziom, 'blad');
});

test('I2: w projekcie każdy komunikat wskazuje plik swojej reguły', () => {
  const c = cw('7-2-trzy-pliki');
  const naprawione = { ...c.pliki, zamowienie: JSON.stringify(c.rozwiazanie.zamowienie) };
  const c2 = { ...c, przyklady: [{ opis: 'bez miasta i bez e-maila', dane: { numer: 'ZAM-2026-000124', klient: { nazwa: 'Jan' }, adresDostawy: { ulica: 'Długa 5', kodPocztowy: '80-827' } }, ok: false }] };
  const r = sprawdzCwiczenie(c2, { pliki: naprawione });
  const powody = r.przyklady[0].powod;
  assert.ok(powody.some(p => /„miasto”.*pliku „adres”/.test(p)), powody.join(' | '));
  assert.ok(powody.some(p => /„email”.*pliku „klient”/.test(p)), powody.join(' | '));
});

test('I3: przy włączonych formatach informacja o format nie zaprzecza werdyktowi', () => {
  const c = { ...cw('3-2-kod-i-numer'), przyklady: [{ opis: 'e', dane: 'jan@', ok: false }] };
  const schemat = '{ "type": "string", "format": "email" }';
  const bez = sprawdzCwiczenie(c, { schemat }, { formaty: false });
  const z = sprawdzCwiczenie(c, { schemat }, { formaty: true });
  assert.ok(bez.diagnoza.some(d => /tylko opis/.test(d.tekst)));
  assert.ok(!z.diagnoza.some(d => /tylko opis/.test(d.tekst)));
  assert.ok(z.diagnoza.some(d => d.poziom === 'info' && /sprawdzany/.test(d.tekst)));
});

test('I5: obcy $schema w ćwiczeniu daje informację i nadal działa', () => {
  const c = cw('3-2-kod-i-numer');
  const r = sprawdzCwiczenie(c, { schemat: JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...c.rozwiazanie }) });
  assert.equal(r.zaliczone, true);
  assert.ok(r.diagnoza.some(d => d.poziom === 'info' && /2020-12/.test(d.tekst)));
  const p = sprawdzCwiczenie(cw('7-2-trzy-pliki'), { pliki: { ...cw('7-2-trzy-pliki').pliki, adres: JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...JSON.parse(cw('7-2-trzy-pliki').pliki.adres) }) } });
  assert.ok(p.diagnoza.some(d => d.poziom === 'info' && /2020-12/.test(d.tekst) && d.plik === 'adres'));
});
