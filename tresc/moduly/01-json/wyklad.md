## Czym jest JSON?

JSON to **tekst** zapisany według kilku prostych reguł. Nie „obiekt”, nie „plik Excela”, nie „baza”: ciąg znaków, który można wysłać mailem, zapisać w pliku, wstawić do bazy albo przekazać między dwoma systemami. To samo zamówienie wygląda identycznie niezależnie od tego, skąd pochodzi i dokąd zmierza. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §1, §2 -->

Skrót rozwija się do *JavaScript Object Notation*, bo składnię zapożyczono z JavaScriptu, ale JSON od dawna nie ma z nim nic wspólnego poza nazwą. Douglas Crockford, który spisał specyfikację, twierdzi, że JSON-a nie wynalazł, tylko „odkrył” w 2001 roku, bo taki zapis już istniał w języku. Pierwsza strona json.org powstała z przyczyn czysto praktycznych: klienci nie chcieli przyjąć formatu bez specyfikacji, więc Crockford napisał ją w jedno popołudnie i zmieścił na jednej stronie. Ta jedna strona wystarcza do dziś. (Źródło: D. Crockford, wykład „The JSON Saga”, 2009, poza repozytorium.)

Gdzie JSON spotyka uczestnik tego kursu: odpowiedzi API, pliki konfiguracyjne narzędzi, eksporty z systemów, komunikaty między sklepem a magazynem, logi. Dla osób pracujących z YAML-em: YAML to nadzbiór JSON-a, więc każdy poprawny JSON jest poprawnym YAML-em, ale nie odwrotnie. W YAML-u są komentarze, w JSON-ie nie.

Przykład z modułu 0, dla przypomnienia, jak wygląda zamówienie w JSON-ie:

```json schemat=zamowienie-1
{ "type": "object", "required": ["numer", "klient", "pozycje"] }
```

```json dokument=zamowienie-1-ok schemat=zamowienie-1 oczekiwane=przechodzi
{
  "numer": "ZAM-2026-000123",
  "klient": "Serwis Rowerowy Pedał",
  "faktura": true,
  "uwagi": null,
  "pozycje": [
    { "ean": "5901234123457", "ilosc": 2, "cena": 12.5 }
  ]
}
```

## JSON a XML

To samo zamówienie w XML-u:

```xml
<zamowienie faktura="true">
  <numer>ZAM-2026-000123</numer>
  <klient>Serwis Rowerowy Pedał</klient>
  <uwagi/>
  <pozycje>
    <pozycja ean="5901234123457" ilosc="2" cena="12.5"/>
  </pozycje>
</zamowienie>
```

Różnice, które mają znaczenie, gdy piszemy schemat:

- W XML-u jedna informacja może być elementem (`<numer>`) albo atrybutem (`faktura="true"`). W JSON-ie jest tylko jeden rodzaj: pole.
- XML nie zna typów: `ilosc="2"` to tekst, dopóki schemat XSD nie powie inaczej. JSON odróżnia liczbę `2` od tekstu `"2"` już w składni. To rozróżnienie będzie wracać przez cały kurs, bo czterdzieści zamówień z modułu 0 odrzucono właśnie przez `"2"`.
- JSON nie ma komentarzy, przestrzeni nazw ani deklaracji nagłówka. Mniej do nauczenia, mniej do popsucia.

Dla osób, które znają XSD: JSON Schema jest dla JSON-a tym, czym XSD dla XML-a. Kilka odpowiedników na start, reszta wyjdzie w praktyce:

| XSD | JSON Schema |
|---|---|
| `xs:element name="numer"` | pole w `properties` |
| `minOccurs="1"` | nazwa w `required` |
| `xs:restriction` z `xs:pattern` | `pattern` |
| `xs:complexType` | `"type": "object"` |

Jeśli XSD nic Wam nie mówi, ta tabela nie jest potrzebna.

## Podstawowe struktury danych (object, array, value, string, number, whitespace)

Cała gramatyka JSON-a to sześć pojęć. Diagramy składni niżej czyta się od lewej do prawej, po strzałkach; każda ścieżka przez diagram to poprawny zapis. (Nazwy pojęć po angielsku, bo tak nazywa je specyfikacja i strona json.org.)

### object

