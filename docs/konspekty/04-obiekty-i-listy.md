# Moduł 4: Obiekty i listy (45 min) — opis sekcji

Status: propozycja do akceptacji (wersja 2: rozwinięte obiekty). Rdzeń kursu, nie skracać. Budżet: 20 min wykładu (obiekty 12, null 3, listy 5), 20 min ćwiczeń, 5 min omówienia. Od tego modułu obiekt wiodący to już całe zamówienie: numer, klient, adres dostawy, pozycje, uwagi, kod rabatowy, data dostawy, wymiary paczki.

## Sekcja 4.1: Obiekt to zbiór nazwanych pól (2 min)

- Model myślowy dla analityka: obiekt to formularz, w którym każde pole ma nazwę i wartość; dla programisty: mapa/słownik nazwa → wartość. Nazwy są tekstami, unikalne, kolejność bez znaczenia. Wartość może być kolejnym obiektem, stąd zagnieżdżenie: zamówienie ma klienta, klient ma adres. <!-- RFC 8259 §4; core §4.2.1 -->
- Rysunek (SVG): drzewo zamówienia: `zamowienie` → `numer`, `klient` (→ `nazwa`, `email`, `adres` (→ `ulica`, `miasto`, `kodPocztowy`)), `pozycje` (lista). Ten rysunek wraca w następnej sekcji jako lustro.

## Sekcja 4.2: Schemat obiektu to lustro dokumentu (4 min)

- Dokument i schemat obok siebie, z kolorami poziomów: każdy poziom zagnieżdżenia dokumentu ma swój poziom w schemacie z własnym `type: object`, własnym `properties` i własnym `required`. `properties` to mapa nazwa pola → **schemat** tej wartości (a nie wartość, nie nazwa typu). <!-- core §10.3.2.1 -->
- Trzy najczęstsze błędy strukturalne, każdy pokazany z komunikatem trenera:
  1. `"numer": "string"` zamiast `"numer": {"type": "string"}` (trener: „zamiast schematu jest samo "string"”);
  2. pola wpisane obok `type` zamiast w `properties` (trener: „przenieś do `properties`”; walidator po cichu ignoruje); <!-- core §4.3.1 -->
  3. `"required": true` wewnątrz pola, nawyk z draft-03 i z niektórych narzędzi; w 2020-12 `required` to lista nazw przy obiekcie, a `true` w polu to błąd schematu, który część walidatorów zignoruje (trener odrzuca z komunikatem). <!-- validation §6.5.3 -->
- Czytanie schematu (dla profilu A, na żywo): trzy pytania do każdego schematu: „które pola są wymagane?” (szukaj `required` na tym poziomie), „co przyjmuje to pole?” (idź do `properties` → nazwa), „czy obce pole przejdzie?” (szukaj `additionalProperties` na tym poziomie). Te trzy pytania wracają w ćwiczeniu 4-8.
- Wizualizacja do zrobienia przy generowaniu: dwa bloki obok siebie (dokument, schemat) z tłem w kolorze poziomu zagnieżdżenia (małe rozszerzenie renderera wykładu).

## Sekcja 4.3: `required` na każdym poziomie (3 min)

- `required` to lista nazw obok `properties`; wymaga obecności pola, nie mówi nic o wartości (wartość sprawdza schemat pola). Para niuansu: samo `properties` przepuszcza zamówienie bez klienta, z `required: ["klient"]` odrzuca. <!-- validation §6.5.3 -->
- `required` działa tylko na swoim poziomie: `required: ["klient"]` na zamówieniu nie wymaga `email` w kliencie; to wymaga `required` wewnątrz schematu klienta. Pokazane na lustrze z sekcji 4.2.
- Nazwa w `required` bez odpowiednika w `properties` jest poprawna, ale zwykle to literówka; trener ostrzega.
- Pusty obiekt `{}` bez `required` przechodzi; `minProperties: 1` odrzuca pusty obiekt, gdy nazwy pól nie są z góry znane. <!-- validation §6.5.2 -->
- Pytanie do sali: `required: ["klient"]` na zamówieniu i dokument `{"klient": {}}` → przechodzi (klient jest, choć pusty).

## Sekcja 4.4: Nadmiarowe pola: `additionalProperties` (3 min)

