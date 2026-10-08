import { idz } from '../router.js';

export function renderujWyklad(kontener, { modul, kotwica }) {
  const nr = modul.meta.nr;
  const spis = modul.wyklad.sekcje.map(s => `<li><a href="#/m/${nr}/wyklad/${s.id}">${s.tytul}</a></li>`).join('');
  kontener.innerHTML = `<div class="wyklad-uklad">
    <nav class="spis" aria-label="Sekcje wykładu"><ol>${spis}</ol></nav>
    <article class="wyklad">${modul.wyklad.html}</article>
  </div>`;
  kontener.querySelector('.wyklad').addEventListener('click', e => {
    const b = e.target.closest('button[data-otworz-schemat]');
    if (!b) return;
    const sekcja = b.closest('h2, section') || null;
    const naglowek = (() => { let el = b; while (el && el !== kontener) { let p = el.previousElementSibling; while (p) { if (p.tagName === 'H2') return p.id; p = p.previousElementSibling; } el = el.parentElement; } return null; })();
    idz({ widok: 'piaskownica', z: { nr, schemat: b.dataset.otworzSchemat, dokument: b.dataset.otworzDokument || null, kotwica: naglowek || (sekcja && sekcja.id) || null } });
  });
  if (kotwica) {
    const cel = kontener.querySelector('#' + CSS.escape(kotwica));
    if (cel) requestAnimationFrame(() => cel.scrollIntoView({ block: 'start' }));
  }
}