<svg class="diagram-skladni" viewBox="0 0 560 120" role="img" aria-label="Diagram składni obiektu: nawias klamrowy, pary nazwa dwukropek wartość rozdzielone przecinkami, nawias klamrowy zamykający">
  <defs><marker id="grot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 40 H60" marker-end="url(#grot)"/>
    <path d="M100 40 H150" marker-end="url(#grot)"/>
    <path d="M210 40 H250" marker-end="url(#grot)"/>
    <path d="M280 40 H320" marker-end="url(#grot)"/>
    <path d="M400 40 H450" marker-end="url(#grot)"/>
    <path d="M490 40 H540" marker-end="url(#grot)"/>
    <path d="M420 40 V85 H135 V40" marker-end="url(#grot)"/>
    <path d="M125 40 V12 H430 V40"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="14" text-anchor="middle">
    <rect x="60" y="25" width="40" height="30" rx="15"/><text x="80" y="45">{</text>
    <rect x="150" y="25" width="60" height="30"/><text x="180" y="45">string</text>
    <rect x="250" y="25" width="30" height="30" rx="15"/><text x="265" y="45">:</text>
    <rect x="320" y="25" width="80" height="30"/><text x="360" y="45">value</text>
    <rect x="450" y="25" width="40" height="30" rx="15"/><text x="470" y="45">}</text>
    <rect x="262" y="70" width="30" height="30" rx="15"/><text x="277" y="90">,</text>
  </g>
</svg>

Obiekt to nawiasy klamrowe, a w nich pary `"nazwa": wartość` rozdzielone przecinkami. Nazwa jest zawsze tekstem w podwójnym cudzysłowie. Kolejność par nie ma znaczenia. Nazwy **powinny** być unikalne, ale specyfikacja tylko to zaleca, więc wiele parserów przepuszcza duplikat po cichu i bierze ostatnią wartość. Trener ostrzega o duplikacie, system magazynu może nie ostrzec. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §4 -->

```json dokument=obiekt-klient schemat=zamowienie-1 oczekiwane=odrzucony
{ "nazwa": "Serwis Rowerowy Pedał", "email": "serwis@example.com" }
```

(Ten dokument jest poprawnym obiektem, czyli poprawnym JSON-em, ale schemat zamówienia go odrzuca, bo to klient, nie zamówienie. Składnia i zgodność ze schematem to dwie różne rzeczy; czerwony werdykt nie znaczy tu „zły JSON”.)

### array

