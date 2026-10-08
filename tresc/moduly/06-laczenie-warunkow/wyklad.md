## Reguły między polami

Dotąd każda reguła patrzyła na jedno pole. Biznes mówi inaczej: „jeśli faktura, to NIP”, „płatność kartą wymaga tokenu”, „e-mail albo telefon, co najmniej jeden”, „kraj inny niż Polska wymaga numeru EORI”. Do tego służą słowa, które łączą całe schematy: logiczne (`allOf`, `anyOf`, `oneOf`, `not`), warunkowe (`if`/`then`/`else`) i zależności między polami (`dependentRequired`). Słowa logiczne i warunkowe biorą całe podschematy i składają z ich werdyktów jeden werdykt; `dependentRequired` jest prostsze: to zwykła asercja z listą nazw pól. <!-- twierdzenie --> <!-- zrodlo: core §10.2; validation §6.5.4 -->

Przy braku czasu z tego modułu zostaje sekcja o `if`/`then`/`else`; reszta jest w materiałach.

## `allOf`, `anyOf`, `oneOf`, `not`

### `allOf`: wszystkie naraz

Wartość musi spełniać **wszystkie** podschematy. Adres dostawy to zwykły adres plus pole `instrukcjeDlaKuriera`: <!-- twierdzenie --> <!-- zrodlo: core §10.2.1.1 -->

```json schemat=adres-dostawy
{
  "allOf": [
    { "type": "object", "properties": { "miasto": { "type": "string" } }, "required": ["miasto"] },
    { "type": "object", "properties": { "instrukcjeDlaKuriera": { "type": "string" } } }
  ]
}
```

```json dokument=adres-dostawy-ok schemat=adres-dostawy oczekiwane=przechodzi
{ "miasto": "Gdańsk", "instrukcjeDlaKuriera": "domofon 3" }
```

### Pułapka: `additionalProperties: false`{s} w gałęzi `allOf`

Kusi, żeby drugą gałąź zamknąć, bo literówki w instrukcjach dla kuriera są kosztowne. Ale każda gałąź widzi **tylko swoje** `properties`. Dla gałęzi z instrukcjami pole `miasto` jest „dodatkowe”, więc zamknięta gałąź odrzuca każdy adres z miastem, czyli każdy adres. <!-- twierdzenie --> <!-- zrodlo: core §10.2, §10.3.2.3; spec/tests/draft2020-12/additionalProperties.json (additionalProperties does not look in applicators) -->

```json schemat=adres-zamknieta-galaz
{
  "allOf": [
    { "type": "object", "properties": { "miasto": { "type": "string" } }, "required": ["miasto"] },
    { "type": "object", "properties": { "instrukcjeDlaKuriera": { "type": "string" } }, "additionalProperties": false }
  ]
}
```

```json dokument=adres-zamknieta-galaz-ok schemat=adres-zamknieta-galaz oczekiwane=odrzucony
{ "miasto": "Gdańsk", "instrukcjeDlaKuriera": "domofon 3" }
```

Lekarstwo w 2020-12 to `unevaluatedProperties`: działa jak `additionalProperties`, ale „widzi” pola, które zostały pomyślnie sprawdzone w gałęziach `allOf`, w `if`/`then` i za `$ref`. Stawia się je na poziomie `allOf`, nie w gałęzi. <!-- twierdzenie --> <!-- zrodlo: core §11.3 -->

```json schemat=adres-unevaluated
{
  "allOf": [
    { "type": "object", "properties": { "miasto": { "type": "string" } }, "required": ["miasto"] },
    { "type": "object", "properties": { "instrukcjeDlaKuriera": { "type": "string" } } }
  ],
  "unevaluatedProperties": false
}
```

```json dokument=adres-unevaluated-ok schemat=adres-unevaluated oczekiwane=przechodzi
{ "miasto": "Gdańsk", "instrukcjeDlaKuriera": "domofon 3" }
```

```json dokument=adres-unevaluated-literowka schemat=adres-unevaluated oczekiwane=odrzucony
{ "miasto": "Gdańsk", "instrukcje": "domofon 3" }
```

> **W draft-07:** `unevaluatedProperties` nie istniało. Jedyne wyjście to scalić gałęzie w jeden obiekt albo zostawić obiekt otwarty. Stąd wiele starych schematów nie ma `additionalProperties: false`{s} tam, gdzie powinno.

### `anyOf`: co najmniej jeden

Wartość musi spełniać **co najmniej jeden** podschemat. Kontakt do klienta: e-mail albo telefon, może być oba. <!-- twierdzenie --> <!-- zrodlo: core §10.2.1.2 -->

```json schemat=kontakt-anyof
{ "type": "object", "anyOf": [{ "required": ["email"] }, { "required": ["telefon"] }] }
```

```json dokument=kontakt-oba schemat=kontakt-anyof oczekiwane=przechodzi
{ "email": "jan@example.com", "telefon": "600100200" }
```

