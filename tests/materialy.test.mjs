// Materiały statyczne: nagłówki z obowiązkowego zakresu, ćwiczenia z policzonymi werdyktami,
// rozwiązania wyłącznie w dodatku na końcu, ściągawka słów kluczowych, zero interakcji.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wczytajKurs } from '../scripts/zbuduj-tresc.mjs';
import { zbudujMaterialyHtml } from '../scripts/zbuduj-materialy.mjs';

const kurs = wczytajKurs();
const html = zbudujMaterialyHtml(kurs);
const bezTagow = s => s.replace(/<[^>]+>/g, '');

test('materiały: każde hasło z obowiązkowego zakresu jest w nagłówku', () => {
  for (const m of kurs.moduly) {
    for (const haslo of m.meta.zakres || []) {
      const re = new RegExp('<h[1-3][^>]*>[^<]*' + haslo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      assert.match(html, re, haslo);
    }
  }
});

test('materiały: każde ćwiczenie ma sekcję z poleceniem', () => {
  for (const m of kurs.moduly) {
    for (const cw of m.cwiczenia) {
      assert.ok(html.includes(`id="cw-${cw.id}"`), cw.id);
      assert.ok(bezTagow(html).includes(bezTagow(cw.polecenie).replace(/`/g, '')), 'polecenie ' + cw.id);
    }
  }
});

test('materiały: rozwiązania tylko w dodatku na końcu', () => {
  const i = html.indexOf('id="rozwiazania"');
  assert.ok(i > 0);
  const przed = html.slice(0, i);
  const po = html.slice(i);
  // W HTML cudzysłowy są eskejpowane jako &quot;
  // „cena”: 12.50 występuje wyłącznie w rozwiązaniu ćwiczenia 1-1 (start ma 12,50, wykład 12.5)
  assert.ok(!przed.includes('&quot;cena&quot;: 12.50'), 'rozwiązanie 1-1 nie może być przed dodatkiem');
  assert.ok(po.includes('&quot;cena&quot;: 12.50'));
  assert.ok(po.includes('id="roz-3-1-kod-pocztowy"'));
  assert.ok(!przed.includes('id="roz-'));
});

test('materiały: przykłady mają werdykty policzone walidatorem', () => {
  const przechodzi = (html.match(/data-werdykt="przechodzi"/g) || []).length;
  const odrzucony = (html.match(/data-werdykt="odrzucony"/g) || []).length;
  const oczekiwane = kurs.moduly.flatMap(m => m.cwiczenia).flatMap(cw => cw.przyklady || cw.odpowiedzi || []);
  assert.ok(przechodzi >= oczekiwane.filter(p => p.ok).length);
  assert.ok(odrzucony >= oczekiwane.filter(p => !p.ok).length);
});

test('materiały: ściągawka słów kluczowych z kolumną draft-07', () => {
  assert.match(html, /<table class="sciagawka"/);
  assert.ok(html.includes('<code>$defs</code>'));
  assert.ok(html.includes('<code>definitions</code>'));
  assert.ok(html.includes('<code>prefixItems</code>'));
});

test('materiały: bez przycisków i skryptów, wykład ma werdykty w tekście', () => {
  assert.ok(!/<button/.test(html));
  assert.ok(!/<script/.test(html));
  assert.ok(html.includes('class="werdykt przechodzi"'));
});
