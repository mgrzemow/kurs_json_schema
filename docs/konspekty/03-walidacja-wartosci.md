# Moduł 3: Walidacja wartości (40 min) — opis sekcji

Status: propozycja do akceptacji. Rdzeń kursu, nie skracać. Budżet: 18 min wykładu, 18 min ćwiczeń, 4 min omówienia. Nagłówki z obowiązkowego zakresu: „Walidacja instancji dowolnego typu”, „Walidacja instancji tekstowych”, „Wyrażenia regularne”, „Walidacja instancji numerycznych”. Zastępuje obecną treść próbną.

Obiekt wiodący na tym etapie: pojedyncze pola zamówienia (status, numer, kod pocztowy, NIP, EAN, kod katalogowy, nazwa klienta, ilość, cena, rabat). Obiekty i listy dopiero w module 4, więc wszystkie przykłady to pojedyncze wartości albo płaski obiekt z jednym polem.

## Sekcja 3.1: Walidacja instancji dowolnego typu (5 min)

- **`type`**: siedem nazw (`string`, `number`, `integer`, `boolean`, `object`, `array`, `null`). `integer` to liczba bez części ułamkowej, więc `36.0` przechodzi jako `integer` (zaskakuje programistów; pokazane jako pytanie do sali). Lista typów `["string", "null"]` zapowiedziana jednym zdaniem, omówiona w module 4 (pole dopuszczające `null`). <!-- validation §6.1.1; spec/tests/draft2020-12/type.json: „a float with zero fractional part is an integer” -->
- **`enum`**: status zamówienia (`nowe`, `oplacone`, `wyslane`, `dostarczone`, `anulowane`); porównanie dokładne, więc `Wyslane` i `wysłane` nie przechodzą; wartości mogą być różnych typów, ale to zły pomysł. <!-- validation §6.1.2 -->
- **`const`**: `typDokumentu: "zamowienie"`, bo magazyn odbiera tym kanałem też zwroty; `const` to `enum` z jedną wartością. <!-- validation §6.1.3 -->
- Para niuansu: `{"type": "number"}` kontra `{"type": "integer"}` na `36.5`.
- Pytanie do sali: `{"type": "integer"}` i dokument `36.0` → przechodzi.

## Sekcja 3.2: Walidacja instancji tekstowych (3 min)

- **`minLength`**, **`maxLength`**: liczą znaki (punkty kodowe), nie bajty, więc `Pedał` to 5 znaków. Pusty tekst `""` jest tekstem: `type: string` go przepuszcza, dopiero `minLength: 1` odrzuca. Zapowiedź: pusty tekst, `null` i brak pola to trzy różne rzeczy (moduł 4). <!-- validation §6.3.1, §6.3.2 -->
- Przykład: nazwa klienta od 1 do 80 znaków.

## Sekcja 3.3: Wyrażenia regularne (6 min, mini-lekcja)

- **`pattern`** przyjmuje wyrażenie w dialekcie ECMA-262 (JavaScript). Wzorzec **nie jest zakotwiczony**: specyfikacja wprost zakazuje walidatorom domyślnego kotwiczenia, więc `es` pasuje do `expression`. Para niuansu: kod pocztowy z `^…$` i bez, dokument `kod: 00-950, pilne`. <!-- validation §6.3.3; core §6.4 -->
- Klocki, każdy z przykładem z domeny:
  - znak dosłowny i klasa: `[0-9]` cyfra, `[A-Z]` wielka litera; `\d` jako skrót z uwagą o przenośności niżej;
  - powtórzenia: `{2}` dokładnie dwa, `{1,3}` od jednego do trzech, `+` co najmniej jeden, `*` zero lub więcej, `?` opcjonalny;
  - kotwice `^` i `$`;
  - alternatywa `|` i grupa `( )`: waluta `^(PLN|EUR|CZK)$`, bez grupy `^PLN|EUR|CZK$` znaczy coś innego (pokazane parą);
  - kropka `.` to „dowolny znak”, a dosłowna kropka wymaga `\.`: kod katalogowy `SZP.36`;
  - **ucieczka w JSON-ie**: w pliku `\.` zapisujemy jako `"\\."`, a `\d` jako `"\\d"`, bo JSON zjada jeden ukośnik. Trener pokazuje błąd składni przy niepodwojonym.
