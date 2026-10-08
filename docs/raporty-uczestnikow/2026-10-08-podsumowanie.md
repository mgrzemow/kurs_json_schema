# Podsumowanie raportów uczestników — 2026-10-08

Dwa przebiegi agenta `uczestnik` (profil A: analityk, profil B: inżynier) przez cały kurs. Pełne raporty: `2026-10-08-profil-A.md`, `2026-10-08-profil-B.md`.

## Już poprawione

**Błędy merytoryczne i sprzeczności**
- Ramka w module 3: `exclusiveMinimum: true` to draft-04, nie draft-07.
- Moduł 5: ramka o `format` w draft-07 bez anachronizmu.
- Moduł 9: `validate()` w Pythonie rzuca jeden wyjątek; dopisane `iter_errors`.
- Reguła o `uwagi`: w 4-3 kontrakt ze sklepem (zawsze obecne), w module 8 magazyn przyjmuje kilka kanałów (opcjonalne). Obie wersje mają teraz uzasadnienie.
- Kontekst 6-2 nie przeczy już przykładowi; wskazówka w 6-8 nie mówi „brakuje `else`”, gdy `else` jest.

**Ćwiczenia, które zaliczały złe rozwiązania**
- 1-3: ścieżka z cichą ucieczką `\f` jest teraz odrzucana.
- 3-2: nowy przykład z dopiskiem po numerze zamówienia.
- 3-8: zapisy mieszane NIP-u (`123-4567890`) odrzucane; rozwiązanie to alternatywa dwóch pełnych wzorców; nowe błędne rozwiązanie.
- 8-1: polecenie doprecyzowane (numer klienta, VAT UE, typy pozycji, kod rabatowy), cztery nowe przykłady, czas 30 min zamiast 18.

**Brakujące elementy wykładu**
- Moduł 6: nowa sekcja „Warunek na jednym poziomie, reguła na innym” (faktura → NIP w kliencie, kraj → wzorzec kodu w adresie), bez której ćwiczenie końcowe wymagało wiedzy spoza kursu.
- Moduł 3: ucieczka wszystkich znaków specjalnych (`+`, `*`, `?`…), nie tylko kropki.
- Moduł 6: jak czytać `not` z `required`; dlaczego w przykładzie EORI `if` obywa się bez `required`.

**Komunikaty trenera**
- Rozpoznaje nawyki ze starych wersji (`definitions`, `dependencies`, `additionalItems`, `exclusiveMinimum: true`, tablica w `items`) i podaje zapis 2020-12.
- `required` wewnątrz `properties`, `required` przy liście, ścieżki kropkowe w `required`: każdy ma własny komunikat z poprawką.
- Literówka w nazwie formatu (`datetime`) dostaje „czy chodziło o `date-time`?”.
- Brak fałszywych ostrzeżeń przy `oneOf` z polem rozróżniającym.
- Zepsuty wskaźnik i względny `$id`: komunikat mówi, co naprawdę jest nie tak.
- Komentarz w dokumencie JSON: rada pasuje do dokumentu, nie tylko do schematu.
- Twarda spacja: numer kolumny obok linii.
- Angielskie ostrzeżenia Ajv nie trafiają do konsoli.

**Drobne**
- Usunięte frazy z notatek autora („pułapka z listy obowiązkowej”, „uczestnik już to widział”), ton w 5-3, tytuł 3-6 nie zdradza odpowiedzi, martwa wskazówka w 3-3.

## Do decyzji prowadzącego

1. **Tempo dla dwóch profili naraz.** B uważa moduły 1–5 za za wolne (historia JSON, XSD, diagramy, klocki regex, macierz `null`), A uważa moduły 2, 5, 7, 9 za przeładowane żargonem (tabela wersji, metaschemat, biblioteki, URI, Kafka). Propozycja: w wykładzie ramki „Dla technicznych” i „Analitykowi wystarczy”, które prowadzący może pominąć na żywo, a w materiałach zostają.
2. **Odpowiedzi „Przejdzie czy nie?” podane od razu w tekście** (moduły 1, 2, 4, 5, 6, 7). Oba profile to zauważyły. Propozycja: odpowiedź zawsze w zwijanym bloku „Odsłoń”, jak już działa przy pytaniach z werdyktem; w materiałach rozwinięta.
3. **Ćwiczenia za łatwe dla B.** 4-6, 4-7, 4-10, 6-8, 7-2, 7-7 to kopia przykładu z wykładu albo jedna linia. Propozycja: dla każdego modułu jedno dodatkowe ćwiczenie ★★★ bez gotowca w wykładzie, np. `oneOf` z dyskryminatorem i `unevaluatedProperties` naraz (M6), odwołanie do fragmentu w innym pliku `plik#/$defs/x` (M7).
4. **Ćwiczenie migracji draft-07 → 2020-12.** B wskazuje to jako swoją główną potrzebę, a w kursie go nie ma. Propozycja: jedno ćwiczenie w module 7 albo 8: stary schemat zamówienia z `definitions`, tablicą w `items`, `dependencies` i `exclusiveMinimum: true` do przepisania. Trener już podpowiada przy każdym z tych słów.
5. **Moduł 7 dla B:** brak adresu bazowego pliku bez `$id`, odwołań do fragmentu w innym pliku i jednego zdania o rejestracji wielu plików w realnym walidatorze lub w CI. Propozycja: dopisać krótką sekcję, ewentualnie kosztem 7-7.
6. **Lista kontrolna w module 8:** B chce punktów o kotwicach w `pattern`, słowach ze starych wersji, warunkach między polami i testach negatywnych. Można ją rozszerzyć z 10 do 12–13 punktów albo zostawić zwięzłą.
7. **Kolejność ćwiczeń w module 4 nie zgadza się z identyfikatorami** (np. 4-9 jest drugie). W trenerze uczestnik widzi tylko numer porządkowy, ale identyfikator jest w adresie i w nazwach plików. Mogę przenumerować identyfikatory zgodnie z kolejnością.
8. **Czasy ćwiczeń.** A potrzebuje ok. 25% więcej czasu niż podano (najbardziej w modułach 3, 6, 8), B ok. 30% mniej. Czasy są szacunkiem dla przeciętnego uczestnika, więc proponuję zostawić z wyjątkiem 3-8 (dla A 12 min zamiast 6).
9. **Pierwsze ćwiczenia modułów 0, 2 i 4** (0-1, 2-2, 4-1) to trzy razy „dopisz do `required`”. Można zmienić 2-2 na inny typ błędu albo zostawić jako rozgrzewkę.
