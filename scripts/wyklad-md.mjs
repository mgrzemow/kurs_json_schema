// Parser wykładu w Markdownie: przykłady schemat/dokument z policzonym werdyktem,
// pytania do sali, kotwice nagłówków, ramki „W draft-07”, twierdzenia ze źródłami.
import { Marked } from 'marked';
import { utworzWalidator } from '../trener/rdzen/walidator.js';
import { parsujJSON } from '../trener/rdzen/parser-json.js';

const walidatorDomyslny = utworzWalidator({ formaty: false });

export function slug(tekst) {
  const mapa = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  return tekst.toLowerCase().replace(/[ąćęłńóśźż]/g, c => mapa[c]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// „json schemat=x oczekiwane=przechodzi” → { jezyk: 'json', schemat: 'x', oczekiwane: 'przechodzi' }
function parsujInfo(info) {
  const [jezyk, ...reszta] = (info || '').trim().split(/\s+/);
  const o = { jezyk };
  for (const p of reszta) {
    const i = p.indexOf('=');
    if (i > 0) o[p.slice(0, i)] = p.slice(i + 1);
  }
  return o;
}

// Wyciąga twierdzenia i źródła z akapitów, zwraca markdown bez znaczników.
function zbierzTwierdzenia(md) {
  const twierdzenia = [];
  const akapity = md.split(/\n\s*\n/);
  const czyste = akapity.map(a => {
    const maTwierdzenie = /<!--\s*twierdzenie\s*-->/.test(a);
    const z = /<!--\s*zrodlo:\s*([^]*?)\s*-->/.exec(a);
    const bez = a.replace(/<!--\s*twierdzenie\s*-->/g, '').replace(/<!--\s*zrodlo:[^]*?-->/g, '').replace(/[ \t]+$/gm, '');
    if (maTwierdzenie || z) {
      twierdzenia.push({ tekst: bez.replace(/\s+/g, ' ').trim().slice(0, 160), zrodlo: z ? z[1].trim() : null });
    }
    return bez;
  });
  return { md: czyste.join('\n\n'), twierdzenia };
}

export function parsujWyklad(md, { walidator = walidatorDomyslny } = {}) {
  const sekcje = [];
  const przyklady = {};
  const { md: mdCzysty, twierdzenia } = zbierzTwierdzenia(md);

  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const tytul = this.parser.parseInline(tokens);
        const czysty = tytul.replace(/<[^>]+>/g, '');
        const id = slug(czysty);
        if (depth === 2) sekcje.push({ id, tytul: czysty });
        return `<h${depth} id="${id}">${tytul}</h${depth}>\n`;
      },
      blockquote({ tokens }) {
        const html = this.parser.parse(tokens);
        const klasa = /^\s*<p><strong>W draft-07:<\/strong>/.test(html) ? ' class="draft07"' : '';
        return `<blockquote${klasa}>\n${html}</blockquote>\n`;
      },
      code({ text, lang }) {
        const info = parsujInfo(lang);
        if (info.jezyk !== 'json' || !(info.schemat || info.dokument || info.pytanie)) {
          return `<pre><code class="jezyk-${esc(info.jezyk || 'tekst')}">${esc(text)}</code></pre>\n`;
        }
        let wartosc;
        try { wartosc = parsujJSON(text).wartosc; } catch (e) { throw new Error(`Blok „${lang}”: niepoprawny JSON: ${e.message}`); }
        if (info.schemat && !info.dokument && !info.pytanie) {
          przyklady[info.schemat] = { ...(przyklady[info.schemat] || {}), schemat: wartosc, schematTekst: text };
          return `<figure class="przyklad schemat" data-nazwa="${esc(info.schemat)}"><figcaption>Schemat <code>${esc(info.schemat)}</code></figcaption><pre><code class="jezyk-json">${esc(text)}</code></pre>` +
            `<button type="button" class="otworz" data-otworz-schemat="${esc(info.schemat)}">Otwórz w edytorze</button></figure>\n`;
        }
        const nazwa = info.dokument || info.pytanie;
        const schemat = przyklady[info.schemat];
        if (!schemat || schemat.schemat === undefined) throw new Error(`Blok „${lang}”: schemat „${info.schemat}” nie został wcześniej zdefiniowany.`);
        let werdykt;
        try { werdykt = walidator.kompiluj(schemat.schemat).sprawdz(wartosc).ok ? 'przechodzi' : 'odrzucony'; } catch (e) { throw new Error(`Blok „${lang}”: schemat „${info.schemat}” nie kompiluje się: ${e.message}`); }
        if (info.oczekiwane && info.oczekiwane !== werdykt) throw new Error(`Blok „${lang}”: oczekiwany werdykt „${info.oczekiwane}”, a walidator dał „${werdykt}”.`);
        przyklady[nazwa] = { dokument: wartosc, dokumentTekst: text, schemat: info.schemat, werdykt, pytanie: !!info.pytanie };
        const etykieta = werdykt === 'przechodzi' ? 'Przechodzi' : 'Odrzucony';
        const pre = `<pre><code class="jezyk-json">${esc(text)}</code></pre>`;
        const przycisk = `<button type="button" class="otworz" data-otworz-schemat="${esc(info.schemat)}" data-otworz-dokument="${esc(nazwa)}">Otwórz w edytorze</button>`;
        if (info.pytanie) {
          return `<details class="pytanie" data-nazwa="${esc(nazwa)}"><summary>Przejdzie czy nie? Dokument dla schematu <code>${esc(info.schemat)}</code></summary>${pre}` +
            `<p class="werdykt ${werdykt}">Werdykt: ${etykieta}.</p>${przycisk}</details>\n`;
        }
        return `<figure class="przyklad dokument ${werdykt}" data-nazwa="${esc(nazwa)}"><figcaption>Dokument <code>${esc(nazwa)}</code> dla schematu <code>${esc(info.schemat)}</code>: <span class="werdykt ${werdykt}">${etykieta}</span></figcaption>${pre}${przycisk}</figure>\n`;
      },
    },
  });

  const html = marked.parse(mdCzysty);
  return { html, sekcje, przyklady, twierdzenia };
}