- Przenośność: specyfikacja zaleca ograniczyć się do małego podzbioru składni (klasy, powtórzenia, kotwice, grupy, alternatywa), bo walidatory w różnych językach różnie wspierają resztę. Przykład: `\d` w Pythonie pasuje też do cyfr arabsko-indyjskich, w JavaScripcie tylko do `0-9`; `[0-9]` działa wszędzie tak samo. (Źródło: core §6.4 dla podzbioru; dla zachowania Pythona dokumentacja modułu `re`, poza `spec/`.)
- Wzorce z domeny do ściągawki: kod pocztowy `^[0-9]{2}-[0-9]{3}$`, numer zamówienia `^ZAM-[0-9]{4}-[0-9]{6}$`, NIP `^[0-9]{10}$`, EAN-13 `^[0-9]{13}$`, kod katalogowy `^[A-Z]{3}\.[0-9]{2}$`.
- Pytanie do sali (dwa): wzorzec `[0-9]{2}-[0-9]{3}` i dokument `00-9500` → przechodzi; wzorzec `^PLN|EUR$` i dokument `EURO` → przechodzi.
- Dygresja o kotwicach (prawdziwa, źródło do podania w tekście: core §6.4 i historia dyskusji w json-schema-org/json-schema-spec): zapis „MUST NOT take regular expressions to be anchored” trafił do specyfikacji, bo część walidatorów kotwiczyła wzorce, a część nie, i ten sam schemat dawał różne werdykty. Jeśli nie znajdę wiarygodnego źródła dyskusji, zostaje samo zdanie ze specyfikacji.

## Sekcja 3.4: Walidacja instancji numerycznych (4 min)

- **`minimum`**, **`maximum`** z granicami włącznie; **`exclusiveMinimum`**, **`exclusiveMaximum`** bez granic. Ilość: `exclusiveMinimum: 0`, `maximum: 1000`. Rabat procentowy: `minimum: 0`, `maximum: 100`. Przykłady na granicach (dokładnie 0, dokładnie 100). <!-- validation §6.2.2–6.2.5 -->
- **`multipleOf`**: szprychy po 36 sztuk (`multipleOf: 36`), wynik dzielenia musi być całkowity. <!-- validation §6.2.1 -->
- Pułapka zmiennoprzecinkowa: `multipleOf: 0.01` dla ceny wygląda rozsądnie, ale w arytmetyce zmiennoprzecinkowej część wartości daje wynik dzielenia „prawie całkowity”. Konkretny przykład dobiorę przy generowaniu i sprawdzę walidatorem (test treści to wymusi); jeśli Ajv nie da się „oszukać” żadną rozsądną ceną, pułapka zostaje jako ostrzeżenie w tekście z odwołaniem do validation §4.2 (interoperacyjność liczb), bez pytania do sali.
- Słowa dla liczb nie dotyczą tekstów: `"36"` z `multipleOf: 36` przechodzi, bo reguła patrzy tylko na liczby; stąd `type` jest zawsze potrzebny. <!-- validation §6.2 (tytuł: numeric instances); spec/tests/draft2020-12/multipleOf.json -->
- Ramka „W draft-07”: `exclusiveMinimum` było wartością logiczną obok `minimum`. Propozycja brzmienia: „W 2020-12 `"exclusiveMinimum": true` nie jest już poprawnym schematem: specyfikacja wymaga liczby. Część walidatorów odrzuci taki schemat (trener tak robi), inne po cichu zignorują słowo, więc granica przestanie być wyłączona.” <!-- validation §6.2.5 -->

## Ćwiczenia (kolejność według ważności; łącznie ok. 40 min, czyli więcej, niż się zmieści)

