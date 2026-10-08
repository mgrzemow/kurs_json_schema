// Parser wykładu w Markdownie: przykłady schemat/dokument z policzonym werdyktem,
// pytania do sali, kotwice nagłówków, spisy treści, ramki „W draft-07”, twierdzenia ze źródłami.
import { Marked } from 'marked';
import { utworzWalidator } from '../trener/rdzen/walidator.js';
import { parsujJSON } from '../trener/rdzen/parser-json.js';
import { formatujJSON } from '../trener/rdzen/formatuj.js';
import { klasaKodu, NAZWY_KLAS } from '../trener/rdzen/kod-w-tekscie.js';

const walidatorDomyslny = utworzWalidator({ formaty: false });
// Szerokość, do której łamiemy JSON w przykładach: mieści się w połowie szerokości wykładu
// (schemat i dokument obok siebie) i w kolumnie materiałów A4.
export const SZEROKOSC_PRZYKLADU = 56;

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

// Kod w tekście: słowo kluczowe dostaje klasę schematu, `…`{s} i `…`{d} oznaczają fragment
// schematu albo dokumentu (konwencja kolorów, patrz trener/rdzen/kod-w-tekscie.js).
const kodZeZnacznikiem = {
  name: 'kodZeZnacznikiem',
  level: 'inline',
  start: src => src.indexOf('`'),
  tokenizer(src) {
    // Kod zamyka pierwszy ciąg tylu samych odwrotnych apostrofów, ilu go otworzyło (jak w CommonMark).
    const otw = /^`+/.exec(src);
    if (!otw) return undefined;
    const n = otw[0].length;
    const re = /`+/g;
    re.lastIndex = n;
    let m;
    while ((m = re.exec(src)) && m[0].length !== n);
    if (!m) return undefined;
    const znacznik = /^\{([sd])\}/.exec(src.slice(m.index + n));
    if (!znacznik) return undefined;
    return { type: 'kodZeZnacznikiem', raw: src.slice(0, m.index + n + znacznik[0].length), text: src.slice(n, m.index), klasa: znacznik[1] };
  },
  renderer: t => `<code class="${NAZWY_KLAS[t.klasa]}">${esc(t.text)}</code>`,
};
const kodRenderer = {
  codespan({ text }) {
    const k = klasaKodu(text);
    return k ? `<code class="${NAZWY_KLAS[k]}">${esc(text)}</code>` : `<code>${esc(text)}</code>`;
  },
};

