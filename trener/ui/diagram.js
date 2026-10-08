// Diagram zależności między plikami projektu (czysta funkcja → SVG jako string).
// Plik główny po lewej, pozostałe w kolumnie po prawej; zepsute odwołania prowadzą
// do przerywanego węzła „?” z nazwą odwołania.
import { esc } from './html.js';

export function rysujDiagram({ pliki, glowny, odwolania }) {
  const inne = pliki.filter(p => p !== glowny);
  const zepsute = odwolania.filter(o => o.doPliku === null);
  const prawe = [...inne.map(n => ({ id: n, nazwa: n, brak: false })), ...zepsute.map((o, i) => ({ id: '?' + i, nazwa: '? ' + o.ref, brak: true, ref: o.ref, zPliku: o.zPliku }))];
  const szer = n => Math.max(90, 10 + n.length * 7.5);
  const W = 420;
  const h = 32;
  const odstep = 50;
  const H = Math.max(80, 20 + prawe.length * odstep);
  const pozycje = {};
  pozycje[glowny] = { x: 12, y: H / 2 - h / 2, w: szer(glowny) };
  prawe.forEach((p, i) => { pozycje[p.id] = { x: W - 12 - szer(p.nazwa), y: 10 + i * odstep, w: szer(p.nazwa) }; });

  const wezel = (id, nazwa, klasa) => {
    const p = pozycje[id];
    return `<g class="wezel${klasa ? ' ' + klasa : ''}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${h}" rx="6"/><text x="${p.x + p.w / 2}" y="${p.y + h / 2 + 4}" text-anchor="middle">${esc(nazwa)}</text></g>`;
  };
  const krawedz = (od, doId, etykieta, zepsuta) => {
    const a = pozycje[od];
    const b = pozycje[doId];
    if (!a || !b) return '';
    const x1 = a.x + a.w;
    const y1 = a.y + h / 2;
    const x2 = b.x;
    const y2 = b.y + h / 2;
    const mx = (x1 + x2) / 2;
    const sciezka = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    const marker = zepsuta ? 'url(#strzalka-zepsuta)' : 'url(#strzalka)';
    const tekst = zepsuta ? '' : `<text class="etykieta" x="${mx}" y="${(y1 + y2) / 2 - 4}" text-anchor="middle">${esc(etykieta)}</text>`;
    return `<path class="krawedz${zepsuta ? ' zepsute' : ''}" d="${sciezka}" marker-end="${marker}"/>${tekst}`;
  };

  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Zależności między plikami">`;
  out += '<defs><marker id="strzalka" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker>' +
    '<marker id="strzalka-zepsuta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#b3261e"/></marker></defs>';
  for (const o of odwolania) {
    if (o.doPliku !== null) out += krawedz(o.zPliku, o.doPliku, o.ref, false);
  }
  zepsute.forEach((o, i) => { out += krawedz(o.zPliku, '?' + i, o.ref, true); });
  out += wezel(glowny, glowny, 'glowny');
  for (const p of prawe) out += wezel(p.id, p.nazwa, p.brak ? 'brak' : '');
  return out + '</svg>';
}
