# Moduł 5: Formaty i adnotacje (25 min) — opis sekcji

Status: propozycja do akceptacji. Budżet: 12 min wykładu, 10 min ćwiczeń, 3 min omówienia. Nagłówki z obowiązkowego zakresu: „Zdefiniowane formaty”, „Podstawowe adnotacje metadanych”. Moduł częściowo opisowy; przełącznik „walidacja `format`” jest tu głównym narzędziem pokazu.

## Sekcja 5.1: Zdefiniowane formaty (6 min)

- `format` nazywa znany rodzaj tekstu. Formaty zdefiniowane w specyfikacji z przykładem z domeny dla każdego używanego: `date` (data zamówienia `2026-10-08`), `date-time` (znacznik utworzenia `2026-10-08T10:15:00Z`), `time`, `duration`, `email` (klient), `hostname`, `ipv4` i `ipv6` (adres, z którego złożono zamówienie, tylko hasłowo), `uri` i `uri-reference` (link do faktury), `uuid` (techniczny identyfikator zamówienia), `regex`, `json-pointer` (hasłowo, wróci w module 7). Daty i czasy według RFC 3339: `08.10.2026` to nie `date`. <!-- validation §7.3.1–7.3.8 -->
- **Adnotacja kontra asercja.** Domyślnie `format` jest adnotacją: walidator ma go zebrać jako informację, ale nie musi sprawdzać. Dopiero słownik „format-assertion” albo odpowiednia konfiguracja walidatora robi z niego regułę. Konsekwencja: `"jan@"` w polu z `format: email` przechodzi, dopóki ktoś nie włączy sprawdzania. <!-- validation §7.2.1, §7.2.2 -->
- Pokaz na żywo: schemat z `format: email`, dokument `"jan@"`, przełącznik wyłączony → przechodzi; włączony → odrzucony. Trener przy wyłączonym przełączniku pokazuje informację, że `format` to tylko opis.
- Od czego to zależy w praktyce: od walidatora i jego konfiguracji, nie od schematu. Tabela hasłowa: Ajv (wymaga dodatkowej biblioteki `ajv-formats`), Python `jsonschema` (wymaga `format_checker`), biblioteki .NET i Java (różnie, zwykle do włączenia). Zasada dla autora schematu: jeśli format ma być regułą, dopisz `pattern` albo upewnij się, co robi walidator po drugiej stronie. (Źródła poza `spec/`: dokumentacja Ajv i python-jsonschema.)
- Nieznany format (np. `"format": "telefon"`) jest ignorowany nawet przy włączonym sprawdzaniu; dla telefonu, NIP-u, kodu pocztowego jest `pattern`. Trener ostrzega o nieznanym formacie (do dodania w trenerze, patrz uwagi). <!-- validation §7.2.3 -->
- Pytanie do sali: `format: date` i dokument `"2026-02-30"` z włączonym sprawdzaniem → odrzucony (30 lutego nie istnieje; `ajv-formats` w trybie pełnym to sprawdza; potwierdzić walidatorem przy generowaniu).
- Ramka „W draft-07”: lista formatów prawie ta sama (`duration` i `uuid` doszły w 2019-09); w draft-07 `format` też był domyślnie adnotacją, choć wiele walidatorów sprawdzało go domyślnie, stąd zaskoczenia przy migracji.

## Sekcja 5.2: Podstawowe adnotacje metadanych (6 min)

- Adnotacje niczego nie sprawdzają; służą ludziom i narzędziom: dokumentacji, podpowiedziom w edytorze (trener pokazuje je po najechaniu), generatorom formularzy. <!-- validation §9 -->
- `title` i `description` na schemacie i na każdym polu; zasada: opis mówi, co pole znaczy biznesowo, nie powtarza typu. <!-- §9.1 -->
- `examples`: lista przykładowych wartości, np. dla numeru zamówienia; nie są sprawdzane względem schematu (częste zaskoczenie). <!-- §9.5 -->
- `default`: wartość domyślna waluty `PLN`. **Pułapka: `default` niczego nie wpisuje do danych.** Dowód na żywo: dokument bez `waluta`, schemat z `default: "PLN"` i `required: ["waluta"]` → odrzucony; bez `required` → przechodzi, ale dokument nadal nie ma waluty. Kto ma wpisać domyślną wartość, musi to zrobić w kodzie. <!-- §9.2 -->
- `deprecated: true`: stare pole `kodKlienta` zastąpione przez `numerKlienta`; nadal przechodzi, ale narzędzia mogą ostrzegać. <!-- §9.3 -->
- `readOnly` i `writeOnly`: `numer` i `utworzono` nadaje system (`readOnly`), token płatności wysyła klient i nigdy nie dostaje go z powrotem (`writeOnly`). Walidator nie egzekwuje żadnego z nich; to informacja dla API i dokumentacji (wróci w module 9 przy OpenAPI). <!-- §9.4 -->
- Pytanie do sali: schemat z `examples: ["ZAM-2026-000123"]` i `pattern` niepasującym do tego przykładu → schemat poprawny, walidator nie sprawdza `examples`.
- Ramka „W draft-07”: `deprecated` nie istniało (doszło w 2019-09); `readOnly` i `writeOnly` doszły w draft-07 z OpenAPI.