export function utworzMarkdown(renderer = {}) {
  return new Marked({ extensions: [kodZeZnacznikiem], renderer: { ...kodRenderer, ...renderer } });
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
  const naglowki = [];
  const przyklady = {};
  const uzyteId = new Map();
  const uzyteNazwy = new Map();
  const aktualnySchemat = {}; // nazwa schematu → klucz ostatniej definicji
  const { md: mdCzysty, twierdzenia } = zbierzTwierdzenia(md);

  // Ta sama nazwa może się w wykładzie powtórzyć (np. schemat poprawiony kawałek dalej).
  // Każdy blok dostaje własny klucz, żeby „Otwórz w edytorze” otwierało dokładnie ten blok.
  const kluczBloku = nazwa => {
    const n = (uzyteNazwy.get(nazwa) || 0) + 1;
    uzyteNazwy.set(nazwa, n);
    return n === 1 ? nazwa : `${nazwa}~${n}`;
  };
  const sformatuj = (tekst, info) => (info.format === 'bez' ? tekst : formatujJSON(tekst, { szerokosc: SZEROKOSC_PRZYKLADU }));

  const marked = utworzMarkdown({
    heading({ tokens, depth }) {
      const tytul = this.parser.parseInline(tokens);
      const czysty = tytul.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const baza = slug(czysty);
      const n = (uzyteId.get(baza) || 0) + 1;
      uzyteId.set(baza, n);
      const id = n === 1 ? baza : `${baza}-${n}`;
      if (depth === 2) sekcje.push({ id, tytul: czysty });
      if (depth === 2 || depth === 3) naglowki.push({ poziom: depth, id, tytul: czysty, html: tytul });
      return `<h${depth} id="${id}">${tytul}</h${depth}>\n`;
    },
    blockquote({ tokens }) {
      const html = this.parser.parse(tokens);
      const klasa = /^\s*<p><strong>W draft-07:<\/strong>/.test(html) ? ' class="draft07"' : '';
      return `<blockquote${klasa}>\n${html}</blockquote>\n`;
    },
    code({ text, lang }) {
      const info = parsujInfo(lang);
      // Odpowiedź na „Przejdzie czy nie?”: w trenerze zwinięta, w materiałach rozwinięta.
      if (info.jezyk === 'odpowiedz') {
        return `<details class="pytanie odpowiedz"><summary>Odsłoń odpowiedź</summary>${utworzMarkdown().parse(text)}</details>\n`;
      }
      if (info.jezyk === 'json' && info.lustro) {
        try { parsujJSON(text); } catch (e) { throw new Error(`Blok „${lang}”: niepoprawny JSON: ${e.message}`); }
        const strona = info.strona === 'schemat' ? 'schemat' : 'dokument';
        return `<figure class="lustro-czesc ${strona}" data-lustro="${esc(info.lustro)}" data-strona="${strona}"><figcaption>${strona === 'schemat' ? 'Schemat' : 'Dokument'}</figcaption><pre><code class="jezyk-json">${kolorujPoziomy(text, strona)}</code></pre></figure>\n`;
      }
      // Fragment bez werdyktu, ale z rolą („rola=dokument” albo „rola=schemat”): tylko kolor konwencji.
      if (info.jezyk === 'json' && (info.rola === 'dokument' || info.rola === 'schemat') && !(info.schemat || info.dokument || info.pytanie)) {
        try { parsujJSON(text); } catch (e) { throw new Error(`Blok „${lang}”: niepoprawny JSON: ${e.message}`); }
        return `<pre class="${info.rola}"><code class="jezyk-json">${esc(info.format === 'bez' ? text : formatujJSON(text, { szerokosc: SZEROKOSC_PRZYKLADU }))}</code></pre>\n`;
      }
      if (info.jezyk !== 'json' || !(info.schemat || info.dokument || info.pytanie)) {
        return `<pre><code class="jezyk-${esc(info.jezyk || 'tekst')}">${esc(text)}</code></pre>\n`;
      }
      let wartosc;
      try { wartosc = parsujJSON(text).wartosc; } catch (e) { throw new Error(`Blok „${lang}”: niepoprawny JSON: ${e.message}`); }
      const tekst = sformatuj(text, info);
      if (info.schemat && !info.dokument && !info.pytanie) {
        const klucz = kluczBloku(info.schemat);
        aktualnySchemat[info.schemat] = klucz;
        przyklady[klucz] = { schemat: wartosc, schematTekst: tekst, nazwa: info.schemat };
        return `<figure class="przyklad schemat" data-nazwa="${esc(klucz)}"><figcaption>Schemat <code>${esc(info.schemat)}</code></figcaption><pre><code class="jezyk-json">${esc(tekst)}</code></pre>` +
          `<button type="button" class="otworz" data-otworz-schemat="${esc(klucz)}">Otwórz w edytorze</button></figure>\n`;
      }
      const nazwa = info.dokument || info.pytanie;
      const kluczSchematu = aktualnySchemat[info.schemat];
      const schemat = przyklady[kluczSchematu];
      if (!schemat) throw new Error(`Blok „${lang}”: schemat „${info.schemat}” nie został wcześniej zdefiniowany.`);
      let werdykt;
      try { werdykt = walidator.kompiluj(schemat.schemat).sprawdz(wartosc).ok ? 'przechodzi' : 'odrzucony'; } catch (e) { throw new Error(`Blok „${lang}”: schemat „${info.schemat}” nie kompiluje się: ${e.message}`); }
      if (info.oczekiwane && info.oczekiwane !== werdykt) throw new Error(`Blok „${lang}”: oczekiwany werdykt „${info.oczekiwane}”, a walidator dał „${werdykt}”.`);
      const klucz = kluczBloku(nazwa);
      przyklady[klucz] = { dokument: wartosc, dokumentTekst: tekst, schemat: kluczSchematu, werdykt, pytanie: !!info.pytanie, nazwa };
      if (!schemat.pierwszyDokument) schemat.pierwszyDokument = klucz;
      const etykieta = werdykt === 'przechodzi' ? 'Przechodzi' : 'Odrzucony';
      const pre = `<pre><code class="jezyk-json">${esc(tekst)}</code></pre>`;
      const przycisk = `<button type="button" class="otworz" data-otworz-schemat="${esc(kluczSchematu)}" data-otworz-dokument="${esc(klucz)}">Otwórz w edytorze</button>`;
      if (info.pytanie) {
        return `<details class="pytanie" data-nazwa="${esc(klucz)}" data-schemat="${esc(kluczSchematu)}"><summary>Przejdzie czy nie? Dokument dla schematu <code>${esc(info.schemat)}</code></summary>${pre}` +
          `<p class="werdykt ${werdykt}">Werdykt: ${etykieta}.</p>${przycisk}</details>\n`;
      }
      return `<figure class="przyklad dokument ${werdykt}" data-nazwa="${esc(klucz)}" data-schemat="${esc(kluczSchematu)}"><figcaption>Dokument <code>${esc(nazwa)}</code><span class="dla-schematu"> dla schematu <code>${esc(info.schemat)}</code></span>: <span class="werdykt ${werdykt}">${etykieta}</span></figcaption>${pre}${przycisk}</figure>\n`;
    },
  });

  let html = marked.parse(mdCzysty);
  // Lustro: dwie sąsiednie części o tej samej nazwie we wspólnym kontenerze, schemat zawsze po lewej.
  html = html.replace(/(<figure class="lustro-czesc[^"]*" data-lustro="([^"]+)"[^]*?<\/figure>\n)\s*(<figure class="lustro-czesc[^"]*" data-lustro="\2"[^]*?<\/figure>\n)/g,
    (_, a, __, b) => `<div class="lustro">${/data-strona="schemat"/.test(b) ? b + a : a + b}</div>\n`);
  // Kilka przykładów jeden pod drugim, bez tekstu pomiędzy (np. dwa schematy, potem ich dokumenty):
  // każdy schemat dostaje swoje dokumenty zaraz za sobą, żeby mogły stanąć obok niego.
  const ELEMENT = /<figure class="przyklad [^"]*" data-nazwa="[^"]+"[^]*?<\/figure>\n|<details class="pytanie" data-nazwa="[^"]+"[^]*?<\/details>\n/g;
  html = html.replace(new RegExp(`(?:(?:${ELEMENT.source})\\s*){2,}`, 'g'), ciag => {
    const el = [...ciag.matchAll(ELEMENT)].map(m => m[0]);
    const schematy = el.filter(e => e.startsWith('<figure class="przyklad schemat"'));
    const doSchematu = e => (/data-schemat="([^"]+)"/.exec(e) || [])[1];
    const klucze = schematy.map(e => /data-nazwa="([^"]+)"/.exec(e)[1]);
    const obce = el.filter(e => !schematy.includes(e) && !klucze.includes(doSchematu(e)));
    return obce.join('') + schematy.map((s, i) => s + el.filter(e => doSchematu(e) === klucze[i]).join('')).join('');
  });
  // Schemat, a zaraz po nim jego dokumenty (bez tekstu pomiędzy): para, schemat po lewej, dokumenty po prawej.
  html = html.replace(/(<figure class="przyklad schemat" data-nazwa="([^"]+)"[^]*?<\/figure>\n)((?:\s*(?:<figure class="przyklad dokument[^"]*" data-nazwa="[^"]+" data-schemat="\2"[^]*?<\/figure>|<details class="pytanie" data-nazwa="[^"]+" data-schemat="\2"[^]*?<\/details>)\n)+)/g,
    '<div class="para"><div class="para-schemat">$1</div><div class="para-dokumenty">$3</div></div>\n');
  html = dodajSpisy(html, naglowki);
  return { html, sekcje, naglowki, przyklady, twierdzenia };
}

