// Testy treści ćwiczeń: dla każdego ćwiczenia rozwiązanie przechodzi, start oblewa,
// każde zapisane błędne rozwiązanie oblewa, a dane są poprawnym JSON-em.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { wczytajKurs } from '../scripts/zbuduj-tresc.mjs';
import { utworzWalidator } from '../trener/rdzen/walidator.js';
import { parsujJSON, BladSkladni } from '../trener/rdzen/parser-json.js';
import { sprawdzCwiczenie } from '../trener/rdzen/sprawdz-cwiczenie.js';

const schematCwiczenia = JSON.parse(readFileSync(new URL('../tresc/schemat-cwiczenia.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const poprawneCwiczenie = ajv.compile(schematCwiczenia);
const walidatory = { bez: utworzWalidator({ formaty: false }), z: utworzWalidator({ formaty: true }) };
const walidatorDla = cw => (cw.formaty ? walidatory.z : walidatory.bez);

const { moduly } = wczytajKurs();
const cwiczenia = moduly.flatMap(m => m.cwiczenia.map(cw => [m.meta.nr, cw]));

assert.ok(cwiczenia.length >= 4, 'treść próbna ma co najmniej 4 ćwiczenia');

// Ile przykładów oblewa dany schemat (błąd kompilacji = oblewa wszystkie).
function oblane(schemat, przyklady, cw) {
  let fn;
  try { fn = walidatorDla(cw).kompiluj(schemat); } catch (_) { return przyklady.length; }
  return przyklady.filter(p => fn.sprawdz(p.dane).ok !== p.ok).length;
}

function oblaneProjekt(pliki, glowny, przyklady, cw) {
  let fn;
  try { fn = walidatorDla(cw).kompilujProjekt(Object.fromEntries(Object.entries(pliki).map(([n, t]) => [n, { wartosc: parsujJSON(t).wartosc }])), glowny); } catch (_) { return przyklady.length; }
  return przyklady.filter(p => fn.sprawdz(p.dane).ok !== p.ok).length;
}

for (const [nr, cw] of cwiczenia) {
  test(`${cw.id}: cwiczenie.json jest zgodne ze schematem ćwiczenia`, () => {
    const { start, rozwiazanie, rozwiazanieTekst, bledne, pliki, schemat, ...meta } = cw;
    assert.ok(poprawneCwiczenie(meta), JSON.stringify(poprawneCwiczenie.errors));
    assert.ok(cw.id.startsWith(nr + '-'), 'id zaczyna się od numeru modułu');
    assert.ok(cw.zrodla.length >= 1, 'ma co najmniej jedno źródło');
  });

  if (cw.rodzaj === 1 || cw.rodzaj === 5) {
    test(`${cw.id}: rozwiązanie przechodzi wszystkie przykłady`, () => {
      assert.equal(oblane(cw.rozwiazanie, cw.przyklady, cw), 0);
    });
    test(`${cw.id}: schemat startowy oblewa co najmniej jeden przykład`, () => {
      assert.ok(oblane(parsujJSON(cw.start).wartosc, cw.przyklady, cw) >= 1);
    });
    for (const b of cw.bledne) {
      test(`${cw.id}: błędne rozwiązanie „${b.nazwa}” oblewa co najmniej jeden przykład`, () => {
        assert.ok(oblane(b.schemat, cw.przyklady, cw) >= 1);
        assert.ok(b.dlaczego.length > 10);
      });
    }
    test(`${cw.id}: każdy przykład sprawdza coś innego (unikalne dane)`, () => {
      const s = new Set(cw.przyklady.map(p => JSON.stringify(p.dane)));
      assert.equal(s.size, cw.przyklady.length);
    });
  }

  if (cw.rodzaj === 2) {
    test(`${cw.id}: start jest zepsuty, komunikaty po kolei zgodne z „bledy”`, () => {
      const linieRozw = cw.rozwiazanieTekst.split('\n');
      let tekst = cw.start;
      for (const fragment of cw.bledy) {
        let e;
        try { parsujJSON(tekst); } catch (x) { e = x; }
        assert.ok(e instanceof BladSkladni, `oczekiwano błędu „${fragment}”, a tekst się parsuje`);
        assert.match(e.message, new RegExp(fragment));
        const linie = tekst.split('\n');
        linie[e.linia - 1] = linieRozw[e.linia - 1];
        tekst = linie.join('\n');
      }
      const naprawiony = parsujJSON(tekst);
      if (cw.poSkladni === 'odrzucony') {
        // Po naprawie składni dokument ma być nadal odrzucony (np. duplikat pola albo wartość niezgodna ze schematem).
        assert.equal(sprawdzCwiczenie(cw, { dokument: tekst }).zaliczone, false, 'po naprawie składni dokument ma być jeszcze niezaliczony');
      } else {
        assert.deepEqual(naprawiony.wartosc, cw.rozwiazanie, 'po naprawie wszystkich błędów tekst równa się rozwiązaniu');
      }
      assert.equal(sprawdzCwiczenie(cw, { dokument: cw.rozwiazanieTekst }).zaliczone, true, 'rozwiązanie jest zaliczone');
    });
    if (cw.schemat) {
      test(`${cw.id}: naprawiony dokument spełnia schemat`, () => {
        assert.equal(walidatorDla(cw).kompiluj(cw.schemat).sprawdz(cw.rozwiazanie).ok, true);
      });
    }
  }

  if (cw.rodzaj === 3) {
    test(`${cw.id}: odpowiedzi zgadzają się z walidatorem`, () => {
      const fn = walidatorDla(cw).kompiluj(cw.schemat);
      for (const o of cw.odpowiedzi) assert.equal(fn.sprawdz(o.dane).ok, o.ok, o.opis);
    });
  }

  if (cw.rodzaj === 4) {
    test(`${cw.id}: pliki startowe oblewają, rozwiązanie przechodzi`, () => {
      assert.ok(oblaneProjekt(cw.pliki, cw.glowny, cw.przyklady, cw) >= 1);
      const naprawione = { ...cw.pliki, ...Object.fromEntries(Object.entries(cw.rozwiazanie).map(([n, o]) => [n, JSON.stringify(o)])) };
      assert.equal(oblaneProjekt(naprawione, cw.glowny, cw.przyklady, cw), 0);
    });
    test(`${cw.id}: każdy plik startowy to poprawny JSON`, () => {
      for (const t of Object.values(cw.pliki)) parsujJSON(t);
    });
  }
}

test('identyfikatory ćwiczeń są unikalne', () => {
  const ids = cwiczenia.map(([, cw]) => cw.id);
  assert.equal(new Set(ids).size, ids.length);
});
