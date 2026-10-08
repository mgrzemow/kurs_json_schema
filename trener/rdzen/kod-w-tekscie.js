// Konwencja kolorów dla kodu w tekście: fragment schematu (s) i fragment dokumentu z danymi (d).
// Słowo kluczowe JSON Schema jest fragmentem schematu bez dodatkowego oznaczenia;
// resztę autor oznacza w Markdownie: `{"uwagi": null}`{d} albo `"type": "string"`{s}.
import { ZNANE_SLOWA } from './analiza-schematu.js';

export function klasaKodu(tekst, znacznik) {
  if (znacznik === 's' || znacznik === 'd') return znacznik;
  return ZNANE_SLOWA.has(tekst) ? 's' : null;
}

export const NAZWY_KLAS = { s: 'kod-schemat', d: 'kod-dokument' };
