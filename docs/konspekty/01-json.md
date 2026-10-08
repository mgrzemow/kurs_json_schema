# Moduł 1: JSON (25 min) — opis sekcji

Status: **zaakceptowany 2026-10-08** (RFC 8259 w spec/; ćwiczenie 1-4 tylko jako pytanie do sali). Budżet: ok. 12 min wykładu, 10 min ćwiczeń, 3 min omówienia. Nagłówki z obowiązkowego zakresu: „Czym jest JSON?”, „JSON a XML”, „Podstawowe struktury danych (object, array, value, string, number, whitespace)”.

Źródła dla twierdzeń o samym JSON-ie: RFC 8259 (The JavaScript Object Notation Data Interchange Format). **Proponuję pobrać RFC 8259 do `spec/tekst/rfc8259.txt`**, żeby weryfikator mógł sprawdzać twierdzenia modułu 1 u źródła; CLAUDE.md mówi o `spec/` jako o specyfikacji JSON Schema, więc to drobne rozszerzenie do zapisania.

## Sekcja 1.1: Czym jest JSON? (3 min)

- JSON to **tekst** w ustalonym formacie, a nie „obiekt” ani „plik Excela”. To samo zamówienie można wysłać w mailu, zapisać w pliku, wstawić do bazy.
- Anegdota (prawdziwa, źródło: Douglas Crockford, wykład „The JSON Saga”, 2009): Crockford twierdzi, że JSON-a nie wynalazł, tylko „odkrył” w JavaScripcie w 2001 r.; pierwsza strona json.org powstała, bo klienci nie chcieli przyjąć formatu bez specyfikacji. Pointa dla kursu: cała gramatyka JSON mieści się na jednej stronie.
- Gdzie uczestnik spotka JSON: odpowiedzi API, pliki konfiguracyjne, eksporty, komunikaty między systemami, logi. Dwa zdania o YAML dla profilu B: YAML to nadzbiór JSON-a i tam komentarze są, w JSON-ie nie.
- Przykład w trenerze: minimalne zamówienie z modułu 0 (`schemat=zamowienie-0`, `dokument=zamowienie-0-ok`).

## Sekcja 1.2: JSON a XML (3 min)

