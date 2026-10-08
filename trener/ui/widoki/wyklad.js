import { idz, hashTrasy } from '../router.js';

export function renderujWyklad(kontener, { modul, kotwica }) {
  const nr = modul.meta.nr;
  const spis = modul.wyklad.sekcje.map(s => `<li><a href="${hashTrasy({ widok: 'modul', nr, kotwica: s.id })}">${s.tytul}</a></li>`).join('');
  kontener.innerHTML = `<div class="wyklad-uklad">
    <nav class="spis" aria-label="Sekcje wykładu"><ol>${spis}</ol></nav>
    <article class="wyklad">${modul.wyklad.html}</article>
  </div>`;
  const art = kontener.querySelector('.wyklad');
  // Spisy treści w wykładzie mają kotwice „#id”; w trenerze adres to trasa „#/m/nr/wyklad/id”.
  art.querySelectorAll('a[href^="#"]:not([href^="#/"])').forEach(a => { a.href = hashTrasy({ widok: 'modul', nr, kotwica: a.getAttribute('href').slice(1) }); });
  art.addEventListener('click', e => {
    const b = e.target.closest('button[data-otworz-schemat]');
    if (!b) return;
    const naglowek = (() => { let el = b; while (el && el !== kontener) { let p = el.previousElementSibling; while (p) { if (p.tagName === 'H2' || p.tagName === 'H3') return p.id; p = p.previousElementSibling; } el = el.parentElement; } return null; })();
    idz({ widok: 'piaskownica', z: { nr, schemat: b.dataset.otworzSchemat, dokument: b.dataset.otworzDokument || null, kotwica: naglowek } });
  });
  if (kotwica) {
    const cel = kontener.querySelector('#' + CSS.escape(kotwica));
    if (cel) requestAnimationFrame(() => cel.scrollIntoView({ block: 'start' }));
  }
}