```json dokument=kontakt-zaden schemat=kontakt-anyof oczekiwane=odrzucony
{ "nazwa": "Jan Nowak" }
```

### `oneOf`: dokładnie jeden

Wartość musi spełniać **dokładnie jeden** podschemat. Sposób płatności: przelew (numer konta), karta (token) albo za pobraniem (kwota). Pułapka: gdy dokument pasuje do dwóch opcji naraz, `oneOf` go odrzuca. Para `anyOf` kontra `oneOf` na dokumencie, który ma i numer konta, i token: <!-- twierdzenie --> <!-- zrodlo: core §10.2.1.3 -->

```json schemat=platnosc-anyof
{ "anyOf": [{ "required": ["numerKonta"] }, { "required": ["token"] }, { "required": ["kwotaPobrania"] }] }
```

```json schemat=platnosc-oneof
{ "oneOf": [{ "required": ["numerKonta"] }, { "required": ["token"] }, { "required": ["kwotaPobrania"] }] }
```

```json dokument=platnosc-dwie-anyof schemat=platnosc-anyof oczekiwane=przechodzi
{ "numerKonta": "PL61109010140000071219812874", "token": "tok_abc" }
```

```json dokument=platnosc-dwie-oneof schemat=platnosc-oneof oczekiwane=odrzucony
{ "numerKonta": "PL61109010140000071219812874", "token": "tok_abc" }
```

Lekarstwo: **pole rozróżniające** (dyskryminator). Każda gałąź ma `typ` z `const`, więc dokument może pasować tylko do jednej:

```json schemat=platnosc-typ
{
  "type": "object",
  "required": ["typ"],
  "oneOf": [
    { "properties": { "typ": { "const": "przelew" } }, "required": ["numerKonta"] },
    { "properties": { "typ": { "const": "karta" } }, "required": ["token"] },
    { "properties": { "typ": { "const": "pobranie" } }, "required": ["kwotaPobrania"] }
  ]
}
```

```json dokument=platnosc-karta schemat=platnosc-typ oczekiwane=przechodzi
{ "typ": "karta", "token": "tok_abc" }
```

```json dokument=platnosc-karta-bez-tokenu schemat=platnosc-typ oczekiwane=odrzucony
{ "typ": "karta", "numerKonta": "PL61109010140000071219812874" }
```

Przy `anyOf` i `oneOf` komunikaty walidatora są mało pomocne („nie pasuje do żadnej opcji”), bo walidator nie wie, którą gałąź miałeś na myśli. Pole rozróżniające pomaga ludziom i narzędziom.

### `not`: nie może

Wartość **nie może** spełniać podschematu. Zamówienie do magazynu nie może mieć statusu `anulowane`. Alternatywą jest `enum` bez tego statusu, ale `not` nie wymaga wypisywania wszystkich dozwolonych, więc nowy status nie psuje schematu. <!-- twierdzenie --> <!-- zrodlo: core §10.2.1.4 -->

```json schemat=nie-anulowane
{ "type": "string", "not": { "const": "anulowane" } }
```

```json dokument=status-anulowane schemat=nie-anulowane oczekiwane=odrzucony
"anulowane"
```

**Przejdzie czy nie?** Schemat z `oneOf` dwóch gałęzi `{"type": "string"}`{s} i `{"minLength": 1}`{s} i dokument `"a"`{d}.

```json schemat=oneof-dwie-prawdy
{ "oneOf": [{ "type": "string" }, { "minLength": 1 }] }
```

```json pytanie=oneof-a schemat=oneof-dwie-prawdy oczekiwane=odrzucony
"a"
```

```odpowiedz
Odrzucony: `"a"` jest tekstem i ma długość 1, więc pasuje do obu gałęzi, a `oneOf` chce dokładnie jednej.
```

## `if`/`then`/`else`

`if` to schemat-warunek. Gdy jest spełniony, stosuje się `then`; w przeciwnym razie `else`. Samo `if` bez `then` i `else` niczego nie sprawdza. Faktura: jeśli `faktura` równe `true`, to wymagany `nip`. <!-- twierdzenie --> <!-- zrodlo: core §10.2.2.1, §10.2.2.2, §10.2.2.3 -->

```json schemat=faktura-nip
{
  "type": "object",
  "if": { "properties": { "faktura": { "const": true } }, "required": ["faktura"] },
  "then": { "required": ["nip"] }
}
```

```json dokument=faktura-bez-nip schemat=faktura-nip oczekiwane=odrzucony
{ "faktura": true }
```

```json dokument=bez-faktury-bez-nip schemat=faktura-nip oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

### Pułapka: `if` bez `required`

`if` z samym `properties` jest spełnione także wtedy, gdy pola **nie ma**, bo `properties` nie wymaga obecności (moduł 4). Zamówienie bez pola `faktura` trafia wtedy do `then` i wymaga NIP-u, czego nikt nie chciał. Lekarstwo widać wyżej: `required: ["faktura"]`{s} wewnątrz `if`. <!-- twierdzenie --> <!-- zrodlo: core §10.2.2.1, §10.3.2.1; spec/tests/draft2020-12/properties.json (no property present is valid) -->

```json schemat=faktura-nip-bez-required
{
  "type": "object",
  "if": { "properties": { "faktura": { "const": true } } },
  "then": { "required": ["nip"] }
}
```

```json dokument=bez-faktury-bez-nip-pulapka schemat=faktura-nip-bez-required oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

