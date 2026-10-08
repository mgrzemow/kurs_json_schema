# Moduł 6: Łączenie warunków (30 min) — opis sekcji

Status: propozycja do akceptacji. Budżet: 13 min wykładu, 13 min ćwiczeń, 4 min omówienia. Przy braku czasu zostaje tylko sekcja 6.3 (`if`/`then`) z ćwiczeniem 6-1. Obiekt wiodący: zamówienie z fakturą, płatnością, kontaktem, kodem rabatowym i krajem dostawy.

## Sekcja 6.1: Reguły między polami (1 min)

- Dotąd każda reguła patrzyła na jedno pole. Biznes mówi inaczej: „jeśli faktura, to NIP”, „płatność kartą wymaga tokenu”, „e-mail albo telefon, co najmniej jeden”, „kraj inny niż Polska wymaga numeru EORI”. Do tego służą słowa, które łączą schematy: logiczne (`allOf`, `anyOf`, `oneOf`, `not`), warunkowe (`if`/`then`/`else`) i zależności między polami (`dependentRequired`). <!-- core §10.2 -->

## Sekcja 6.2: `allOf`, `anyOf`, `oneOf`, `not` (5 min)

- **`allOf`**: wartość musi spełniać wszystkie podschematy. Adres dostawy to zwykły adres plus pole `instrukcjeDlaKuriera`. <!-- core §10.2.1.1 -->
- **Pułapka z listy obowiązkowej**: `additionalProperties: false` w gałęzi `allOf` odrzuca wszystko, bo każda gałąź widzi tylko swoje `properties`, a pola z drugiej gałęzi są dla niej „dodatkowe”. Para: ten sam dokument z `additionalProperties: false` w gałęzi (odrzucony) i z `unevaluatedProperties: false` na poziomie `allOf` (przechodzi, a literówka nadal odrzucona). Jeden akapit o `unevaluatedProperties`: widzi pola opisane we wszystkich gałęziach, `if`/`then` i `$ref`. <!-- core §10.3.2.3, §11.3; spec/tests/draft2020-12/unevaluatedProperties.json -->
- **`anyOf`**: co najmniej jeden podschemat. Kontakt: `anyOf` z `required: ["email"]` i `required: ["telefon"]`. <!-- core §10.2.1.2 -->
- **`oneOf`**: dokładnie jeden. Płatność: przelew (numer konta), karta (token), za pobraniem (kwota). **Pułapka z listy obowiązkowej**: gdy dokument pasuje do dwóch opcji naraz, `oneOf` go odrzuca. Para `anyOf` kontra `oneOf` na dokumencie, który ma i numer konta, i token. Lekarstwo: pole rozróżniające (`typ` z `const` w każdej gałęzi) albo zamknięte gałęzie. <!-- core §10.2.1.3 -->
- Komunikaty walidatora przy `anyOf`/`oneOf` są mało pomocne („nie pasuje do żadnej opcji”); pole rozróżniające pomaga ludziom i narzędziom.
- **`not`**: wartość nie może spełniać podschematu. Zamówienie do magazynu nie może mieć statusu `anulowane`: `not: {"enum": ["anulowane"]}`; alternatywa to `enum` bez tego statusu, ale `not` nie wymaga wypisywania wszystkich dozwolonych. <!-- core §10.2.1.4 -->
- Pytanie do sali: `oneOf` z dwiema gałęziami `{"type": "string"}` i `{"minLength": 1}` i dokument `"a"` → odrzucony.

## Sekcja 6.3: `if`/`then`/`else` (4 min)

- `if` to schemat-warunek; gdy spełniony, stosuje się `then`, inaczej `else`. Samo `if` bez `then` i `else` niczego nie sprawdza. Faktura: `if` `faktura` równe `true`, `then` wymagany `nip`. <!-- core §10.2.2.1–10.2.2.3 -->
- **Pułapka**: `if` z samym `properties` jest spełnione także wtedy, gdy pola nie ma (bo `properties` nie wymaga obecności). Zamówienie bez pola `faktura` trafia wtedy do `then` i wymaga NIP-u. Lekarstwo: `required: ["faktura"]` wewnątrz `if`. Para: `if` bez `required` i z `required` na dokumencie bez `faktura`. <!-- core §10.2.2.1; spec/tests/draft2020-12/if-then-else.json -->
- `else` do zakazów: kraj inny niż PL wymaga `eori`, dla PL `eori` jest zabronione: `else: {"not": {"required": ["eori"]}}`.
- Pytanie do sali: `if` bez `required`, dokument bez `faktura` i bez `nip` → odrzucony.

## Sekcja 6.4: `dependentRequired` (2 min)

- Prostszy zapis zależności „jeśli jest pole A, muszą być pola B i C”: `dependentRequired: {"kodRabatowy": ["zrodloRabatu"], "nip": ["nazwaFirmy"]}`. To skrót, który dałoby się zapisać przez `if`/`then`, ale czytelniejszy. Jedno zdanie o `dependentSchemas` (zamiast listy pól cały schemat). <!-- validation §6.5.4; core §10.2.2.4 -->
- Ramka „W draft-07”: oba były jednym słowem `dependencies` (lista pól albo schemat w zależności od wartości). W 2020-12 rozdzielone na `dependentRequired` i `dependentSchemas`.

## Ćwiczenia (kolejność według ważności; łącznie ok. 45 min)

