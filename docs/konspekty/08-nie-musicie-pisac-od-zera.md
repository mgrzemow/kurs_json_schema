# Moduł 8: Nie musicie pisać od zera (35 min) — opis sekcji

Status: propozycja do akceptacji. Budżet: 12 min wykładu, 18 min ćwiczenia końcowego, 5 min omówienia. Pułapka z listy obowiązkowej: generator opisuje to, co jest w przykładach, a nie to, co powinno być.

## Dane wejściowe do generatora (do akceptacji)

Trzy prawdziwe zamówienia z domeny, zapisane w `docs/konspekty/08-dane-genson/zamowienie-{1,2,3}.json` (przy generowaniu trafią do `tresc/`). Dobrane tak, żeby wymusić typowe wady:

1. **Zamówienie firmowe krajowe** (serwis rowerowy, faktura, NIP, telefon, dwie pozycje, uwagi tekstowe).
2. **Zamówienie prywatne** (bez NIP i telefonu, `uwagi: null`, kod rabatowy, jedna pozycja z ceną całkowitą `249`).
3. **Zamówienie zagraniczne** (klient z Niemiec, `waluta: EUR`, `kraj: DE`, `eori`, pozycja usługowa z `typ: "usluga"`, wymiary paczki `[60, 40, 30]`).

Wynik genson 1.4.0 (`genson -i 2 zamowienie-1.json zamowienie-2.json zamowienie-3.json`), sprawdzony 2026-10-08, ma dokładnie te wady, które ćwiczenie ma odsłonić:
- nagłówek `"$schema": "http://json-schema.org/schema#"` bez wersji;
- `required` wywnioskowane z obecności: `uwagi` wymagane (bo było we wszystkich, raz jako `null`), `kodRabatowy`, `nip`, `telefon`, `eori` opcjonalne (bo brakowało w którymś), `typ` pozycji opcjonalny; `wymiaryPaczki` opcjonalne;
- `status`, `waluta`, `kraj`, `typDokumentu`, `typ` jako zwykłe `string` bez `enum`/`const`;
- brak wzorców (numer, kod pocztowy, NIP, EAN), brak zakresów (`ilosc`, `cena`), brak `minItems` dla pozycji, brak formatów (daty, e-mail);
- `wymiaryPaczki` jako lista dowolnej liczby liczb całkowitych zamiast krotki trzech liczb;
- `uwagi` jako `["null", "string"]` (akurat poprawnie, dobre do omówienia);
- `kodPocztowy` bez wzorca, więc niemiecki `10115` i polski `80-827` przechodzą jednakowo (reguła zależna od kraju to temat na `if`);
- brak `additionalProperties`, brak opisów.

Dla porównania quicktype (`npx quicktype --lang schema`): `$schema` draft-06, `definitions` z `$ref`, `additionalProperties: false` wszędzie (nadmiar), zgadnięte formaty `date` i `date-time` (przypadkowe, ale trafne), `anyOf` z `null` dla `uwagi`.

## Sekcja 8.1: Skąd wziąć schemat (3 min)

- Cztery źródła schematów w praktyce, każde jednym akapitem z tym, co daje i czego nie daje:
  1. **z przykładów** (genson, quicktype, generatory online): typy i strukturę, nic o regułach biznesowych;
  2. **z kodu** (Pydantic w Pythonie, Zod i TypeScript, adnotacje w Javie i .NET): strukturę i część reguł, jeśli programista je zapisał w kodzie; wersja schematu zależy od biblioteki (często draft-07);
  3. **z XSD** (konwertery): strukturę i typy, ale XML-owe nawyki (atrybuty jako pola, wszystko tekstem);
  4. **z modelu AI**: wiarygodnie wyglądający schemat, który trzeba sprawdzić dokładnie tak samo jak wygenerowany, bo model zgaduje reguły biznesowe. (Bez anegdoty, chyba że znajdę udokumentowaną.)
- Wspólna zasada: generator to punkt wyjścia, nie wynik. Zaoszczędza pisanie `properties`, a reguły biznesowe i tak trzeba dopisać ręcznie.

## Sekcja 8.2: Co generatory robią źle (5 min)

