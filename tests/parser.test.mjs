import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujJSON, BladSkladni } from '../trener/rdzen/parser-json.js';

const przypadki = [
  ['{"a": 1,}', /Zbędny przecinek przed „}”/, 1],
  ["{'a': 1}", /podwójnym cudzysłowie/, 1],
  ['{“a”: 1}', /cudzysłów drukarski/, 1],
  ['{"cena": 12,50}', /kropki zamiast przecinka/, 1],
  ['{"a": True}', /małymi literami/, 1],
  ['{"a": None}', /null/, 1],
  ['{"a": "\\d"}', /podwoić/, 1],
  ['{"a": 1 // uwaga\n}', /komentarze/, 1],
  ['{"a": 1}', /twarda spacja/, 1],
  ['{\n"a": 1\n"b": 2}', /Brakuje przecinka/, 2],
  ['{"a": 01}', /zaczynać się od zera/, 1],
  ['[1, 2', /Brakuje nawiasu „\]”/, 1],
];

for (const [tekst, re, linia] of przypadki) {
  test(`komunikat dla ${JSON.stringify(tekst)}`, () => {
    assert.throws(
      () => parsujJSON(tekst),
      e => e instanceof BladSkladni && re.test(e.message) && e.linia === linia,
      `oczekiwano ${re} w linii ${linia}`,
    );
  });
}

test('poprawny JSON zwraca wartosc i klucze', () => {
  const w = parsujJSON('{"a": {"b": [1, 2]}}');
  assert.deepEqual(w.wartosc, { a: { b: [1, 2] } });
  assert.equal(w.klucze.get('/a/b'), 7);
  assert.deepEqual(w.duplikaty, []);
});

test('duplikat klucza jest zgłaszany, liczy się ostatni', () => {
  const w = parsujJSON('{"a": 1, "a": 2}');
  assert.equal(w.wartosc.a, 2);
  assert.equal(w.duplikaty.length, 1);
  assert.equal(w.duplikaty[0].klucz, 'a');
});

test('pusty tekst daje komunikat z parametru', () => {
  assert.throws(() => parsujJSON('   ', 'Schemat jest pusty.'), /Schemat jest pusty/);
});

test('__proto__ jako klucz nie psuje obiektu', () => {
  const w = parsujJSON('{"__proto__": {"x": 1}}');
  assert.equal(Object.getPrototypeOf(w.wartosc), Object.prototype);
  assert.equal(w.wartosc.__proto__.x, 1);
});

test('blad ma pozycje, linie i kolumne', () => {
  try {
    parsujJSON('{\n  "a": 1,\n  "b": tak\n}');
    assert.fail('powinien rzucić');
  } catch (e) {
    assert.ok(e instanceof BladSkladni);
    assert.equal(e.linia, 3);
    assert.equal(e.kolumna, 8);
    assert.equal(e.pos, 19);
  }
});
