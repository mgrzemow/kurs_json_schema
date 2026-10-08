Zamówienie ma datę, adres e-mail klienta i link do faktury. Wzorcem da się opisać kod pocztowy, ale data `2026-02-30`{d} przejdzie przez każdy rozsądny wzorzec, a nie istnieje. Do takich rzeczy specyfikacja ma gotowe nazwy formatów. Ten moduł jest o tym, co one sprawdzają, a przede wszystkim o tym, kiedy **nie** sprawdzają. W drugiej części: słowa, które z założenia niczego nie sprawdzają, a mimo to są w schemacie najbardziej potrzebne ludziom.

## Zdefiniowane formaty

`format` nazywa znany rodzaj tekstu. Specyfikacja definiuje listę nazw, każdą z odesłaniem do normy, która mówi, jak taki tekst wygląda. Te, które przydają się w zamówieniu: <!-- twierdzenie --> <!-- zrodlo: validation §7.3.1, §7.3.2, §7.3.3, §7.3.4, §7.3.5, §7.3.7, §7.3.8 -->

| Format | Przykład z zamówienia | Co znaczy |
|---|---|---|
| `date` | `dataZamowienia: "2026-10-08"` | data według RFC 3339: rok-miesiąc-dzień |
| `date-time` | `utworzono: "2026-10-08T10:15:00Z"` | data i czas ze strefą czasową |
| `time` | `"10:15:00Z"`{d} | sam czas ze strefą |
| `duration` | `"P3D"`{d} | czas trwania według ISO 8601 |
| `email` | `email: "serwis@example.com"` | adres e-mail |
| `hostname` | `"magazyn.example"`{d} | nazwa komputera w sieci (hosta) |
| `ipv4`, `ipv6` | `zrodloZamowienia: "10.0.0.7"` | adres IP (tu: do wykrywania oszustw, tylko hasłowo) |
| `uri`, `uri-reference` | `linkFaktury: "https://example.com/f/123.pdf"` | link, czyli adres URI: pełny (z początkiem w rodzaju `https://`) albo, dla `uri-reference`, też względny, np. `"/f/123.pdf"`{d} |
| `uuid` | `identyfikator: "123e4567-e89b-12d3-a456-426614174000"` | identyfikator UUID: 32 cyfry szesnastkowe (0–9, a–f) w grupach 8-4-4-4-12, rozdzielonych myślnikami |
| `regex` | `"^[0-9]{2}-[0-9]{3}$"`{s} | poprawne wyrażenie regularne |
| `json-pointer` | `"/klient/adres"`{d} | wskaźnik JSON (wróci w module 7) |

Daty i czasy są według RFC 3339 (RFC to normy internetowe): `2026-10-08`{d} jest datą, `08.10.2026`{d} nie, a `2026-10-08 10:15`{d} nie jest `date-time`, bo brakuje litery `T`, sekund i strefy czasowej.

### Adnotacja kontra asercja

Tu jest pułapka numer jeden tego modułu. **Domyślnie `format` jest adnotacją**: walidator ma go zebrać jako informację, ale nie musi sprawdzać. Dopiero osobny słownik („format-assertion”) albo odpowiednia konfiguracja walidatora robi z niego regułę. Konsekwencja: `"jan@"`{d} w polu z `format: email`{s} przechodzi, dopóki ktoś nie włączy sprawdzania. <!-- twierdzenie --> <!-- zrodlo: validation §7.2.1, §7.2.2 -->

```json schemat=email
{ "type": "string", "format": "email" }
```

```json dokument=email-zly schemat=email oczekiwane=przechodzi
"jan@"
```

Powyższy werdykt policzył walidator tej strony w trybie domyślnym, czyli z wyłączoną walidacją `format`. Teraz włącz przełącznik „walidacja `format`” w pasku i otwórz ten przykład w edytorze: ten sam dokument zostanie odrzucony. Przy wyłączonym przełączniku edytor pokazuje pod edytorem informację, że `format` jest tylko opisem.

Od czego to zależy w praktyce: od walidatora i jego konfiguracji, nie od schematu. W systemie walidator jest zwykle biblioteką dołączoną do kodu. Hasłowo, do sprawdzenia w dokumentacji biblioteki używanej w danym systemie:

| Biblioteka | Co z `format` |
|---|---|
| Ajv (JavaScript) | nie sprawdza bez dodatkowej biblioteki `ajv-formats` |
| `jsonschema` (Python) | nie sprawdza bez przekazania `format_checker` |
| biblioteki Java i .NET | różnie; zwykle do włączenia osobną opcją |

(Źródła: dokumentacje bibliotek, poza repozytorium.)

Zasada dla autora schematu: jeśli format ma być regułą, dopisz `pattern` tam, gdzie się da, albo upewnij się, co robi walidator po drugiej stronie. Zasada dla czytającego: `format` w schemacie nie oznacza, że ktoś to sprawdza.

### Nieznany format

Format spoza listy, np. `"format": "telefon"`{s}, jest zbierany jak każda adnotacja i nie wpływa na werdykt. Tak jest także wtedy, gdy sprawdzanie formatów włącza się opcją walidatora (jak przełącznik w pasku tej strony). Dopiero schemat, który jawnie korzysta ze słownika „format-assertion”, musi przy nieznanym formacie zgłosić błąd; w praktyce spotyka się to rzadko. Dla telefonu, NIP-u i kodu pocztowego służy `pattern` z modułu 3. Edytor na tej stronie ostrzega o nieznanym formacie; walidator w magazynie nie. <!-- twierdzenie --> <!-- zrodlo: validation §7.2.3 -->

