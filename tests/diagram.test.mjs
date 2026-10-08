import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rysujDiagram } from '../trener/ui/diagram.js';

const dane = {
  pliki: ['zamowienie', 'adres', 'klient'],
  glowny: 'zamowienie',
  odwolania: [
    { zPliku: 'zamowienie', ref: 'adres', doPliku: 'adres' },
    { zPliku: 'zamowienie', ref: 'klinet', doPliku: null },
  ],
};

test('diagram: svg z węzłem na każdy plik i główny oznaczony', () => {
  const svg = rysujDiagram(dane);
  assert.match(svg, /^<svg/);
  for (const p of dane.pliki) assert.ok(svg.includes(`>${p}<`), p);
  assert.match(svg, /class="wezel glowny"/);
});

test('diagram: zepsute odwołanie ma klasę zepsute i węzeł „?”', () => {
  const svg = rysujDiagram(dane);
  assert.match(svg, /class="krawedz zepsute"/);
  assert.match(svg, /klinet/);
  assert.match(svg, /class="wezel brak"/);
  assert.equal((svg.match(/class="krawedz"/g) || []).length, 1);
});

test('diagram: znaki specjalne w nazwach są eskejpowane', () => {
  const svg = rysujDiagram({ pliki: ['a<b'], glowny: 'a<b', odwolania: [] });
  assert.ok(svg.includes('a&lt;b'));
  assert.ok(!svg.includes('a<b'));
});