- Domyślnie obiekt może mieć dowolne dodatkowe pola. Skutek: literówka `adrs` zamiast `adres` przechodzi bez słowa, a magazyn nie dostaje adresu. Para niuansu: ten sam dokument z literówką przy `additionalProperties` domyślnym i przy `false`. <!-- core §10.3.2.3 -->
- `additionalProperties: false` działa tylko na swoim poziomie: zamknięte zamówienie nie zamyka adresu w środku. Jedno zdanie o `patternProperties` (pola o nazwach pasujących do wzorca). <!-- core §10.3.2.2 -->
- Kiedy zamykać obiekt: komunikat do systemu, który odrzuca nieznane pola (etykieta kurierska), albo gdy literówki są kosztowne. Kiedy nie: dane, które mają rosnąć bez zmiany schematu. Odwołanie do przodu, oznaczone: „`additionalProperties: false` w połączeniu z `allOf` potrafi odrzucić wszystko; wrócimy do tego w module 6”.

## Sekcja 4.5: Obiekt jako słownik (2 min)

- Drugi sposób użycia obiektu: klucze nie są znane z góry, bo są danymi. Stan magazynu: `{"5901234123457": 12, "5901234123464": 0}` (EAN → liczba sztuk). W `properties` nie da się tego opisać, bo nie wiadomo, jakie będą klucze.
- Schemat słownika: `additionalProperties` ze schematem wartości (`{"type": "integer", "minimum": 0}`), `propertyNames` ze schematem kluczy (`pattern` na 13 cyfr), `minProperties: 1`, żeby słownik nie był pusty. <!-- core §10.3.2.3, §10.3.2.4; validation §6.5.2 -->
- Kiedy lista obiektów, a kiedy słownik: lista, gdy element ma kilka atrybutów, kolejność ma znaczenie albo klucz może się powtórzyć; słownik, gdy klucz jest unikalny z natury i chcemy szybki dostęp po kluczu. Pozycje zamówienia to lista (EAN może się powtórzyć w dwóch liniach, pozycja ma ilość i cenę); stan magazynu to słownik.
- Ramka „W draft-07”: identycznie, tylko `propertyNames` doszło w draft-06.

## Sekcja 4.6: `null` kontra brak pola kontra pusty tekst (3 min)

- Trzy zamówienia: bez pola `uwagi`, z `"uwagi": null`, z `"uwagi": ""`. To trzy różne sytuacje i trzy różne reguły: o obecności pola decyduje `required`; `null` przepuszcza tylko `type` z `"null"` na liście, np. `["string", "null"]`; pusty tekst odrzuca `minLength: 1`. <!-- validation §6.1.1 (type jako lista), §6.5.3, §6.3.2 -->
- Tabela trzy na trzy: wiersze to trzy dokumenty, kolumny to trzy schematy (`required` + `string`; `required` + `["string","null"]`; `["string","null"]` bez `required` z `minLength: 1`), w komórkach werdykty policzone walidatorem.
- Zasada projektowa dla autorów schematów: najpierw odpowiedz na pytanie biznesowe („czy pole może nie istnieć? czy może być puste? czy brak informacji to `null`?”), potem dobierz słowa.
- Pytanie do sali: `required: ["uwagi"]` z `type: ["string", "null"]` i dokument `{"uwagi": null}` → przechodzi.

## Sekcja 4.7: Listy: `items`, `minItems`/`maxItems`, `uniqueItems`, `contains`, `prefixItems` (5 min)