## Ćwiczenia (kolejność według ważności; łącznie ok. 22 min)

1. **5-1 ★★ (5 min, rodzaj 3) Co robi `format` bez sprawdzania.** Schemat z `format: email` i `format: date`; dokumenty: `"jan@"`, `"jan@example.com"`, `"08.10.2026"`, `"2026-10-08"`, `42`. Ćwiczenie w dwóch krokach w poleceniu: najpierw obstaw z wyłączonym przełącznikiem, sprawdź; potem włącz przełącznik i powtórz. Wyjaśnienia rozróżniają oba tryby. **Wymaga w trenerze**: wynik ćwiczenia rodzaju 3 zależy od przełącznika (już tak jest), a wyjaśnienie musi mieć dwa warianty tekstu; dane ćwiczenia dostają pola `wyjasnienieBezFormatow`/`wyjasnienieZFormatami`. Źródło: validation §7.2.1, §7.2.2.
2. **5-2 ★ (4 min, rodzaj 1) Daty i e-mail zamówienia.** `dataZamowienia` jako `date`, `utworzono` jako `date-time`, `email` jako `email`; ćwiczenie oznaczone „z włączoną walidacją `format`” (pole `formaty: true` w danych ćwiczenia wymusza tryb niezależnie od przełącznika; **drobne rozszerzenie trenera**). Przykłady: `2026-10-08` ok, `2026-10-8` nie, `08.10.2026` nie, `2026-10-08T10:15:00Z` ok, `2026-10-08 10:15` nie, `jan@` nie. Źródło: validation §7.3.1, §7.3.2.
3. **5-3 ★★ (4 min, rodzaj 3) `default` niczego nie wpisuje.** Schemat z `waluta` (`default: "PLN"`, `enum`) i `required: ["waluta"]`; dokumenty: z walutą ok, bez waluty nie, z `"waluta": "pln"` nie. Wyjaśnienie: `default` to informacja, a nie wartość. Źródło: validation §9.2.
4. **5-4 ★★★ (6 min, rodzaj 1) Identyfikatory i telefon.** `identyfikator` jako `uuid`, `linkFaktury` jako `uri`, `telefon` w formacie `+48 600 100 200` albo `600100200`. Start: `"format": "telefon"` (nieznany, ignorowany; trener ostrzega). Rozwiązanie: `pattern` dla telefonu, formaty dla reszty; ćwiczenie z `formaty: true`. Przykłady: telefon `abc` nie, `600100200` ok, `+48 600 100 200` ok, uuid bez myślników nie, link bez schematu `www.example.com/f.pdf` nie (dla `uri` wymagany schemat `https://`). Błędne: `format: "phone"` (też nieznany). Źródło: validation §7.2.3, §7.3.5.
5. **5-5 ★ (3 min, rodzaj 3) Co sprawdza adnotacja.** Schemat z `readOnly` na `numer`, `deprecated` na `kodKlienta`, `description` wszędzie, `required: ["numer"]`. Dokumenty: z `kodKlienta` ok (przestarzałe, ale dozwolone), bez `numer` nie (to `required`, nie `readOnly`), `numer` dowolny tekst ok (`readOnly` nie sprawdza). Źródło: validation §9.3, §9.4.

Tabela „temat × ćwiczenia”: adnotacja kontra asercja (5-1, 5-2, 5-4), zdefiniowane formaty (5-2, 5-4), `default` (5-3), pozostałe adnotacje (5-5). `title`/`description`/`examples` nie mają ćwiczenia z werdyktem, bo nie dają werdyktu; pojawiają się w ćwiczeniu końcowym modułu 8 (lista kontrolna: „dodaj opisy”).

## Rozszerzenia trenera potrzebne do tego modułu (małe)

- Pole `formaty: true|false` w `cwiczenie.json`, które wymusza tryb sprawdzania formatów dla danego ćwiczenia (z informacją w interfejsie „to ćwiczenie ma włączoną walidację `format`”).
- Dwa warianty wyjaśnienia w ćwiczeniu rodzaju 3 zależnie od trybu (5-1).
- Ostrzeżenie o nieznanym formacie (odłożona uwaga M7 z recenzji).

## Uwagi do decyzji

- Tabela „który walidator sprawdza formaty domyślnie” ma źródła poza `spec/` (dokumentacje bibliotek); proponuję ją hasłowo, z zastrzeżeniem „sprawdź w swojej bibliotece”.
- Pytanie do sali o `2026-02-30` potwierdzę walidatorem; jeśli `ajv-formats` tego nie wyłapie, zamienię na `2026-13-01`.
