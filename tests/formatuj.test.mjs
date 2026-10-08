// Formatowanie JSON-a w przykładach: krótkie fragmenty w jednej linii, dłuższe łamane,
// zapis wartości (liczby, ucieczki, kolejność i duplikaty pól) bez zmian.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatujJSON } from '../trener/rdzen/formatuj.js';
import { klasaKodu } from '../trener/rdzen/kod-w-tekscie.js';

test('formatujJSON: krótki schemat zostaje w jednej linii', () => {
  assert.equal(formatujJSON('{\n  "type": "string",\n  "minLength": 1\n}'), '{ "type": "string", "minLength": 1 }');
});

test('formatujJSON: długi schemat łamie się tylko tam, gdzie trzeba', () => {
  const t = '{ "type": "object", "properties": { "adres": { "type": "string" } }, "required": ["adres"], "additionalProperties": false }';
  assert.equal(formatujJSON(t, { szerokosc: 56 }), [
    '{',
    '  "type": "object",',
    '  "properties": { "adres": { "type": "string" } },',
    '  "required": ["adres"],',
    '  "additionalProperties": false',
    '}',
  ].join('\n'));
});

test('formatujJSON: zachowuje zapis liczb, ucieczki i duplikaty pól', () => {
  assert.equal(formatujJSON('{"a":1.0,"b":"C:\\\\x\\u0041 \\"q\\"","a":2e3}'), '{ "a": 1.0, "b": "C:\\\\x\\u0041 \\"q\\"", "a": 2e3 }');
});

test('formatujJSON: puste obiekty i listy, wartości proste', () => {
  assert.equal(formatujJSON(' {} '), '{}');
  assert.equal(formatujJSON('[ ]'), '[]');
  assert.equal(formatujJSON('"a"'), '"a"');
  assert.equal(formatujJSON('[1,2,  3]'), '[1, 2, 3]');
});

test('formatujJSON: zbyt długa lista dzieli się na elementy', () => {
  const t = JSON.stringify({ enum: ['nowe', 'oplacone', 'wyslane', 'dostarczone', 'anulowane', 'zwrocone'] });
  assert.equal(formatujJSON(t, { szerokosc: 40 }), '{\n  "enum": [\n    "nowe",\n    "oplacone",\n    "wyslane",\n    "dostarczone",\n    "anulowane",\n    "zwrocone"\n  ]\n}');
});

test('formatujJSON: niepoprawny JSON rzuca', () => {
  assert.throws(() => formatujJSON('{"a": }'));
  assert.throws(() => formatujJSON('{"a": 1} x'));
});

test('klasaKodu: słowo kluczowe to schemat, jawny znacznik wygrywa', () => {
  assert.equal(klasaKodu('required'), 's');
  assert.equal(klasaKodu('$ref'), 's');
  assert.equal(klasaKodu('uwagi'), null);
  assert.equal(klasaKodu('null'), null);
  assert.equal(klasaKodu('{"uwagi": null}', 'd'), 'd');
  assert.equal(klasaKodu('required', 'd'), 'd');
});