**Przejdzie czy nie?** Powtórka: schemat `faktura-nip-bez-required` i dokument bez `faktura` i bez `nip`.

```odpowiedz
Odrzucony, i to jest błąd schematu, nie dokumentu: `if` bez `required` jest spełnione, gdy pola nie ma.
```

### `else` do zakazów

Kraj inny niż PL wymaga `eori`, a dla PL `eori` jest zabronione. Zakaz zapisuje się przez `not` z `required`; czyta się to „nie może być tak, że pole `eori` jest obecne”. W tym przykładzie `if` może obyć się bez `required: ["kraj"]`{s}, bo `kraj` jest wymagany na górze schematu, więc dokument bez kraju i tak zostanie odrzucony:

```json schemat=eori
{
  "type": "object",
  "required": ["kraj"],
  "if": { "properties": { "kraj": { "const": "PL" } } },
  "then": { "not": { "required": ["eori"] } },
  "else": { "required": ["eori"] }
}
```

```json dokument=eori-de-bez schemat=eori oczekiwane=odrzucony
{ "kraj": "DE" }
```

```json dokument=eori-pl-z schemat=eori oczekiwane=odrzucony
{ "kraj": "PL", "eori": "PL123456789012345" }
```

```json dokument=eori-pl-bez schemat=eori oczekiwane=przechodzi
{ "kraj": "PL" }
```

### Warunek na jednym poziomie, reguła na innym

Warunek i reguła nie muszą dotyczyć tego samego obiektu. Faktura jest polem zamówienia, a NIP siedzi w kliencie. `then` jest zwykłym schematem zamówienia, więc może sięgnąć w głąb przez `properties`. Tak samo można warunkowo dołożyć `pattern`: kod pocztowy ma polski wzorzec tylko dla kraju PL.

```json schemat=warunek-w-glab
{
  "type": "object",
  "if": { "properties": { "faktura": { "const": true } }, "required": ["faktura"] },
  "then": { "properties": { "klient": { "required": ["nip"] } } },
  "properties": {
    "adres": {
      "type": "object",
      "required": ["kraj", "kodPocztowy"],
      "if": { "properties": { "kraj": { "const": "PL" } } },
      "then": { "properties": { "kodPocztowy": { "pattern": "^[0-9]{2}-[0-9]{3}$" } } }
    }
  }
}
```

```json dokument=faktura-klient-bez-nip schemat=warunek-w-glab oczekiwane=odrzucony
{ "faktura": true, "klient": { "nazwa": "Serwis" }, "adres": { "kraj": "PL", "kodPocztowy": "80-827" } }
```

```json dokument=niemiecki-kod schemat=warunek-w-glab oczekiwane=przechodzi
{ "faktura": false, "klient": { "nazwa": "Radsport" }, "adres": { "kraj": "DE", "kodPocztowy": "10115" } }
```

```json dokument=polski-kod-zly schemat=warunek-w-glab oczekiwane=odrzucony
{ "faktura": false, "klient": { "nazwa": "Jan" }, "adres": { "kraj": "PL", "kodPocztowy": "80827" } }
```

Uwaga na komunikat: przy pierwszym dokumencie walidator mówi „brakuje wymaganego pola „nip”” i wskazuje klienta, nie zamówienie, bo tam stoi `required` z gałęzi `then`. <!-- twierdzenie --> <!-- zrodlo: core §10.2.2.2, §10.3.2.1 -->

## `dependentRequired`

Prostszy zapis zależności „jeśli jest pole A, muszą być pola B i C”, bez `if`: `dependentRequired` mapuje nazwę pola na listę pól wymaganych w jego obecności. Kod rabatowy wymaga źródła rabatu; NIP wymaga nazwy firmy. Obok jest `dependentSchemas`: zamiast listy pól cały schemat stosowany, gdy pole występuje. <!-- twierdzenie --> <!-- zrodlo: validation §6.5.4; core §10.2.2.4 -->

```json schemat=zaleznosci
{
  "type": "object",
  "dependentRequired": { "kodRabatowy": ["zrodloRabatu"], "nip": ["nazwaFirmy"] }
}
```

```json dokument=kod-bez-zrodla schemat=zaleznosci oczekiwane=odrzucony
{ "kodRabatowy": "WIOSNA10" }
```

```json dokument=bez-kodu schemat=zaleznosci oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

> **W draft-07:** oba warianty były jednym słowem `dependencies`: lista pól albo schemat, zależnie od tego, co wpisano. W 2020-12 rozdzielono je na `dependentRequired` (lista) i `dependentSchemas` (schemat), żeby nie zgadywać po kształcie wartości.