1. **3-1 ★ (4 min, rodzaj 1) Status zamówienia.** Start: `{"type": "string"}`. Dopisz `enum` z pięcioma statusami. Przykłady: `wyslane` ok, `Wyslane` nie, `w drodze` nie, `null` nie, `""` nie. Błędne: `pattern` z alternatywą bez kotwic (`nowe|oplacone|…`, przepuszcza `nienowe`). Źródło: §6.1.2.
2. **3-2 ★★ (6 min, rodzaj 1) Kod pocztowy i numer zamówienia.** Start: oba wzorce bez kotwic. Przykłady z dopiskiem przed i cyfrą za dużo. Błędne: bez kotwic; tylko `^`. Źródło: §6.3.3, core §6.4. (Obecne próbne 3-1 rozszerzone o numer.)
3. **3-3 ★★★ (7 min, rodzaj 1) Ilość i cena.** Ilość: liczba całkowita, większa od zera, najwyżej 1000. Cena: liczba większa od zera z najwyżej dwoma miejscami po przecinku. Start: `ilosc` jako `number` z `minimum: 0`, `cena` jako `number`. Przykłady na granicach: `0` nie, `1` ok, `1000` ok, `1001` nie, `2.5` nie, `12.5` ok, `12.345` nie, `0` dla ceny nie, `"12"` nie. Błędne: `minimum: 1` zamiast `exclusiveMinimum: 0` dla ilości (to akurat poprawne dla liczb całkowitych, więc **nie** jest błędne: pokazuję to w wyjaśnieniu jako dwie równoważne drogi); prawdziwe błędne: `type: number` dla ilości (przepuszcza `2.5`), `minimum: 0` (przepuszcza `0`). Pułapka `multipleOf: 0.01` do zweryfikowania walidatorem przy generowaniu. Źródło: §6.1.1, §6.2.
4. **3-4 ★★ (5 min, rodzaj 3) Szprychy w opakowaniach zbiorczych.** Obecne próbne 3-3 bez zmian (36, 72, 0, 50, 360, 396, 37.5, `"36"`). Źródło: §6.2.1, §6.2.2, §6.2.4.
5. **3-5 ★ (4 min, rodzaj 1) Nazwa klienta.** Od 1 do 80 znaków. Przykłady: `""` nie, jedna litera ok, dokładnie 80 ok, 81 nie, nazwa z polskimi znakami licząca 80 znaków ok (sprawdza liczenie znaków, nie bajtów). Źródło: §6.3.1, §6.3.2.
6. **3-6 ★★ (5 min, rodzaj 3) Waluta bez kotwic.** Schemat `{"type": "string", "pattern": "PLN|EUR|CZK"}`; dokumenty: `PLN` ok, `EURO` przechodzi, `pln` nie, `XPLN` przechodzi, `EUR ` (ze spacją) przechodzi, `USD` nie. Wyjaśnienia o kotwicach i grupie. Źródło: core §6.4.
7. **3-7 ★★ (5 min, rodzaj 1) Kod katalogowy z kropką.** `SZP.36`: trzy wielkie litery, kropka, dwie cyfry. Start: `^[A-Z]{3}.[0-9]{2}$` (kropka jako „dowolny znak”, więc `SZPX36` przechodzi). Rozwiązanie z `\\.`. Błędne: `\.` z pojedynczym ukośnikiem jako osobny plik jest niemożliwe (niepoprawny JSON), więc tę pułapkę pokazuje trener na żywo w polu edytora; w danych błędne: start. Źródło: §6.3.3, RFC 8259 §7 (ucieczki).
8. **3-8 ★★★ (6 min, rodzaj 1) NIP z myślnikami albo bez.** Dozwolone `1234567890` i `123-456-78-90`, nic innego. Rozwiązanie: `^[0-9]{3}-?[0-9]{3}-?[0-9]{2}-?[0-9]{2}$` albo alternatywa dwóch pełnych wzorców. Przykłady: oba poprawne ok, `123-45-67-890` nie, `12345678901` nie, `----------` nie, `123 456 78 90` nie. Błędne: `^[0-9-]{10,13}$` (przepuszcza same myślniki i zły układ). Źródło: core §6.4.
9. **3-9 ★ (3 min, rodzaj 1) Typ dokumentu.** `typDokumentu` musi być dokładnie `zamowienie`. Start: `{"type": "string"}`. Rozwiązanie z `const`; `enum` z jedną wartością też zaliczane (test przez przykłady, nie przez porównanie schematu). Źródło: §6.1.3.

Tabela „temat × ćwiczenia”: `type` (3-3, 3-4, 3-9), `enum`/`const` (3-1, 3-9), długość (3-5), `pattern` (3-2, 3-6, 3-7, 3-8), liczby (3-3, 3-4). Każdy temat sekcji ma co najmniej dwa ćwiczenia; `const` jedno, bo temat poboczny.

## Uwagi do decyzji

- Pułapka `multipleOf: 0.01` jest w programie (decyzja z 2026-10-08), ale konkretny przykład zależy od zachowania Ajv; zaproponuję go z dowodem (werdykt walidatora) przy generowaniu.
- Ramka „W draft-07” o `exclusiveMinimum`: proponowane brzmienie wyżej rozwiązuje rozbieżność z recenzji (tekst mówił „ignorowany”, trener odrzuca).
- Dziewięć ćwiczeń to ok. 45 min; na kursie zmieści się 4–5. Kolejność ustawia najważniejsze na początku.
