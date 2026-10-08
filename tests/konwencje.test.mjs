// Konwencje treści ustalone z prowadzącym (2026-10-08): bez słowa „trener” w tekstach,
// bez przerw i czasów na stronie, opis każdego modułu, znaczniki kolorów zawsze wyrenderowane.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wczytajKurs, zbudujTresc } from '../scripts/zbuduj-tresc.mjs';

const { moduly } = wczytajKurs();
const teksty = cw => [cw.tytul, cw.kontekst, cw.polecenie, cw.podpowiedz, ...(cw.przyklady || cw.odpowiedzi || []).flatMap(p => [p.opis, p.wskazowka, p.wyjasnienie]), ...cw.bledne.map(b => b.dlaczego), ...(cw.listaKontrolna || [])].filter(Boolean);

test('treść nie mówi o „trenerze” (tak nazywamy tylko żywego prowadzącego, a jego też nie wspominamy)', () => {
  for (const m of moduly) {
    assert.doesNotMatch(m.wyklad.html, /trener/i, 'wykład modułu ' + m.meta.nr);
    for (const cw of m.cwiczenia) for (const t of teksty(cw)) assert.doesNotMatch(t, /trener/i, cw.id);
  }
});

test('każdy moduł ma jednozdaniowy opis na stronę startową', () => {
  for (const m of moduly) assert.match(m.meta.opis || '', /^[A-ZĄĆĘŁŃÓŚŹŻ].{20,200}\.$/, 'moduł ' + m.meta.nr);
});

test('spis kursu na stronie nie ma przerw ani czasów', () => {
  const spis = zbudujTresc();
  assert.equal(spis.przerwy, undefined);
  for (const m of spis.moduly) assert.equal(m.minuty, undefined);
});

test('znaczniki kolorów kodu nie zostają w wykładzie jako tekst', () => {
  for (const m of moduly) assert.doesNotMatch(m.wyklad.html, /`\{[sd]\}|<\/code>\{[sd]\}/, 'moduł ' + m.meta.nr);
});

test('strona startowa: tytuł, autor z LinkedInem, czas, opis i nota o prawach autorskich', () => {
  const spis = zbudujTresc();
  assert.equal(spis.tytul, 'Kurs JSON Schema');
  assert.equal(spis.autor, 'Michał Grzemowski');
  assert.match(spis.linkedin, /^https:\/\/www\.linkedin\.com\//);
  assert.equal(spis.czas, '1 dzień');
  assert.ok(spis.opis.length >= 1);
  assert.match(spis.prawa, /prawem autorskim/);
});

test('treść nie odnosi się do formy zajęć (czat, praca zdalna, udostępnianie ekranu)', () => {
  const re = /czat|zdaln|udostępnian|ekranie/i;
  for (const m of moduly) {
    assert.doesNotMatch(m.wyklad.html, re, 'wykład modułu ' + m.meta.nr);
    for (const cw of m.cwiczenia) for (const t of teksty(cw)) assert.doesNotMatch(t, re, cw.id);
  }
});
