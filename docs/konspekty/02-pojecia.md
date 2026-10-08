# Moduł 2: Pojęcia (15 min) — opis sekcji

Status: **zaakceptowany 2026-10-08** (bez liczb z pomiarów; akapit o tym, dlaczego nowsza wersja). Budżet: 11 min wykładu, 4 min na dwa krótkie ćwiczenia (albo tylko wykład, gdy brak czasu). Nagłówki z obowiązkowego zakresu: „Dokument JSON”, „Instancje”, „Dokument JSON Schema”, „Metaschematy”. To jedyne miejsce w kursie, gdzie mówimy o innych wersjach niż 2020-12.

## Sekcja 2.1: Dokument JSON, instancje, dokument JSON Schema (5 min)

- Trzy słowa na jednym przykładzie zamówienia: **dokument JSON** to dowolny tekst w formacie JSON; **instancja** to dokument JSON w roli sprawdzanego (to samo zamówienie staje się instancją, gdy przykładamy do niego schemat); **dokument JSON Schema** to też JSON, tylko z ustalonymi słowami kluczowymi. <!-- core §4.1, §4.2, §4.3 -->
- Konsekwencja, która zaskakuje: schemat to JSON, więc schemat da się sprawdzić schematem (to prowadzi do metaschematu w 2.2).
- **Słowo kluczowe** (keyword): nazwa pola w schemacie, która coś znaczy dla walidatora, np. `type`, `required`. Dwa rodzaje: **asercja** (daje werdykt: `type`, `minimum`) i **adnotacja** (opisuje: `title`, `description`; o `format` w module 5). <!-- core §7.6, §7.7 -->
- Pułapka 1: **nieznane słowa są po cichu ignorowane**, bo specyfikacja każe je traktować jak adnotacje. `{"typ": "string"}` przepuszcza wszystko, a walidator nie powie ani słowa. Trener powie (ostrzeżenie z podpowiedzią „czy chodziło o `type`?”), ale walidator w systemie magazynu nie. Zapowiedź: w przyszłej stabilnej wersji ma się to zmienić (źródło poza `spec/`: wpis „The last breaking change”, json-schema.org, 2023). <!-- core §4.3.1 -->
- Pułapka 2: **pusty schemat `{}` przepuszcza wszystko**, bo nie ma w nim żadnej asercji. Schemat może być też samym `true` (to samo, co `{}`) albo `false` (odrzuca wszystko). Pokazane parą: `{}` i `false` na tym samym zamówieniu. <!-- core §4.3.2 -->
- Pytanie do sali: „Przejdzie czy nie?” dla schematu `{"reqired": ["numer"]}` i zamówienia bez numeru. Odsłonięcie: przechodzi.

## Sekcja 2.2: Metaschematy i `$schema` (4 min, opisowo)

- **Metaschemat** to schemat, który opisuje, jak wygląda poprawny schemat: że `type` przyjmuje jedną z siedmiu nazw, że `required` to lista tekstów. Pokazany fragment oficjalnego metaschematu 2020-12 (z `spec/metaschematy/meta/validation.json`, definicja `type`), tylko do przeczytania, bez „Otwórz w edytorze”. <!-- core §4.3.4, §8.1 -->
- `$schema` w schemacie wskazuje metaschemat, czyli wersję (dialekt) JSON Schema, w której schemat jest napisany. Walidator po tym poznaje, jakimi regułami się kierować. Bez `$schema` walidator przyjmuje swoją domyślną wersję, co bywa źródłem cichych różnic. Zalecenie: zawsze wpisuj `$schema`. <!-- core §8.1.1 -->
- Co robi trener: sprawdza zawsze według 2020-12; gdy `$schema` wskazuje inną wersję, mówi o tym w diagnozie. To ograniczenie narzędzia, nie reguła specyfikacji.
- Słowa „słownik” (vocabulary) i „dialekt” tylko hasłowo, bo pojawiają się w nagłówkach metaschematu: metaschemat 2020-12 składa się z kilku słowników (core, applicator, validation, meta-data, format-annotation, content, unevaluated). Jedno zdanie, bez ćwiczeń. <!-- core §4.3.3 -->