- `items` to schemat każdego elementu; pozycje zamówienia jako lista obiektów z `ean`, `ilosc`, `cena`. `minItems: 1`, bo zamówienie bez pozycji nie ma sensu; `maxItems` jako limit przesyłki. Pusta lista `[]` jest poprawną listą, więc bez `minItems` przechodzi. <!-- core §10.3.1.2; validation §6.4.1, §6.4.2 -->
- `uniqueItems: true` porównuje całe wartości. Kody rabatowe jako lista tekstów: duplikat odrzucony. Niuans na pozycjach: dwie pozycje z tym samym EAN, ale inną ilością, to różne obiekty, więc `uniqueItems` ich nie wyłapie. <!-- validation §6.4.3; core §4.2.2 (równość) -->
- `contains`: co najmniej jeden element pasuje do schematu. Zamówienie musi mieć co najmniej jedną pozycję typu `produkt`, bo sama usługa montażu nie jest zamówieniem dla magazynu. `minContains` i `maxContains` jednym zdaniem. <!-- core §10.3.1.3; validation §6.4.4, §6.4.5 -->
- `prefixItems` krótko: krotka o ustalonych pozycjach, wymiary paczki `[długość, szerokość, wysokość]` w centymetrach; `items: false` zabrania czwartego elementu; `minItems: 3` wymusza komplet. <!-- core §10.3.1.1 -->
- Ramka „W draft-07”: krotkę zapisywało się tablicą w `items`, a dodatkowe elementy kontrolował `additionalItems`. W 2020-12 tablica w `items` jest niepoprawna; walidator ją odrzuci albo zignoruje (odwołanie do „jak rozpoznać stary schemat” z modułu 2).
- Pytanie do sali: `uniqueItems: true` i lista `[{"ean": "1", "ilosc": 2}, {"ean": "1", "ilosc": 3}]` → przechodzi.

## Ćwiczenia (łącznie ok. 55 min)

Kolejność na kursie: 4-1, 4-9, 4-2, 4-3, 4-8, 4-4, 4-10, 4-5, 4-6, 4-7 (obiekty przed listami, bo to trudniejsza i ważniejsza część). Numery zostają zgodne z sekcjami.

