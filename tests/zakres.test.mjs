// Obowiązkowy zakres formalny: każde hasło z modul.json.zakres musi być dosłownie w nagłówku wykładu.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wczytajKurs } from '../scripts/zbuduj-tresc.mjs';

const { moduly } = wczytajKurs();

for (const m of moduly) {
  for (const haslo of m.meta.zakres || []) {
    test(`moduł ${m.meta.nr}: hasło „${haslo}” jest w nagłówku`, () => {
      assert.ok(m.wyklad.naglowki.some(s => s.tytul.includes(haslo)), `brak nagłówka z „${haslo}”; są: ${m.wyklad.naglowki.map(s => s.tytul).join(' | ')}`);
    });
  }
}