## Sekcja 2.3: Wersje w pigułce (5 min)

- Tabela: draft-00…03 (prehistoria, 2009–2010), draft-04 (2013, pierwsza szeroko wdrożona), draft-06 (2017), draft-07 (2018, najczęściej spotykana w praktyce), 2019-09 (przejściowa), 2020-12 (aktualna, tej uczymy), stabilna wersja w przygotowaniu (IETF: nie wcześniej niż 2027). Bez liczb z pomiarów (decyzja prowadzącego).
- **Dlaczego na kursie jest nowsza wersja, skoro w praktyce częściej spotyka się draft-07.** Akapit w wykładzie: draft-07 jest wszędzie, bo przez kilka lat nie było niczego nowszego, a edytory, generatory i OpenAPI 3.0 na nim stanęły. 2020-12 stopniowo go wypiera: OpenAPI 3.1 i nowe biblioteki walidacji wspierają ją w pełni, a następna wersja specyfikacji ma być stabilna, czyli bez zmian łamiących zgodność. Kto uczy się 2020-12, uczy się wersji, która zostanie standardem na długo; kto zna 2020-12, przeczyta draft-07 bez trudu, bo różnice to kilka słów kluczowych (stąd ramki „W draft-07” w całym kursie). W drugą stronę jest trudniej: kto zna tylko draft-07, nie wie, czego mu brakuje. (Źródła poza `spec/`: json-schema.org/specification-links; wpis „The last breaking change”, json-schema.org 2023; datatracker.ietf.org/wg/jsonschema.)
- **Jak rozpoznać stary schemat**, cztery sygnały z przykładem każdego: `definitions` zamiast `$defs`; `"exclusiveMinimum": true` obok `minimum`; `id` bez dolara (draft-04); tablica w `items` zamiast `prefixItems`. Plus nagłówek `$schema` z `draft-07` albo `draft-04`.
- Jedno zdanie o OpenAPI: wersja 3.0 używa własnego dialektu bliskiego draft-04, wersja 3.1 to pełne 2020-12; szczegóły w module 9.
- Pytanie do sali: trzy nagłówki `$schema` (draft-04 z `http://`, draft-07 z `#` na końcu, 2020-12), „który jest aktualny i po czym poznać pozostałe?”.
- Ramka „W draft-07”: `$schema` to `http://json-schema.org/draft-07/schema#` (z `http` i `#`), w 2020-12 `https://json-schema.org/draft/2020-12/schema`.

## Ćwiczenia (4 min łącznie; przy braku czasu moduł jest samym wykładem)

1. **2-1 ★ (2 min, rodzaj 3: zgadnij, potem sprawdź) Pusty schemat.** Schemat `{}`; dokumenty: kompletne zamówienie, `{}`, `null`, `[]`, `"cokolwiek"`, `42`. Uczestnik obstawia, wszystko przechodzi. Wyjaśnienia odsyłają do core §4.3.2. Cel: pułapka pustego schematu zostaje w pamięci przez własną pomyłkę.
2. **2-2 ★ (3 min, rodzaj 1) Literówki w słowach kluczowych.** Start: schemat zamówienia z `typ`, `requried`, `propreties`. Wszystkie przykłady do odrzucenia przechodzą, trener pokazuje trzy ostrzeżenia z podpowiedziami. Polecenie: popraw nazwy słów kluczowych, nic więcej. Błędne rozwiązanie: poprawione tylko `required` (nadal przepuszcza zły typ). Źródło: core §4.3.1 (nieznane słowa jako adnotacje).

## Uwagi do decyzji

- Decyzja 2026-10-08: bez liczb z pomiarów; zamiast nich akapit, dlaczego kurs uczy nowszej wersji.
- Fragment metaschematu pokazuję jako ciekawostkę w jednej ramce; nie wchodzę w `$vocabulary` ani `$dynamicRef`.