- To samo zamówienie w XML-u obok JSON-a (dwa bloki, bez „Otwórz w edytorze” dla XML-a; blok XML oznaczony jako ```` ```xml ````).
- Różnice, które mają znaczenie przy pisaniu schematów: w XML-u jest rozróżnienie element/atrybut, w JSON-ie tylko pola; XML nie zna typów (wszystko to tekst), JSON odróżnia liczbę `2` od tekstu `"2"`; JSON nie ma komentarzy ani przestrzeni nazw.
- Analogia dla tych, którzy znają XSD: XSD jest dla XML-a tym, czym JSON Schema dla JSON-a. Tabela trzech wierszy: XSD `xs:element` ↔ `properties`, `minOccurs="1"` ↔ `required`, `xs:restriction` z `pattern` ↔ `pattern`. Oznaczone jako opcjonalna dygresja (profil A może nie znać XSD).
- Pułapka z domeny: w XML-u `<ilosc>2</ilosc>` to tekst, a w JSON-ie `"ilosc": "2"` to też tekst, choć wygląda jak liczba. Stąd 40 odrzuconych zamówień z modułu 0.

## Sekcja 1.3: Podstawowe struktury danych (object, array, value, string, number, whitespace) (5 min)

Każda struktura ma własny podrozdział z diagramem składni rysowanym w SVG na wzór json.org (własna implementacja, nie obrazek) i jednym przykładem z zamówienia. Twierdzenia ze źródłem RFC 8259.

- **object**: nawiasy klamrowe, pary `"nazwa": wartość` po przecinku; nazwa zawsze w podwójnym cudzysłowie; kolejność pól nie ma znaczenia; nazwy powinny być unikalne, ale RFC tylko to zaleca (SHOULD), więc duplikat przechodzi przez wiele parserów po cichu, a liczy się ostatni. Przykład: `klient` jako obiekt z `nazwa` i `email`. <!-- RFC 8259 §4 -->
- **array**: nawiasy kwadratowe, elementy po przecinku, kolejność ma znaczenie, typy mogą być mieszane (ale w praktyce nie powinny). Przykład: `pozycje`. <!-- RFC 8259 §5 -->
- **value**: siedem możliwości: obiekt, tablica, tekst, liczba, `true`, `false`, `null`; literały wyłącznie małymi literami. `null` to „wartość: brak”, co jest czym innym niż brak pola (odwołanie do przodu: moduł 4). <!-- RFC 8259 §3 -->
- **string**: podwójne cudzysłowy; ucieczki `\"`, `\\`, `\n`, `\t`, `\uXXXX`; polskie znaki wpisujemy wprost (UTF-8), bez ucieczek; apostrofy nie są cudzysłowem. Przykład: `"klient": "Serwis Rowerowy \"Dętka\""`. <!-- RFC 8259 §7 -->
- **number**: bez zer wiodących (`007` to błąd, kod pocztowy zapisujemy jako tekst), kropka dziesiętna, wykładnik `1e3`, brak `NaN` i `Infinity`, brak różnicy między „liczbą całkowitą” a „ułamkiem” w składni; uwaga o precyzji: `12.50` i `12.5` to ta sama liczba, a bardzo duże liczby i `0.1 + 0.2` to temat na moduł 3. <!-- RFC 8259 §6 -->
- **whitespace**: tylko spacja, tabulator, nowa linia, powrót karetki; twarda spacja z Worda to nie whitespace; komentarzy w JSON-ie nie ma. <!-- RFC 8259 §2 -->

Pytanie do sali po tej sekcji („poprawny JSON czy nie?”), trzy krótkie dokumenty: `{"ilosc": 02}`, `{'ilosc': 2}`, `{"uwagi": null}`. Odpowiedzi odsłaniane w trenerze przez piaskownicę (parser pokazuje polski komunikat).

## Sekcja 1.4: Typowe błędy (3 min)

Lista dziesięciu błędów, każdy z jednym zdaniem skąd się bierze i jak go rozpoznać w trenerze (parser pokazuje polski komunikat i linię). Kolejność według częstości z praktyki:
1. zbędny przecinek po ostatnim elemencie (z JavaScriptu i Pythona, gdzie wolno);
2. apostrofy zamiast cudzysłowów (z Pythona);
3. cudzysłowy drukarskie „ ” (z Worda, maila, Teams);
4. przecinek dziesiętny `12,50` (z Excela);
5. `True`, `None` (z Pythona), `undefined` (z JavaScriptu);
6. niepodwojony odwrotny ukośnik w ścieżce `C:\faktury`;
7. komentarze `//` (z plików konfiguracyjnych VS Code, które są JSON-em „z komentarzami”, czyli nie JSON-em);
8. twarda spacja po kopiowaniu;
9. zduplikowane pole;
10. brak przecinka między polami.

Dygresja (prawdziwa, źródło: dokumentacja VS Code „JSON with Comments”): pliki `settings.json` w VS Code dopuszczają komentarze, bo to osobny dialekt JSONC. Stąd nawyk, który psuje prawdziwe pliki JSON.

## Ćwiczenia (rodzaj 2: napraw dokument JSON, chyba że zaznaczono inaczej)

Kolejność według ważności. Każde ćwiczenie ma `schemat.json`, który naprawiony dokument musi spełnić (prosty schemat zamówienia), żeby po naprawie składni uczestnik zobaczył zielony werdykt.

1. **1-1 ★ (4 min) Zamówienie wklejone z maila.** Trzy błędy: `True`, `12,50`, zbędny przecinek. To obecne ćwiczenie próbne 3-2, przeniesione tu. Źródło: RFC 8259 §3, §6.
2. **1-2 ★★ (5 min) Zamówienie przepisane z Worda.** Cztery błędy: cudzysłowy drukarskie w nazwie pola, twarda spacja, komentarz `// pilne` po polu, apostrofy w jednej wartości. Podpowiedź: „Każdy z tych błędów wygląda jak poprawny znak. Patrz na komunikat i numer linii”.
3. **1-3 ★★★ (6 min) Eksport z systemu, który „prawie” działa.** Pułapki: `"kodPocztowy": 00950` (liczba z zerem wiodącym: naprawa to nie usunięcie zera, tylko cudzysłów, bo kod pocztowy to tekst), `"sciezkaFaktury": "C:\faktury\ZAM-123.pdf"` (podwoić `\`), zduplikowane pole `ilosc` (parser przepuszcza z ostrzeżeniem, a schemat ma `ilosc` z `maximum`, więc liczy się ostatnie wystąpienie i werdykt zaskakuje). Błędne rozwiązanie: usunięcie zera z kodu pocztowego (schemat wymaga tekstu, więc oblewa).
4. ~~1-4~~ Decyzja: „poprawny JSON czy nie?” zostaje wyłącznie jako pytanie do sali w sekcji 1.3 (sześć dokumentów: `{"a": 1,}`, `{"a": "1"}`, `[1, "2", null]`, `{"a": 'x'}`, `{"a": 1 // uwaga}`, `{"ą": "ę"}`), bez rozszerzania trenera.

## Uwagi

- RFC 8259 jest w `spec/tekst/rfc8259.txt`; twierdzenia o składni JSON cytują jego sekcje.
- Dla profilu B sekcje 1.1–1.3 są powtórką; planuję je zwięźle, a ćwiczenie 1-3 jest dla niego pułapką (zero wiodące i duplikat zaskakują też programistów).
