// Tymczasowa wersja (zadanie 8 planu zastępuje ją pełną piaskownicą).
import { esc } from '../html.js';
import { hashTrasy } from '../router.js';

export function renderujPiaskownice(kontener, { z, modul }) {
  const powrot = z ? `<p><a href="${hashTrasy({ widok: 'modul', nr: z.nr, kotwica: z.kotwica })}">← Wróć do wykładu</a></p>` : '';
  const przyklad = z && modul ? `<pre>${esc(modul.wyklad.przyklady[z.schemat]?.schematTekst || '')}</pre>` : '';
  kontener.innerHTML = `<section class="piaskownica">${powrot}<h1>Piaskownica</h1><p>Wkrótce: edytor schematu i dokumentu.</p>${przyklad}</section>`;
  return () => {};
}