1. **6-1 ★★ (6 min, rodzaj 1) Faktura wymaga NIP.** Start: `if` z samym `properties` (bez `required`), przez co zamówienie bez pola `faktura` wymaga NIP-u. Przykłady: faktura `true` z NIP ok, faktura `true` bez NIP nie, faktura `false` bez NIP ok, bez pola `faktura` i bez NIP ok, NIP bez faktury ok. Błędne: start. Źródło: core §10.2.2.1.
2. **6-2 ★★★ (7 min, rodzaj 1) Sposób płatności.** Trzy sposoby: przelew (`numerKonta`), karta (`token`), za pobraniem (`kwotaPobrania`); dokładnie jeden. Start: `anyOf` trzech gałęzi z `required`, bez pola rozróżniającego, więc dokument z numerem konta i tokenem przechodzi. Rozwiązanie: `oneOf` z `typ` jako `const` w każdej gałęzi i `required` na `typ`. Przykłady: każdy z trzech poprawnych ok, numer konta i token naraz nie, `typ: karta` z numerem konta zamiast tokenu nie, bez `typ` nie. Błędne: start; `oneOf` bez `typ` (dokument z tokenem i numerem konta odrzucony, ale dokument `typ: karta` z tokenem i dodatkowym numerem konta też odrzucony, choć gałąź karty go dopuszcza, co pokazuje, że `oneOf` bez rozróżnienia jest kruche). Źródło: core §10.2.1.3.
3. **6-3 ★★ (5 min, rodzaj 3) `anyOf` kontra `oneOf`.** Schemat z `oneOf` dwóch gałęzi (`required: ["email"]`, `required: ["telefon"]`); dokumenty: tylko e-mail ok, tylko telefon ok, oba nie, żaden nie. Wyjaśnienia: „dokładnie jeden”, a oba pasują do dwóch gałęzi; dla „co najmniej jeden” jest `anyOf`. Źródło: core §10.2.1.2, §10.2.1.3.
4. **6-4 ★★★ (6 min, rodzaj 1) Adres dostawy z instrukcjami dla kuriera.** Adres dostawy = zwykły adres (ulica, miasto, kod) + opcjonalne `instrukcjeDlaKuriera`; żadnych innych pól. Start: `allOf` dwóch gałęzi (adres, instrukcje) z `additionalProperties: false` w gałęzi instrukcji, więc każdy adres jest odrzucany. Rozwiązanie: `unevaluatedProperties: false` na poziomie `allOf` (albo scalenie w jeden obiekt, też zaliczane). Przykłady: adres z instrukcjami ok, bez instrukcji ok, z literówką `instrukcje` nie, z `kraj` nie. Błędne: usunięcie `additionalProperties` (literówka przechodzi). Źródło: core §10.2.1.1, §10.3.2.3, §11.3.
5. **6-5 ★ (4 min, rodzaj 1) Kontakt do klienta.** E-mail albo telefon, co najmniej jeden. Start: oba w `required`. Przykłady: tylko e-mail ok, tylko telefon ok, oba ok, żaden nie. Błędne: `oneOf` (oba naraz odrzucone). Źródło: core §10.2.1.2.
6. **6-6 ★ (3 min, rodzaj 1) Kod rabatowy wymaga źródła.** Jeśli jest `kodRabatowy`, musi być `zrodloRabatu`; bez kodu źródło nie jest potrzebne. Start: bez zależności. Przykłady: kod ze źródłem ok, kod bez źródła nie, bez kodu ok, samo źródło ok. Błędne: oba w `required`. Źródło: validation §6.5.4.
7. **6-7 ★★ (4 min, rodzaj 1) Status bez „anulowane”.** Lista statusów może się zmieniać, więc nie wypisuj dozwolonych, tylko wyklucz `anulowane`. Rozwiązanie: `not` z `enum`/`const`; `enum` bez `anulowane` też przechodzi przykłady (omówienie w rozwiązaniu: oba działają, różnią się odpornością na nowe statusy). Źródło: core §10.2.1.4.
8. **6-8 ★★★ (6 min, rodzaj 1) Dostawa za granicę.** Kraj inny niż `PL` wymaga `eori`; dla `PL` `eori` jest zabronione. Start: `if`/`then` bez `else`. Przykłady: DE z EORI ok, DE bez EORI nie, PL bez EORI ok, PL z EORI nie, bez pola `kraj` traktowane jak PL (decyzja w poleceniu). Błędne: `else` z `required` zamiast `not`/`required`. Źródło: core §10.2.2.1–10.2.2.3.

Tabela „temat × ćwiczenia”: `allOf` (6-4), `anyOf` (6-3, 6-5), `oneOf` (6-2, 6-3), `not` (6-7, 6-8), `if`/`then`/`else` (6-1, 6-8), `dependentRequired` (6-6), `unevaluatedProperties` (6-4). `allOf` i `dependentRequired` mają po jednym ćwiczeniu; `allOf` wraca w module 7 (`$ref` z regułami obok działa jak `allOf`), `dependentRequired` w ćwiczeniu końcowym modułu 8.

## Uwagi do decyzji

- `unevaluatedProperties` dostaje akapit i ćwiczenie 6-4, zgodnie z decyzją o pułapce `allOf`; nie wchodzę w `unevaluatedItems`.
- `dependentSchemas` tylko jednym zdaniem.