<svg class="diagram-skladni" viewBox="0 0 400 120" role="img" aria-label="Diagram składni listy: nawias kwadratowy, wartości rozdzielone przecinkami, nawias kwadratowy zamykający">
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 40 H60" marker-end="url(#grot)"/>
    <path d="M100 40 H160" marker-end="url(#grot)"/>
    <path d="M240 40 H300" marker-end="url(#grot)"/>
    <path d="M340 40 H390" marker-end="url(#grot)"/>
    <path d="M270 40 V85 H140 V40" marker-end="url(#grot)"/>
    <path d="M130 40 V12 H280 V40"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="14" text-anchor="middle">
    <rect x="60" y="25" width="40" height="30" rx="15"/><text x="80" y="45">[</text>
    <rect x="160" y="25" width="80" height="30"/><text x="200" y="45">value</text>
    <rect x="300" y="25" width="40" height="30" rx="15"/><text x="320" y="45">]</text>
    <rect x="190" y="70" width="30" height="30" rx="15"/><text x="205" y="90">,</text>
  </g>
</svg>

Lista to nawiasy kwadratowe i wartości po przecinku. Tu kolejność **ma** znaczenie: pierwsza pozycja zamówienia jest pierwsza. Elementy mogą być różnych typów, ale lista `[1, "dwa", null]` to zwykle błąd projektu, nie zaleta. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §5 -->

### value

<svg class="diagram-skladni" viewBox="0 0 320 230" role="img" aria-label="Diagram składni wartości: jedna z siedmiu możliwości: object, array, string, number, true, false, null">
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 115 H40"/>
    <path d="M40 115 V25 H110" marker-end="url(#grot)"/>
    <path d="M40 115 V55 H110" marker-end="url(#grot)"/>
    <path d="M40 115 V85 H110" marker-end="url(#grot)"/>
    <path d="M40 115 H110" marker-end="url(#grot)"/>
    <path d="M40 115 V145 H110" marker-end="url(#grot)"/>
    <path d="M40 115 V175 H110" marker-end="url(#grot)"/>
    <path d="M40 115 V205 H110" marker-end="url(#grot)"/>
    <path d="M190 25 H250 V115"/><path d="M190 55 H250"/><path d="M190 85 H250"/><path d="M190 115 H250"/><path d="M190 145 H250"/><path d="M190 175 H250"/><path d="M190 205 H250 V115"/>
    <path d="M250 115 H310" marker-end="url(#grot)"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="14" text-anchor="middle">
    <rect x="110" y="10" width="80" height="30"/><text x="150" y="30">object</text>
    <rect x="110" y="40" width="80" height="30"/><text x="150" y="60">array</text>
    <rect x="110" y="70" width="80" height="30"/><text x="150" y="90">string</text>
    <rect x="110" y="100" width="80" height="30"/><text x="150" y="120">number</text>
    <rect x="110" y="130" width="80" height="30" rx="15"/><text x="150" y="150">true</text>
    <rect x="110" y="160" width="80" height="30" rx="15"/><text x="150" y="180">false</text>
    <rect x="110" y="190" width="80" height="30" rx="15"/><text x="150" y="210">null</text>
  </g>
</svg>

Wartość to jedna z siedmiu rzeczy: obiekt, lista, tekst, liczba, `true`, `false` albo `null`. Trzy ostatnie piszemy wyłącznie małymi literami; `True` i `NULL` nie są JSON-em. `null` to „wartość: brak”, co jest czymś innym niż brak pola; do tej różnicy wrócimy w module 4. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §3 -->

### string

<svg class="diagram-skladni" viewBox="0 0 520 130" role="img" aria-label="Diagram składni tekstu: cudzysłów, dowolne znaki poza cudzysłowem i odwrotnym ukośnikiem albo ucieczki, cudzysłów">
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 40 H60" marker-end="url(#grot)"/>
    <path d="M100 40 H160" marker-end="url(#grot)"/>
    <path d="M330 40 H400" marker-end="url(#grot)"/>
    <path d="M440 40 H510" marker-end="url(#grot)"/>
    <path d="M130 40 V85 H160" marker-end="url(#grot)"/>
    <path d="M330 85 H365 V40"/>
    <path d="M365 40 V12 H130 V40" marker-end="url(#grot)"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="13" text-anchor="middle">
    <rect x="60" y="25" width="40" height="30" rx="15"/><text x="80" y="45">"</text>
    <rect x="160" y="25" width="170" height="30"/><text x="245" y="45">znak poza " i \</text>
    <rect x="160" y="70" width="170" height="30"/><text x="245" y="90">\" \\ \n \t \uXXXX</text>
    <rect x="400" y="25" width="40" height="30" rx="15"/><text x="420" y="45">"</text>
  </g>
</svg>

Tekst stoi w podwójnych cudzysłowach. Apostrofy `'tak'` nie są cudzysłowem. Kilka znaków wymaga ucieczki odwrotnym ukośnikiem: cudzysłów `\"`, sam ukośnik `\\`, nowa linia `\n`, tabulator `\t`, dowolny znak przez kod `\u0141`. Polskie litery wpisujemy wprost, bo JSON jest w UTF-8; `"Pedał"` jest poprawne i nie trzeba pisać `"Peda\u0142"`. Ucieczka `\\` wróci w module 3 przy wyrażeniach regularnych, gdzie jest najczęstszym źródłem błędów. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §7, §8.1 -->

```json dokument=tekst-z-cudzyslowem schemat=zamowienie-1 oczekiwane=odrzucony
{ "nazwa": "Serwis \"Pedał\"", "sciezka": "C:\\faktury\\2026" }
```

### number

<svg class="diagram-skladni" viewBox="0 0 560 150" role="img" aria-label="Diagram składni liczby: opcjonalny minus, część całkowita bez zer wiodących, opcjonalna część ułamkowa, opcjonalny wykładnik">
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 40 H40"/>
    <path d="M40 40 H90" marker-end="url(#grot)"/>
    <path d="M40 40 V85 H120 V40"/>
    <path d="M120 40 H160" marker-end="url(#grot)"/>
    <path d="M160 40 V12 H230" marker-end="url(#grot)"/>
    <path d="M160 40 V70 H230" marker-end="url(#grot)"/>
    <path d="M330 12 H350 V40"/><path d="M330 70 H350 V40"/>
    <path d="M350 40 H380" marker-end="url(#grot)"/>
    <path d="M350 40 V115 H470 V40"/>
    <path d="M460 40 H550" marker-end="url(#grot)"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="13" text-anchor="middle">
    <rect x="90" y="25" width="30" height="30" rx="15"/><text x="105" y="45">-</text>
    <rect x="230" y="-3" width="100" height="30" rx="15"/><text x="280" y="17">0</text>
    <rect x="230" y="55" width="100" height="30"/><text x="280" y="75">1-9 cyfry…</text>
    <rect x="380" y="25" width="80" height="30"/><text x="420" y="45">. cyfry</text>
    <rect x="380" y="100" width="100" height="30"/><text x="430" y="120">e / E ± cyfry</text>
  </g>
</svg>

Liczba to opcjonalny minus, cyfry, opcjonalna część ułamkowa po kropce i opcjonalny wykładnik: `2`, `-3`, `12.5`, `1.2e3`. Trzy pułapki: zer wiodących nie ma (`007` to błąd, a kod pocztowy `00950` zapisujemy jako tekst), separator dziesiętny to zawsze kropka (Excel po polsku daje przecinek), a `NaN` i `Infinity` nie istnieją. Na poziomie składni nie ma różnicy między liczbą całkowitą a ułamkiem: `12.50` i `12.5` to ta sama liczba, a `36.0` to po prostu trzydzieści sześć. JSON Schema dokłada do tego rozróżnienie `integer`/`number`, o którym w module 3. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §6; core §4.2.1, §4.2.2 -->

### whitespace

<svg class="diagram-skladni" viewBox="0 0 300 120" role="img" aria-label="Diagram składni białych znaków: dowolna liczba spacji, tabulatorów, znaków nowej linii i powrotu karetki">
  <g class="linie" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M10 40 H60"/>
    <path d="M60 40 H240" marker-end="url(#grot)"/>
    <path d="M60 40 V12 H110" marker-end="url(#grot)"/>
    <path d="M190 12 H240 V40"/>
    <path d="M240 40 H290" marker-end="url(#grot)"/>
    <path d="M230 12 V-5 H70 V12"/>
  </g>
  <g class="terminal" font-family="ui-monospace, monospace" font-size="13" text-anchor="middle">
    <rect x="110" y="-3" width="80" height="30"/><text x="150" y="17">␠ ⇥ ␊ ␍</text>
  </g>
</svg>

Białe znaki wolno wstawiać między elementami w dowolnej ilości, ale tylko cztery: spację, tabulator, nową linię i powrót karetki. Twarda spacja z Worda wygląda jak spacja, a nie jest białym znakiem. Komentarzy w JSON-ie nie ma w ogóle. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §2 -->

**Przejdzie czy nie?** Trzy dokumenty do oceny jako JSON (poprawny czy nie): `{"ilosc": 02}`, `{'ilosc': 2}`, `{"uwagi": null}`. Odpowiedzcie na czacie, potem otwórzcie piaskownicę i wklejcie każdy z nich: parser powie, co jest nie tak. (Odpowiedź: tylko trzeci jest poprawny.)

## Typowe błędy

Dziesięć błędów według częstości występowania. Każdy ma w trenerze polski komunikat z numerem linii, więc nie trzeba ich zapamiętywać, wystarczy je rozpoznawać.

1. **Zbędny przecinek** po ostatnim elemencie: `[1, 2, ]`. Nawyk z JavaScriptu i Pythona, gdzie to wolno.
2. **Apostrofy** zamiast cudzysłowów: `{'ilosc': 2}`. Nawyk z Pythona.
3. **Cudzysłowy drukarskie** `„ilosc”` albo `“ilosc”`. Pojawiają się po wklejeniu z Worda, maila albo Teams, które „poprawiają” cudzysłowy.
4. **Przecinek dziesiętny** `12,50`. Z Excela i z polskiego nawyku; parser czyta to jako liczbę 12 i coś dalej.
5. **`True`, `False`, `None`** z Pythona albo `undefined` z JavaScriptu.
6. **Niepodwojony ukośnik** w ścieżce `"C:\faktury"`; `\f` to akurat poprawna ucieczka (znak wysuwu strony), więc błąd bywa cichy i dziwny.
7. **Komentarze** `// pilne` albo `/* ... */`. Nawyk z plików konfiguracyjnych VS Code, które dopuszczają komentarze, bo są w dialekcie JSONC („JSON with Comments”), a nie w JSON-ie. Prawdziwy plik JSON od tego pęka. (Źródło: dokumentacja VS Code, „JSON with Comments”, poza repozytorium.)
8. **Twarda spacja** po kopiowaniu z dokumentu. Niewidoczna, a parser się zatrzymuje.
9. **Zduplikowane pole**: dwa razy `"ilosc"`. Składniowo przechodzi, liczy się ostatnie, a reszta świata o tym nie wie.
10. **Brak przecinka** między polami, zwykle po dopisaniu nowego pola na końcu linii.
