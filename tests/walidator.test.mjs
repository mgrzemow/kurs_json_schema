import { test } from 'node:test';
import assert from 'node:assert/strict';
import { utworzWalidator, BladSchematu, przygotujSchemat } from '../trener/rdzen/walidator.js';

test('kompiluj i sprawdz', () => {
  const w = utworzWalidator({ formaty: false }).kompiluj({ type: 'integer' });
  assert.equal(w.sprawdz(1).ok, true);
  const zle = w.sprawdz('1');
  assert.equal(zle.ok, false);
  assert.equal(zle.bledy[0].keyword, 'type');
});

test('format jako adnotacja bez formatów, asercja z formatami', () => {
  const s = { type: 'string', format: 'email' };
  assert.equal(utworzWalidator({ formaty: false }).kompiluj(s).sprawdz('jan@').ok, true);
  assert.equal(utworzWalidator({ formaty: true }).kompiluj(s).sprawdz('jan@').ok, false);
  assert.equal(utworzWalidator({ formaty: true }).kompiluj(s).sprawdz('jan@example.com').ok, true);
});

test('default niczego nie wpisuje do danych', () => {
  const d = {};
  utworzWalidator({ formaty: false }).kompiluj({ properties: { waluta: { default: 'PLN' } } }).sprawdz(d);
  assert.deepEqual(d, {});
});

test('zły regex daje BladSchematu po polsku i nie psuje kolejnych kompilacji', () => {
  const wal = utworzWalidator({ formaty: false });
  assert.throws(() => wal.kompiluj({ pattern: '[' }), e => e instanceof BladSchematu && /wyrażeniem regularnym/.test(e.message));
  assert.equal(wal.kompiluj({ type: 'string' }).sprawdz('a').ok, true);
});

test('nieznany $ref po polsku', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompiluj({ $ref: '#/$defs/adres' }), /Odwołanie #\/\$defs\/adres nie prowadzi/);
});

test('obcy $schema jest pomijany z informacją', () => {
  const { schemat, uwagi } = przygotujSchemat({ $schema: 'http://json-schema.org/draft-07/schema#', type: 'string' });
  assert.equal(schemat.$schema, undefined);
  assert.match(uwagi[0].tekst, /2020-12/);
  assert.equal(przygotujSchemat({ $schema: 'https://json-schema.org/draft/2020-12/schema' }).uwagi.length, 0);
});

test('schemat draft-07 w edytorze kompiluje się mimo nagłówka', () => {
  const w = utworzWalidator({ formaty: false }).kompiluj({ $schema: 'http://json-schema.org/draft-07/schema#', type: 'string' });
  assert.equal(w.sprawdz('a').ok, true);
});

test('type z nieznaną wartością daje czytelny komunikat', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompiluj({ type: 'text' }), /„type” ma nieznaną wartość "text"/);
});

test('samo "string" zamiast schematu w properties', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompiluj({ properties: { a: 'string' } }), /zamiast schematu jest samo "string"/);
});

test('ta sama instancja kompiluje ten sam schemat dwa razy', () => {
  const wal = utworzWalidator({ formaty: false });
  const s = { $id: 'https://kurs.example/schematy/x', type: 'string' };
  assert.equal(wal.kompiluj(s).sprawdz('a').ok, true);
  assert.equal(wal.kompiluj(s).sprawdz('a').ok, true);
});

const pliki = {
  zamowienie: { wartosc: { $id: 'https://kurs.example/schematy/zamowienie', type: 'object', properties: { adres: { $ref: 'adres' }, klient: { $ref: 'klient' } } } },
  adres: { wartosc: { $id: 'https://kurs.example/schematy/adres', type: 'object', required: ['miasto'] } },
};

test('projekt: zepsute odwołanie wskazuje plik', () => {
  const wal = utworzWalidator({ formaty: false });
  assert.throws(() => wal.kompilujProjekt(pliki, 'zamowienie'), e => e instanceof BladSchematu && /„klient”/.test(e.message) && e.plik === 'zamowienie');
});

test('projekt: kompletny projekt waliduje i raportuje odwołania', () => {
  const wal = utworzWalidator({ formaty: false });
  const p = wal.kompilujProjekt({ ...pliki, klient: { wartosc: { $id: 'https://kurs.example/schematy/klient', type: 'object' } } }, 'zamowienie');
  assert.equal(p.sprawdz({ adres: {} }).ok, false);
  assert.equal(p.sprawdz({ adres: { miasto: 'Gdańsk' } }).ok, true);
  assert.equal(p.odwolania.find(o => o.ref === 'adres').doPliku, 'adres');
  assert.equal(p.idPlikow.adres, 'https://kurs.example/schematy/adres');
});

test('projekt: odwolania zwracane także przy zepsutym projekcie', () => {
  const o = utworzWalidator({ formaty: false }).znajdzOdwolania(pliki);
  assert.deepEqual(o.map(x => [x.zPliku, x.ref, x.doPliku]), [['zamowienie', 'adres', 'adres'], ['zamowienie', 'klient', null]]);
});

test('projekt: dwa pliki z tym samym $id', () => {
  const dwa = { a: { wartosc: { $id: 'https://kurs.example/schematy/x' } }, b: { wartosc: { $id: 'https://kurs.example/schematy/x' } } };
  assert.throws(() => utworzWalidator({ formaty: false }).kompilujProjekt(dwa, 'a'), /ten sam „\$id”/);
});

test('projekt: plik bez $id', () => {
  assert.throws(() => utworzWalidator({ formaty: false }).kompilujProjekt({ a: { wartosc: {} } }, 'a'), e => /nie ma „\$id”/.test(e.message) && e.plik === 'a');
});

test('projekt: błąd walidacji wskazuje plik z regułą', () => {
  const wal = utworzWalidator({ formaty: false });
  const p = wal.kompilujProjekt({ ...pliki, klient: { wartosc: { $id: 'https://kurs.example/schematy/klient', type: 'object' } } }, 'zamowienie');
  const w = p.sprawdz({ adres: {} });
  assert.equal(p.plikBledu(w.bledy[0]), 'adres');
});