// Spis treści modułu na górze i spis części na początku każdej sekcji, która ma podrozdziały.
// Nagłówki w spisie to dokładnie te same nagłówki, które stoją potem w tekście.
function dodajSpisy(html, naglowki) {
  const h2 = naglowki.filter(n => n.poziom === 2);
  for (let i = 0; i < naglowki.length; i++) {
    const n = naglowki[i];
    if (n.poziom !== 2) continue;
    const czesci = [];
    for (let j = i + 1; j < naglowki.length && naglowki[j].poziom === 3; j++) czesci.push(naglowki[j]);
    if (czesci.length < 2) continue;
    const spis = `<nav class="spis-sekcji" aria-label="Części sekcji"><p>W tej części:</p><ul>${czesci.map(c => `<li><a href="#${c.id}">${c.html}</a></li>`).join('')}</ul></nav>\n`;
    const znacznik = `<h2 id="${n.id}">`;
    const k = html.indexOf('</h2>\n', html.indexOf(znacznik)) + '</h2>\n'.length;
    html = html.slice(0, k) + spis + html.slice(k);
  }
  if (h2.length >= 2) {
    html = `<nav class="spis-modulu" aria-label="Spis treści modułu"><p>W tym module:</p><ol>${h2.map(n => `<li><a href="#${n.id}">${n.html}</a></li>`).join('')}</ol></nav>\n` + html;
  }
  return html;
}

// Każda linia JSON-a dostaje klasę poziomu zagnieżdżenia. W dokumencie poziom to liczba otwartych
// nawiasów przed linią. W schemacie każdy poziom dokumentu to dwa nawiasy (podschemat i jego
// `properties`), więc poziom liczy się jako liczba otwartych obiektów `properties` — wtedy pole
// klienta ma w schemacie ten sam kolor co w dokumencie. Teksty w cudzysłowach nie liczą się
// (wzorce mają nawiasy).
function kolorujPoziomy(tekst, strona = 'dokument') {
  const stos = []; // true = obiekt będący wartością "properties"
  const poziom = () => (strona === 'schemat' ? stos.filter(Boolean).length : stos.length);
  return tekst.split('\n').map(linia => {
    const bezTekstow = linia.replace(/"(?:\\.|[^"\\])*"/g, m => (m === '"properties"' ? m : '""'));
    const zamkniecia = /^\s*([}\]]+)/.exec(bezTekstow);
    for (let i = 0; zamkniecia && i < zamkniecia[1].length; i++) stos.pop();
    const biezacy = poziom();
    const reszta = zamkniecia ? bezTekstow.slice(zamkniecia[0].length) : bezTekstow;
    for (let i = 0; i < reszta.length; i++) {
      const c = reszta[i];
      if (c === '{' || c === '[') stos.push(c === '{' && /"properties"\s*:\s*$/.test(reszta.slice(0, i)));
      else if (c === '}' || c === ']') stos.pop();
    }
    return `<span class="poziom-${biezacy}">${esc(linia)}</span>`;
  }).join('\n');
}
