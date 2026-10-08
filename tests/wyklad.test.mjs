// Testy wykładu: przykłady mają werdykty zgodne z walidatorem, twierdzenia mają źródła.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujWyklad } from '../scripts/wyklad-md.mjs';
import { wczytajKurs } from '../scripts/zbuduj-tresc.mjs';

test('parsujWyklad: dokument ze zgodnym werdyktem przechodzi, niezgodny rzuca', () => {
  const md = '## Tytuł\n\n```json schemat=s\n{"type": "string"}\n```\n\n```json dokument=d schemat=s oczekiwane=przechodzi\n"a"\n```\n';
  const w = parsujWyklad(md);
  assert.equal(w.przyklady.d.werdykt, 'przechodzi');
  assert.match(w.html, /Otwórz w edytorze/);
  const zle = md.replace('oczekiwane=przechodzi', 'oczekiwane=odrzucony');
  assert.throws(() => parsujWyklad(zle), /werdykt/);
});

test('parsujWyklad: twierdzenie bez źródła jest zgłaszane', () => {
  const w = parsujWyklad('## A\n\nTo jest fakt. <!-- twierdzenie -->\n\nInny fakt. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.1 -->\n');
  assert.equal(w.twierdzenia.length, 2);
  assert.equal(w.twierdzenia[0].zrodlo, null);
  assert.equal(w.twierdzenia[1].zrodlo, 'validation §6.1.1');
  assert.doesNotMatch(w.html, /twierdzenie|zrodlo/);
});

test('parsujWyklad: nagłówki dostają kotwice, ramka draft-07 klasę', () => {
  const w = parsujWyklad('## Wyrażenia regularne\n\n> **W draft-07:** inaczej.\n');
  assert.deepEqual(w.sekcje, [{ id: 'wyrazenia-regularne', tytul: 'Wyrażenia regularne' }]);
  assert.match(w.html, /id="wyrazenia-regularne"/);
  assert.match(w.html, /class="draft07"/);
});

test('parsujWyklad: pytanie do sali renderuje się jako zwijany blok', () => {
  const md = '```json schemat=s\n{"minimum": 1}\n```\n\n```json pytanie=p schemat=s oczekiwane=odrzucony\n0\n```\n';
  const w = parsujWyklad(md);
  assert.match(w.html, /<details class="pytanie"/);
  assert.equal(w.przyklady.p.werdykt, 'odrzucony');
});

const { moduly } = wczytajKurs();
for (const m of moduly) {
  test(`moduł ${m.meta.nr}: każde twierdzenie w wykładzie ma źródło`, () => {
    const bez = m.wyklad.twierdzenia.filter(t => !t.zrodlo);
    assert.deepEqual(bez.map(t => t.tekst), []);
    // Moduł opisowy (modul.json: "opisowy": true) może nie mieć twierdzeń o JSON Schema ani przykładów z werdyktami.
    if (!m.meta.opisowy) assert.ok(m.wyklad.twierdzenia.length >= 1, 'wykład ma oznaczone twierdzenia');
  });
  test(`moduł ${m.meta.nr}: wykład ma przykłady z policzonymi werdyktami`, { skip: m.meta.opisowy ? 'moduł opisowy' : false }, () => {
    const dok = Object.values(m.wyklad.przyklady).filter(p => p.dokument !== undefined);
    assert.ok(dok.length >= 2);
    for (const p of dok) assert.ok(['przechodzi', 'odrzucony'].includes(p.werdykt));
  });
}

test('parsujWyklad: blok odpowiedzi jest zwijany, z markdownem w środku', () => {
  const w = parsujWyklad('```odpowiedz\nPrzechodzi, bo `null` jest na liście.\n```\n');
  assert.match(w.html, /<details class="pytanie odpowiedz"><summary>Odsłoń odpowiedź<\/summary>/);
  assert.match(w.html, /<code>null<\/code>/);
});

test('wykłady nie podają odpowiedzi na „Przejdzie czy nie?” na widoku', () => {
  for (const m of moduly) {
    const tekst = m.wyklad.html.replace(/<details[^]*?<\/details>/g, '');
    assert.doesNotMatch(tekst, /Odpowiedź( wyżej)?:/, 'moduł ' + m.meta.nr);
  }
});

test('parsujWyklad: ta sama nazwa użyta drugi raz dostaje własny klucz, przycisk otwiera właściwy blok', () => {
  const md = '```json schemat=s\n{"type": "string"}\n```\n\n```json pytanie=s schemat=s oczekiwane=przechodzi\n"a"\n```\n\n```json schemat=s\n{"type": "number"}\n```\n\n```json dokument=d schemat=s oczekiwane=odrzucony\n"a"\n```\n';
  const w = parsujWyklad(md);
  assert.equal(w.przyklady.s.schematTekst, '{ "type": "string" }');
  assert.equal(w.przyklady['s~2'].dokumentTekst, '"a"');
  assert.equal(w.przyklady['s~2'].schemat, 's');
  assert.equal(w.przyklady['s~3'].schematTekst, '{ "type": "number" }');
  assert.equal(w.przyklady.d.schemat, 's~3');
  assert.equal(w.przyklady.s.pierwszyDokument, 's~2');
  assert.match(w.html, /data-otworz-schemat="s~3" data-otworz-dokument="d"/);
});

