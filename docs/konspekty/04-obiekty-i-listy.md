# Moduł 4: Obiekty i listy (45 min) — opis sekcji

Status: propozycja do akceptacji. Rdzeń kursu, nie skracać. Budżet: 20 min wykładu, 20 min ćwiczeń, 5 min omówienia. Od tego modułu obiekt wiodący to już całe zamówienie: numer, klient, adres dostawy, pozycje, uwagi, kod rabatowy, data dostawy, wymiary paczki.

## Sekcja 4.1: Obiekty: `properties` i `required` (6 min)

- `properties` opisuje pola obiektu: nazwa → schemat wartości. Pole spoza `properties` jest dozwolone (o tym w 4.2), a pole z `properties` **nie jest wymagane**. Para niuansu: schemat z samym `properties` i zamówienie bez `klient` → przechodzi; ten sam schemat z `required: ["klient"]` → odrzucony. To pułapka numer jeden u analityków czytających cudze schematy. <!-- core §10.3.2.1; validation §6.5.3 -->
- `required` to lista nazw. Nazwa w `required`, której nie ma w `properties`, jest poprawna (walidator wymaga pola o dowolnej wartości), ale zwykle to literówka; trener ostrzega.
- Częsty błąd początkujących: pola zamówienia wpisane na poziomie schematu zamiast w `properties` (`"miasto": {"type": "string"}` obok `type`). Walidator traktuje `miasto` jako nieznane słowo i ignoruje. Trener podpowiada „przenieś do `properties`”. <!-- core §4.3.1 -->
- Pytanie do sali: schemat z `properties` dla pięciu pól bez `required` i dokument `{}` → przechodzi.

## Sekcja 4.2: Nadmiarowe pola: `additionalProperties` (4 min)

- Domyślnie obiekt może mieć dowolne dodatkowe pola. Skutek: literówka `adrs` zamiast `adres` przechodzi bez słowa, a magazyn nie dostaje adresu. Para niuansu: ten sam dokument z literówką przy `additionalProperties` domyślnym i przy `false`. <!-- core §10.3.2.3 -->
- `additionalProperties` może być też schematem, np. `{"type": "string"}`: dodatkowe pola wolno, ale tylko tekstowe. Jedno zdanie o `patternProperties` (pola o nazwach pasujących do wzorca), bez ćwiczenia. <!-- core §10.3.2.2 -->
- Kiedy zamykać obiekt: komunikat do systemu, który odrzuca nieznane pola (etykieta kurierska), albo gdy literówki są kosztowne. Kiedy nie: dane, które mają rosnąć bez zmiany schematu. Odwołanie do przodu, oznaczone: „`additionalProperties: false` w połączeniu z `allOf` potrafi odrzucić wszystko; wrócimy do tego w module 6”.

## Sekcja 4.3: `null` kontra brak pola kontra pusty tekst (4 min)

- Trzy zamówienia: bez pola `uwagi`, z `"uwagi": null`, z `"uwagi": ""`. To trzy różne sytuacje i trzy różne reguły: o obecności pola decyduje `required`; `null` przepuszcza tylko `type` z `"null"` na liście, np. `["string", "null"]`; pusty tekst odrzuca `minLength: 1`. <!-- validation §6.1.1 (type jako lista), §6.5.3, §6.3.2 -->
- Tabela trzy na trzy: wiersze to trzy dokumenty, kolumny to trzy schematy (`required` + `string`; `required` + `["string","null"]`; `["string","null"]` bez `required` z `minLength: 1`), w komórkach werdykty policzone walidatorem.
- Zasada projektowa dla autorów schematów: najpierw odpowiedz na pytanie biznesowe („czy pole może nie istnieć? czy może być puste? czy brak informacji to `null`?”), potem dobierz słowa.
- Pytanie do sali: `required: ["uwagi"]` z `type: ["string", "null"]` i dokument `{"uwagi": null}` → przechodzi.

## Sekcja 4.4: Listy: `items`, `minItems`/`maxItems`, `uniqueItems`, `contains`, `prefixItems` (6 min)

- `items` to schemat każdego elementu; pozycje zamówienia jako lista obiektów z `ean`, `ilosc`, `cena`. `minItems: 1`, bo zamówienie bez pozycji nie ma sensu; `maxItems` jako limit przesyłki. Pusta lista `[]` jest poprawną listą, więc bez `minItems` przechodzi. <!-- core §10.3.1.2; validation §6.4.1, §6.4.2 -->
- `uniqueItems: true` porównuje całe wartości. Kody rabatowe jako lista tekstów: duplikat odrzucony. Niuans na pozycjach: dwie pozycje z tym samym EAN, ale inną ilością, to różne obiekty, więc `uniqueItems` ich nie wyłapie. <!-- validation §6.4.3; core §4.2.2 (równość) -->
- `contains`: co najmniej jeden element pasuje do schematu. Zamówienie musi mieć co najmniej jedną pozycję typu `produkt`, bo sama usługa montażu nie jest zamówieniem dla magazynu. `minContains` i `maxContains` jednym zdaniem. <!-- core §10.3.1.3; validation §6.4.4, §6.4.5 -->
- `prefixItems` krótko: krotka o ustalonych pozycjach, wymiary paczki `[długość, szerokość, wysokość]` w centymetrach; `items: false` zabrania czwartego elementu; `minItems: 3` wymusza komplet. <!-- core §10.3.1.1 -->
- Ramka „W draft-07”: krotkę zapisywało się tablicą w `items`, a dodatkowe elementy kontrolował `additionalItems`. W 2020-12 tablica w `items` jest niepoprawna; walidator ją odrzuci albo zignoruje (odwołanie do „jak rozpoznać stary schemat” z modułu 2).
- Pytanie do sali: `uniqueItems: true` i lista `[{"ean": "1", "ilosc": 2}, {"ean": "1", "ilosc": 3}]` → przechodzi.

