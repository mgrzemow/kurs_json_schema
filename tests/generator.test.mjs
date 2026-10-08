import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generujSchemat } from '../trener/rdzen/generator.js';

test('obiekt: properties z rekurencją, required = klucze obecne we wszystkich przykładach', () => {
  const s = generujSchemat([{ a: 1 }, { a: 2, b: 'x' }]);
  assert.equal(s.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(s.type, 'object');
  assert.deepEqual(s.properties.a, { type: 'integer' });
  assert.deepEqual(s.properties.b, { type: 'string' });
  assert.deepEqual(s.required, ['a']);
});

test('liczby: integer gdy wszystkie całkowite, number gdy mieszane', () => {
  assert.deepEqual(generujSchemat([1, 2]).type, 'integer');
  assert.deepEqual(generujSchemat([1, 2.5]).type, 'number');
});

test('różne typy proste → lista typów w kolejności wystąpienia', () => {
  assert.deepEqual(generujSchemat([1, 'a']).type, ['integer', 'string']);
  assert.deepEqual(generujSchemat([{ x: null }, { x: 'a' }]).properties.x.type, ['null', 'string']);
});

test('tablica: items łączy typy elementów', () => {
  assert.deepEqual(generujSchemat([[1, 2], [3]]).items, { type: 'integer' });
  const s = generujSchemat([[{ a: 1 }], [{ a: 2, b: true }]]);
  assert.deepEqual(s.items.required, ['a']);
  assert.deepEqual(s.items.properties.b, { type: 'boolean' });
});

test('pusta tablica nie ma items; obiekt pusty nie ma properties', () => {
  assert.deepEqual(generujSchemat([[]]), { $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'array' });
  assert.deepEqual(generujSchemat([{}]).properties, undefined);
});

test('obiekt i tablica w tym samym miejscu → anyOf', () => {
  const s = generujSchemat([{ a: 1 }, [1]]);
  assert.ok(Array.isArray(s.anyOf));
  assert.equal(s.anyOf.length, 2);
  assert.equal(s.type, undefined);
});

test('wymagane pola znikają, gdy brakuje ich w którymś przykładzie', () => {
  const s = generujSchemat([{ a: 1, uwagi: 'x' }, { a: 2, uwagi: 'y' }, { a: 3 }]);
  assert.deepEqual(s.required, ['a']);
});

test('jedna wartość w tablicy przykładów też działa', () => {
  assert.deepEqual(generujSchemat(['tekst']).type, 'string');
});