- Na żywo: trzy zamówienia → generator w trenerze (zakładka Generator, ten sam algorytm co genson) → schemat. Potem prawdziwy wynik genson z pliku (w wykładzie jako blok schematu) i wynik quicktype obok.
- Omówienie wad po kolei, każda jako para „co generator napisał” → „co powinno być”, z odwołaniem do modułu, w którym to było: `required` z obecności (moduł 4), brak `enum` (3), brak wzorców i zakresów (3), brak `minItems` (4), `null` (4), formaty przypadkowe (5), krotka jako lista (4), nagłówek bez wersji albo stary draft (2), `additionalProperties` brak albo nadmiar (4), brak opisów (5).
- Pytanie do sali: „Czy zamówienie bez `uwagi` przejdzie przez schemat z genson?” → nie, bo `uwagi` trafiło do `required`.

## Sekcja 8.3: Lista kontrolna poprawek (4 min)

Dziesięć punktów do odhaczenia przy każdym wygenerowanym schemacie; ta sama lista jest w ćwiczeniu końcowym i w materiałach jako ściągawka:
1. `$schema` na 2020-12 (albo świadomie wybrana wersja).
2. `required` według wymagań, nie według przykładów (co naprawdę musi być?).
3. `enum`/`const` dla pól o zamkniętej liście wartości.
4. `pattern` dla identyfikatorów i kodów; `minLength` dla tekstów, które nie mogą być puste.
5. Zakresy liczb (`minimum`, `exclusiveMinimum`, `maximum`, `multipleOf` z rozwagą).
6. Listy: `minItems`, `uniqueItems`, krotki jako `prefixItems`.
7. `null` kontra brak pola kontra pusty tekst, świadomie dla każdego pola.
8. `format` tam, gdzie ma sens, ze świadomością, że to adnotacja.
9. `additionalProperties`: decyzja per obiekt, nie automat.
10. `title`/`description` na schemacie i polach; `$defs` dla powtórzeń (adres).

## Ćwiczenie końcowe 8-1 ★★★ (18 min, rodzaj 5: popraw wygenerowany schemat)

- Start: dosłowny wynik genson z trzech zamówień (plik generowany w czasie budowania treści przez `genson`, nie pisany ręcznie; test sprawdza, że `start.json` jest identyczny z wynikiem generatora dla plików wejściowych).
- Polecenie językiem biznesu, w punktach: uwagi mogą nie wystąpić; status z pięciu wartości; waluta PLN/EUR/CZK; numer zamówienia i kod pocztowy według wzorców z modułu 3 (dla PL), NIP 10 cyfr albo z prefiksem kraju; EAN 13 cyfr; ilość całkowita dodatnia; cena dodatnia z dwoma miejscami; co najmniej jedna pozycja; wymiary paczki to dokładnie trzy liczby dodatnie; daty w formacie ISO; e-mail; faktura wymaga NIP; adres poza PL wymaga EORI; nagłówek 2020-12.
- Lista kontrolna w prawej kolumnie do odhaczania (rozszerzenie rodzaju 5 w trenerze: lista z checkboxami zapamiętywana w stanie).
- Przykłady (ok. 16, po jednym na regułę, w tym trzy oryginalne zamówienia, które muszą przejść): bez uwag ok; `status: "Wysłane"` nie; `waluta: "USD"` nie; kod pocztowy `80827` nie; `ilosc: 0` nie; `cena: 12.345` nie; pusta lista pozycji nie; wymiary dwa elementy nie; `faktura: true` bez NIP nie; `kraj: DE` bez EORI nie; data `08.10.2026` nie (z włączoną walidacją `format`); `numer` zły nie.
- Błędne rozwiązania: `required` ze wszystkimi polami (odrzuca zamówienie 2 bez NIP); `additionalProperties: false` na pozycjach bez dopisania `typ` (odrzuca zamówienie 3); `enum` statusów z literówką.
- Czas 18 min to więcej niż typowe ćwiczenie, bo to podsumowanie całego kursu; prowadzący może ograniczyć do pierwszych pięciu punktów listy.
- Źródła: zbiorczo do każdego punktu listy (sekcje z modułów 2–7).

## Uwagi do decyzji

- Dane wejściowe (trzy zamówienia) do akceptacji; ewentualne zmiany w nazwach, kwotach, krajach nie wpływają na mechanikę.
- Wykład o modelach AI bez anegdoty, chyba że masz własną, udokumentowaną.
- Rozszerzenie trenera: lista kontrolna z checkboxami w rodzaju 5 (mała zmiana).