**Przejdzie czy nie?** Schemat `data` z włączoną walidacją `format` i dokument `"2026-02-30"`{d} (30 lutego). Schemat `data` jest niżej.

```json schemat=data
{ "type": "string", "format": "date" }
```

```json dokument=data-ok schemat=data oczekiwane=przechodzi
"2026-10-08"
```

```odpowiedz
Zależy od biblioteki; walidator tej strony w trybie pełnym odrzuca, bo sprawdza kalendarz. To kolejny powód, żeby nie polegać na `format` w kontrakcie między systemami.
```

> **W draft-07:** lista formatów prawie ta sama (`duration` i `uuid` doszły w 2019-09). Sprawdzanie `format` było dla walidatorów opcjonalne (pojęcia „adnotacji” w dzisiejszym sensie jeszcze nie było), a wiele z nich sprawdzało go domyślnie, więc przy przejściu na nowszą bibliotekę zdarza się, że „walidacja przestała działać”. Nie przestała: nigdy nie była obiecana.

## Podstawowe adnotacje metadanych

Adnotacje niczego nie sprawdzają. Służą ludziom i narzędziom: dokumentacji, podpowiedziom w edytorze (edytor na tej stronie pokazuje je po najechaniu na słowo), generatorom formularzy (moduł 9). <!-- twierdzenie --> <!-- zrodlo: validation §9 -->

### Przegląd adnotacji

- **`title` i `description`** na schemacie i na każdym polu. Dobry opis mówi, co pole znaczy biznesowo („numer nadany przez sklep, unikalny w roku”), a nie powtarza typu („tekst”). <!-- twierdzenie --> <!-- zrodlo: validation §9.1 -->
- **`examples`**: lista przykładowych wartości. Nie są sprawdzane względem schematu, więc przykład niezgodny ze wzorcem przechodzi niezauważony. <!-- twierdzenie --> <!-- zrodlo: validation §9.5 -->
- **`default`**: wartość domyślna, np. waluta `PLN`. <!-- twierdzenie --> <!-- zrodlo: validation §9.2 -->
- **`deprecated: true`{s}**: pole przestarzałe, które ma zniknąć; nadal przechodzi, ale narzędzia mogą ostrzegać. Stare `kodKlienta` zastąpione przez `numerKlienta`. <!-- twierdzenie --> <!-- zrodlo: validation §9.3 -->
- **`readOnly`** i **`writeOnly`**: informacja dla API. `numer` i `utworzono` nadaje system (`readOnly`), token płatności (jednorazowy kod zastępujący numer karty) wysyła klient i nigdy nie dostaje go z powrotem (`writeOnly`). Walidator nie egzekwuje żadnego z nich. <!-- twierdzenie --> <!-- zrodlo: validation §9.4 -->

```json schemat=opisany
{
  "title": "Zamówienie",
  "description": "Komunikat ze sklepu do magazynu. Jedno zamówienie, jeden komunikat.",
  "type": "object",
  "properties": {
    "numer": { "type": "string", "description": "Numer nadany przez sklep, unikalny w roku.", "examples": ["ZAM-2026-000123"], "readOnly": true },
    "waluta": { "type": "string", "enum": ["PLN", "EUR", "CZK"], "default": "PLN" },
    "kodKlienta": { "type": "string", "deprecated": true, "description": "Zastąpione przez numerKlienta." },
    "tokenPlatnosci": { "type": "string", "writeOnly": true }
  },
  "required": ["numer"]
}
```

### Pułapka: `default` niczego nie wpisuje

`default` to informacja: „jeśli nie podano, przyjmij PLN”. Walidator niczego nie wpisuje do danych. Dokument bez waluty po walidacji nadal nie ma waluty, a jeśli waluta jest w `required`, zostaje odrzucony mimo `default`. Kto ma wpisać wartość domyślną, musi zrobić to w kodzie. <!-- twierdzenie --> <!-- zrodlo: validation §9.2 -->

```json schemat=waluta-default
{
  "type": "object",
  "properties": { "waluta": { "type": "string", "enum": ["PLN", "EUR", "CZK"], "default": "PLN" } },
  "required": ["waluta"]
}
```

```json dokument=bez-waluty schemat=waluta-default oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

(Niektóre biblioteki mają opcję „wpisuj wartości domyślne”, która zmienia dane w trakcie walidacji. To rozszerzenie biblioteki, nie zachowanie specyfikacji, i w kontrakcie między systemami nie wolno na nim polegać.)

**Przejdzie czy nie?** Schemat `opisany` i dokument z numerem i polem `kodKlienta`.

```json pytanie=przestarzale schemat=opisany oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123", "kodKlienta": "K-0001" }
```

```odpowiedz
Przechodzi: `deprecated` to adnotacja, a `numer` jest. Gdyby `numer` był inny niż w przykładzie `examples`, też by przeszło.
```

> **W draft-07:** `deprecated` jeszcze nie istniało. `readOnly` przeszło w draft-07 z osobnej specyfikacji hyper-schema do podstawowej, a `writeOnly` doszło w draft-07. Oba mają praktyczne znaczenie przy opisie żądań (co wysyła klient) i odpowiedzi (co oddaje system); więcej w module 9.
