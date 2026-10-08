// Tymczasowa wersja (zadanie 8 planu zastępuje ją ramą ćwiczenia).
import { esc } from '../html.js';

export function renderujCwiczenie(kontener, { cw }) {
  kontener.innerHTML = `<section><h1>${esc(cw.tytul)}</h1><p>Wkrótce: edytor i przykłady.</p></section>`;
  return () => {};
}