test('parsujWyklad: przykłady są formatowane, a schemat z dokumentami stoi w parze (schemat po lewej)', () => {
  const md = '```json schemat=s\n{\n  "type": "string"\n}\n```\n\n```json dokument=d schemat=s oczekiwane=przechodzi\n"a"\n```\n\nTekst.\n';
  const w = parsujWyklad(md);
  assert.equal(w.przyklady.s.schematTekst, '{ "type": "string" }');
  assert.match(w.html, /<div class="para"><div class="para-schemat"><figure class="przyklad schemat"[^]*<\/figure>\n<\/div><div class="para-dokumenty">\s*<figure class="przyklad dokument/);
});

test('parsujWyklad: lustro ma schemat po lewej, nawet gdy w źródle stoi drugi', () => {
  const md = '```json lustro=k strona=dokument\n{"a": 1}\n```\n\n```json lustro=k strona=schemat\n{"type": "object"}\n```\n';
  const w = parsujWyklad(md);
  assert.ok(w.html.indexOf('data-strona="schemat"') < w.html.indexOf('data-strona="dokument"'));
});

test('parsujWyklad: spis treści modułu i spis części na początku sekcji z podrozdziałami', () => {
  const w = parsujWyklad('## Pierwsza\n\nWstęp.\n\n### Część A\n\nA.\n\n### Część B\n\nB.\n\n## Druga\n\nBez części.\n');
  assert.match(w.html, /^<nav class="spis-modulu"[^]*href="#pierwsza"[^]*href="#druga"[^]*<\/nav>/);
  assert.match(w.html, /<h2 id="pierwsza">Pierwsza<\/h2>\n<nav class="spis-sekcji"[^]*href="#czesc-a"[^]*href="#czesc-b"[^]*<\/nav>/);
  assert.doesNotMatch(w.html.slice(w.html.indexOf('id="druga"')), /spis-sekcji/);
});

test('parsujWyklad: powtórzony nagłówek dostaje unikalną kotwicę', () => {
  const w = parsujWyklad('## A\n\n### Pułapka\n\nx\n\n## B\n\n### Pułapka\n\ny\n');
  assert.deepEqual(w.naglowki.filter(n => n.poziom === 3).map(n => n.id), ['pulapka', 'pulapka-2']);
});

test('parsujWyklad: kod w tekście ma klasę schematu albo dokumentu', () => {
  const w = parsujWyklad('Słowo `required`, pole `uwagi`, dane `{"uwagi": null}`{d} i reguła `"type": "string"`{s}.\n');
  assert.match(w.html, /<code class="kod-schemat">required<\/code>/);
  assert.match(w.html, /<code>uwagi<\/code>/);
  assert.match(w.html, /<code class="kod-dokument">\{&quot;uwagi&quot;: null\}<\/code>/);
  assert.match(w.html, /<code class="kod-schemat">&quot;type&quot;: &quot;string&quot;<\/code>/);
  assert.doesNotMatch(w.html, /\{[sd]\}/);
});

test('parsujWyklad: blok z format=bez zostaje w zapisie autora', () => {
  const md = '```json schemat=s format=bez\n{\n  "type": "string"\n}\n```\n';
  assert.equal(parsujWyklad(md).przyklady.s.schematTekst, '{\n  "type": "string"\n}');
});

test('parsujWyklad: dwa schematy, a po nich ich dokumenty, układają się w dwie pary', () => {
  const md = '```json schemat=a\n{"type": "string"}\n```\n\n```json schemat=b\n{"type": "number"}\n```\n\n```json dokument=da schemat=a oczekiwane=przechodzi\n"x"\n```\n\n```json dokument=db schemat=b oczekiwane=przechodzi\n1\n```\n';
  const w = parsujWyklad(md);
  assert.equal((w.html.match(/<div class="para">/g) || []).length, 2);
  assert.ok(w.html.indexOf('data-nazwa="da"') < w.html.indexOf('data-nazwa="b"'));
});

test('parsujWyklad: blok z rolą dostaje kolor konwencji bez werdyktu i jest sprawdzany jako JSON', () => {
  assert.match(parsujWyklad('```json rola=dokument\n{"a": 1}\n```\n').html, /<pre class="dokument"><code class="jezyk-json">\{ "a": 1 \}|<pre class="dokument"><code class="jezyk-json">\{ &quot;a&quot;: 1 \}/);
  assert.throws(() => parsujWyklad('```json rola=dokument\n{"a": }\n```\n'), /niepoprawny JSON/);
});

test('lustro: poziom w schemacie liczy się według properties, tak jak poziom w dokumencie', () => {
  const md = '```json lustro=k strona=dokument\n{\n  "numer": "Z",\n  "klient": {\n    "nazwa": "S"\n  }\n}\n```\n\n' +
    '```json lustro=k strona=schemat\n{\n  "type": "object",\n  "properties": {\n    "numer": { "type": "string", "pattern": "^[A-Z]{1}$" },\n    "klient": {\n      "type": "object",\n      "properties": {\n        "nazwa": { "type": "string" }\n      }\n    }\n  }\n}\n```\n';
  const html = parsujWyklad(md).html;
  const poziom = (strona, fragment) => new RegExp(`data-strona="${strona}"[^]*?<span class="poziom-(\\d)">[^<]*${fragment}`).exec(html)[1];
  assert.equal(poziom('dokument', '&quot;numer&quot;'), '1');
  assert.equal(poziom('schemat', '&quot;numer&quot;'), '1');
  assert.equal(poziom('dokument', '&quot;nazwa&quot;'), '2');
  assert.equal(poziom('schemat', '&quot;nazwa&quot;'), '2');
  assert.equal(poziom('schemat', '&quot;type&quot;: &quot;object&quot;'), '0');
});