1. **4-1 ★ (5 min, rodzaj 1) Wymagane pola zamówienia.** Start: `properties` dla `numer`, `klient`, `pozycje`, `uwagi`, bez `required`. Polecenie: numer, klient i pozycje są obowiązkowe, uwagi nie. Przykłady: kompletne ok, bez uwag ok, bez pozycji nie, `{}` nie. Błędne: `required` z literówką `pozycja` (ostrzeżenie trenera; zamówienie bez pozycji przechodzi). Źródło: validation §6.5.3.
2. **4-2 ★★ (6 min, rodzaj 1) Adres dla kuriera.** Kurier przyjmuje tylko `ulica`, `miasto`, `kodPocztowy` i opcjonalne `uwagi`; każde inne pole odrzuca. Start: `properties` i `required` bez `additionalProperties`. Przykłady: literówka `uwgi` nie, `kraj` nie, bez uwag ok. Błędne: samo `required` (literówka przechodzi). Źródło: core §10.3.2.3.
3. **4-3 ★★★ (7 min, rodzaj 1) Uwagi, data dostawy, kod rabatowy.** Trzy pola, trzy zachowania: `uwagi` zawsze obecne, ale mogą być `null`; `dataDostawy` opcjonalna, a jeśli jest, to niepusty tekst; `kodRabatowy` opcjonalny, niepusty, nigdy `null`. Dziewięć przykładów pokrywających kombinacje, w tym `"uwagi": ""` (ok, bo pusty tekst to tekst) i `"kodRabatowy": null` (nie). Błędne: `uwagi` jako samo `string` (odrzuca `null`); `dataDostawy` w `required`. Źródło: validation §6.1.1, §6.3.2, §6.5.3.
4. **4-4 ★★ (6 min, rodzaj 1) Pozycje zamówienia.** Lista co najmniej jednej i najwyżej 50 pozycji, każda z `ean` (13 cyfr), `ilosc` (całkowita ≥ 1), `cena` (> 0), wszystkie wymagane. Start: `type: array` z `items` bez `required` i bez `minItems`. Przykłady: pusta lista nie, pozycja bez ceny nie, 51 pozycji nie (wygenerowane), pojedynczy obiekt zamiast listy nie. Błędne: `items` kompletne, ale bez `minItems`. Źródło: core §10.3.1.2; validation §6.4.1, §6.4.2.
5. **4-5 ★★ (5 min, rodzaj 3) Powtórzenia na liście.** Schemat pozycji z `uniqueItems: true` i lista kodów rabatowych z `uniqueItems: true`. Dokumenty: dwa identyczne obiekty nie; ten sam EAN z inną ilością ok; kody `["WIOSNA", "WIOSNA"]` nie; `["WIOSNA", "wiosna"]` ok. Wyjaśnienia odsyłają do równości wartości. Źródło: validation §6.4.3; core §4.2.2.
6. **4-6 ★★★ (6 min, rodzaj 1) Co najmniej jeden produkt.** Pozycje mają `typ` (`produkt` albo `usluga`); zamówienie musi mieć co najmniej jedną pozycję typu `produkt`. Start: `items` z `enum` dla `typ`, bez `contains`. Przykłady: same usługi nie, mieszane ok, sam produkt ok. Błędne: `items` z `const: "produkt"` dla `typ` (odrzuca usługi, które są dozwolone). Źródło: core §10.3.1.3.
7. **4-7 ★ (4 min, rodzaj 1) Wymiary paczki.** Dokładnie trzy liczby dodatnie w centymetrach. Start: `type: array` z `items: {type: number}`. Rozwiązanie z `prefixItems`, `items: false`, `minItems: 3` (albo `minItems`/`maxItems` 3 z `items` liczbowym; oba zaliczane przez przykłady). Przykłady: `[30, 20, 10]` ok, `[30, 20]` nie, `[30, 20, 10, 5]` nie, `["30", 20, 10]` nie, `[30, -20, 10]` nie. Źródło: core §10.3.1.1.
8. **4-8 ★★ (6 min, rodzaj 1) Schemat od dostawcy.** Dla profilu A: schemat z trzema błędami strukturalnymi z sekcji 4.2: pola `miasto` i `kodPocztowy` na poziomie schematu zamiast w `properties`, `"required": true` wewnątrz pola `ulica`, w `required` literówka `kod_pocztowy`. Trener pokazuje błąd schematu i ostrzeżenia. Polecenie: popraw tak, żeby schemat naprawdę sprawdzał to, co autor chciał (trzy pola wymagane). Błędne: przeniesione do `properties`, ale `required` nadal z `kod_pocztowy`. Źródło: core §4.3.1, §10.3.2.1; validation §6.5.3.
9. **4-9 ★★★ (6 min, rodzaj 1) Wymagane na każdym poziomie.** Zamówienie z klientem i adresem w kliencie; wymagane: na górze `numer` i `klient`, w kliencie `nazwa` i `adres`, w adresie `miasto` i `kodPocztowy`. Start: `required` tylko na górze, zagnieżdżone obiekty bez `required`. Przykłady: klient bez adresu nie, adres bez miasta nie, kompletne ok, klient bez email ok (email opcjonalny). Błędne: `required` na górze z `"klient.adres.miasto"` (ścieżki kropkowe nie istnieją; wymaga pola o takiej dosłownej nazwie, więc odrzuca też poprawne zamówienia). Źródło: validation §6.5.3.
10. **4-10 ★★ (5 min, rodzaj 1) Stan magazynu jako słownik.** Klucz to EAN (13 cyfr), wartość to liczba sztuk (całkowita, ≥ 0), co najmniej jedna pozycja. Start: `type: object` z `properties` dla dwóch konkretnych EAN-ów. Przykłady: nowy EAN z liczbą ok, klucz `abc` nie, wartość `"12"` nie, `-1` nie, `{}` nie. Błędne: start (nowy EAN z dowolną wartością przechodzi). Źródło: core §10.3.2.3, §10.3.2.4; validation §6.5.2.

Tabela „temat × ćwiczenia”: lustro dokument–schemat i błędy strukturalne (4-8, 4-9), `properties`/`required` (4-1, 4-3, 4-4, 4-8, 4-9), `additionalProperties` (4-2, 4-10), słownik (4-10), `null`/brak/pusty (4-3), `items`/`minItems` (4-4, 4-7), `uniqueItems` (4-5), `contains` (4-6), `prefixItems` (4-7). Tematy z jednym ćwiczeniem (`contains`, `uniqueItems`, `prefixItems`) wracają w modułach 6 i 8.

## Uwagi do decyzji

- `patternProperties` tylko jednym zdaniem, bez ćwiczenia; nie ma go w programie.
- Ćwiczenie 4-3 jest najtrudniejsze i najważniejsze dydaktycznie (pułapka z listy CLAUDE.md), dlatego stoi na trzecim miejscu, nie na siódmym.