## Ćwiczenia (kolejność według ważności; łącznie ok. 45 min)

1. **4-1 ★ (5 min, rodzaj 1) Wymagane pola zamówienia.** Start: `properties` dla `numer`, `klient`, `pozycje`, `uwagi`, bez `required`. Polecenie: numer, klient i pozycje są obowiązkowe, uwagi nie. Przykłady: kompletne ok, bez uwag ok, bez pozycji nie, `{}` nie. Błędne: `required` z literówką `pozycja` (ostrzeżenie trenera; zamówienie bez pozycji przechodzi). Źródło: validation §6.5.3.
2. **4-2 ★★ (6 min, rodzaj 1) Adres dla kuriera.** Kurier przyjmuje tylko `ulica`, `miasto`, `kodPocztowy` i opcjonalne `uwagi`; każde inne pole odrzuca. Start: `properties` i `required` bez `additionalProperties`. Przykłady: literówka `uwgi` nie, `kraj` nie, bez uwag ok. Błędne: samo `required` (literówka przechodzi). Źródło: core §10.3.2.3.
3. **4-3 ★★★ (7 min, rodzaj 1) Uwagi, data dostawy, kod rabatowy.** Trzy pola, trzy zachowania: `uwagi` zawsze obecne, ale mogą być `null`; `dataDostawy` opcjonalna, a jeśli jest, to niepusty tekst; `kodRabatowy` opcjonalny, niepusty, nigdy `null`. Dziewięć przykładów pokrywających kombinacje, w tym `"uwagi": ""` (ok, bo pusty tekst to tekst) i `"kodRabatowy": null` (nie). Błędne: `uwagi` jako samo `string` (odrzuca `null`); `dataDostawy` w `required`. Źródło: validation §6.1.1, §6.3.2, §6.5.3.
4. **4-4 ★★ (6 min, rodzaj 1) Pozycje zamówienia.** Lista co najmniej jednej i najwyżej 50 pozycji, każda z `ean` (13 cyfr), `ilosc` (całkowita ≥ 1), `cena` (> 0), wszystkie wymagane. Start: `type: array` z `items` bez `required` i bez `minItems`. Przykłady: pusta lista nie, pozycja bez ceny nie, 51 pozycji nie (wygenerowane), pojedynczy obiekt zamiast listy nie. Błędne: `items` kompletne, ale bez `minItems`. Źródło: core §10.3.1.2; validation §6.4.1, §6.4.2.
5. **4-5 ★★ (5 min, rodzaj 3) Powtórzenia na liście.** Schemat pozycji z `uniqueItems: true` i lista kodów rabatowych z `uniqueItems: true`. Dokumenty: dwa identyczne obiekty nie; ten sam EAN z inną ilością ok; kody `["WIOSNA", "WIOSNA"]` nie; `["WIOSNA", "wiosna"]` ok. Wyjaśnienia odsyłają do równości wartości. Źródło: validation §6.4.3; core §4.2.2.
6. **4-6 ★★★ (6 min, rodzaj 1) Co najmniej jeden produkt.** Pozycje mają `typ` (`produkt` albo `usluga`); zamówienie musi mieć co najmniej jedną pozycję typu `produkt`. Start: `items` z `enum` dla `typ`, bez `contains`. Przykłady: same usługi nie, mieszane ok, sam produkt ok. Błędne: `items` z `const: "produkt"` dla `typ` (odrzuca usługi, które są dozwolone). Źródło: core §10.3.1.3.
7. **4-7 ★ (4 min, rodzaj 1) Wymiary paczki.** Dokładnie trzy liczby dodatnie w centymetrach. Start: `type: array` z `items: {type: number}`. Rozwiązanie z `prefixItems`, `items: false`, `minItems: 3` (albo `minItems`/`maxItems` 3 z `items` liczbowym; oba zaliczane przez przykłady). Przykłady: `[30, 20, 10]` ok, `[30, 20]` nie, `[30, 20, 10, 5]` nie, `["30", 20, 10]` nie, `[30, -20, 10]` nie. Źródło: core §10.3.1.1.
8. **4-8 ★★ (5 min, rodzaj 1) Schemat od dostawcy.** Dla profilu A: schemat napisany przez kogoś, kto wpisał pola `miasto` i `kodPocztowy` na poziomie schematu zamiast w `properties`, a w `required` ma `kod_pocztowy`. Trener pokazuje trzy ostrzeżenia. Polecenie: popraw tak, żeby schemat naprawdę sprawdzał to, co autor chciał. Błędne: przeniesione do `properties`, ale `required` nadal z `kod_pocztowy`. Źródło: core §4.3.1, §10.3.2.1.

Tabela „temat × ćwiczenia”: `properties`/`required` (4-1, 4-3, 4-4, 4-8), `additionalProperties` (4-2), `null`/brak/pusty (4-3), `items`/`minItems` (4-4, 4-7), `uniqueItems` (4-5), `contains` (4-6), `prefixItems` (4-7). Tematy z jednym ćwiczeniem (`additionalProperties`, `contains`, `uniqueItems`) wracają w modułach 6 i 8.

## Uwagi do decyzji

- `patternProperties` tylko jednym zdaniem, bez ćwiczenia; nie ma go w programie.
- Ćwiczenie 4-3 jest najtrudniejsze i najważniejsze dydaktycznie (pułapka z listy CLAUDE.md), dlatego stoi na trzecim miejscu, nie na siódmym.
