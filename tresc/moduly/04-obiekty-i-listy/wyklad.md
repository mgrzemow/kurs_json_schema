Do tej pory sprawdzaliśmy pojedyncze wartości. Zamówienie to jednak obiekt z polami, w których siedzą kolejne obiekty i listy. Ten moduł jest o tym, jak schemat opisuje strukturę, i jest najważniejszym modułem kursu, bo tu powstaje większość błędów w prawdziwych schematach.

## Obiekt to zbiór nazwanych pól

Dla analityka obiekt to formularz: każde pole ma nazwę i wartość. Dla programisty to mapa albo słownik: nazwa → wartość. Nazwy są tekstami i nie powinny się powtarzać, kolejność nie ma znaczenia, a wartość może być kolejnym obiektem. Stąd zagnieżdżenie: zamówienie ma klienta, klient ma adres, adres ma kod pocztowy. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §4; core §4.2.1 -->

<svg class="drzewo" viewBox="0 0 640 230" role="img" aria-label="Drzewo zamówienia: zamowienie zawiera numer, klient i pozycje; klient zawiera nazwa, email i adres; adres zawiera ulica, miasto, kodPocztowy">
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M320 40 V60 H110 V80"/><path d="M320 60 V80"/><path d="M320 60 H530 V80"/>
    <path d="M320 110 V130 H200 V150"/><path d="M320 130 V150"/><path d="M320 130 H440 V150"/>
    <path d="M440 180 V200 H340 V215"/><path d="M440 200 V215"/><path d="M440 200 H560 V215"/>
  </g>
  <g class="wezel" font-family="ui-monospace, monospace" font-size="13" text-anchor="middle">
    <rect x="260" y="10" width="120" height="30" rx="6"/><text x="320" y="30">zamowienie</text>
    <rect x="60" y="80" width="100" height="30" rx="6"/><text x="110" y="100">numer</text>
    <rect x="270" y="80" width="100" height="30" rx="6"/><text x="320" y="100">klient</text>
    <rect x="480" y="80" width="100" height="30" rx="6"/><text x="530" y="100">pozycje [ ]</text>
    <rect x="150" y="150" width="100" height="30" rx="6"/><text x="200" y="170">nazwa</text>
    <rect x="270" y="150" width="100" height="30" rx="6"/><text x="320" y="170">email</text>
    <rect x="390" y="150" width="100" height="30" rx="6"/><text x="440" y="170">adres</text>
    <rect x="290" y="215" width="100" height="30" rx="6"/><text x="340" y="235">ulica</text>
    <rect x="390" y="215" width="100" height="30" rx="6"/><text x="440" y="235">miasto</text>
    <rect x="500" y="215" width="120" height="30" rx="6"/><text x="560" y="235">kodPocztowy</text>
  </g>
</svg>

To drzewo wróci za chwilę, bo schemat ma dokładnie ten sam kształt.

## Schemat obiektu to lustro dokumentu

Każdy poziom zagnieżdżenia w dokumencie ma swój poziom w schemacie, z własnym `type: "object"`, własnym `properties` i własnym `required`. `properties` to mapa: nazwa pola → **schemat** tej wartości. Nie wartość, nie nazwa typu, tylko cały schemat w nawiasach klamrowych. <!-- twierdzenie --> <!-- zrodlo: core §10.3.2.1 -->

```json lustro=klient strona=dokument
{
  "numer": "ZAM-2026-000123",
  "klient": {
    "nazwa": "Serwis Rowerowy Pedał",
    "adres": {
      "miasto": "Gdańsk",
      "kodPocztowy": "80-827"
    }
  }
}
```

```json lustro=klient strona=schemat
{
  "type": "object",
  "properties": {
    "numer": { "type": "string" },
    "klient": {
      "type": "object",
      "properties": {
        "nazwa": { "type": "string" },
        "adres": {
          "type": "object",
          "properties": {
            "miasto": { "type": "string" },
            "kodPocztowy": { "type": "string" }
          },
          "required": ["miasto", "kodPocztowy"]
        }
      },
      "required": ["nazwa", "adres"]
    }
  },
  "required": ["numer", "klient"]
}
```

Kolor tła oznacza poziom zagnieżdżenia: to, co w dokumencie jest na drugim poziomie (klient), w schemacie siedzi w `properties` → `klient`, a jego pola w `properties` → `klient` → `properties`. Schemat jest dłuższy niż dokument, bo każde pole dostaje opis, ale kształt jest ten sam.

### Trzy najczęstsze błędy strukturalne

Każdy z nich trener pokazuje osobnym komunikatem. Warto je rozpoznawać, bo walidator w systemie magazynu dwóch z nich nie zgłosi.

**1. Nazwa typu zamiast schematu.** `"numer": "string"` zamiast `"numer": {"type": "string"}`. To niepoprawny schemat; trener mówi „zamiast schematu jest samo `"string"`”.

```json
{
  "type": "object",
  "properties": {
    "numer": "string"
  }
}
```

**2. Pola obok `type` zamiast w `properties`.** Schemat jest poprawny, a `miasto` jest nieznanym słowem, które walidator ignoruje (moduł 2). Trener mówi „przenieś do `properties`”. Walidator w magazynie nie powie nic i przepuści wszystko. <!-- twierdzenie --> <!-- zrodlo: core §4.3.1 -->

```json schemat=pola-obok
{
  "type": "object",
  "miasto": { "type": "string" },
  "kodPocztowy": { "type": "string" }
}
```

```json dokument=pola-obok-liczba schemat=pola-obok oczekiwane=przechodzi
{ "miasto": 123, "kodPocztowy": false }
```

**3. `required: true` wewnątrz pola.** Nawyk z draft-03 i z niektórych narzędzi. W 2020-12 `required` to lista nazw przy obiekcie, a `true` w polu to błąd schematu. Trener go odrzuci; część walidatorów po cichu zignoruje i nic nie będzie wymagane. <!-- twierdzenie --> <!-- zrodlo: validation §6.5.3 -->

```json
{
  "type": "object",
  "properties": {
    "numer": { "type": "string", "required": true }
  }
}
```

### Czytanie schematu: trzy pytania

Kto częściej czyta schematy, niż je pisze, zadaje każdemu obiektowi w schemacie trzy pytania:

1. **Które pola są wymagane?** Szukaj `required` na tym samym poziomie, co `properties`.
2. **Co przyjmuje to pole?** Idź do `properties` → nazwa pola i czytaj jego schemat.
3. **Czy obce pole przejdzie?** Szukaj `additionalProperties` na tym poziomie; jeśli go nie ma, przejdzie.

Te trzy pytania wracają w ćwiczeniu „Schemat od dostawcy”.

## `required` na każdym poziomie

`required` to lista nazw pól obok `properties`. Wymaga **obecności** pola, nie mówi nic o wartości; wartość sprawdza schemat pola. Para niuansu, od której zaczyna się większość nieporozumień: <!-- twierdzenie --> <!-- zrodlo: validation §6.5.3 -->

```json schemat=tylko-properties
{ "type": "object", "properties": { "klient": { "type": "string" } } }
```

```json schemat=z-required
{ "type": "object", "properties": { "klient": { "type": "string" } }, "required": ["klient"] }
```

```json dokument=bez-klienta-tylko-properties schemat=tylko-properties oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

```json dokument=bez-klienta-z-required schemat=z-required oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

`properties` opisuje, **jak** pole ma wyglądać, jeśli jest. `required` mówi, **że** ma być.

`required` działa tylko na swoim poziomie. `required: ["klient"]` na zamówieniu wymaga pola `klient`, ale nie wymaga `email` w kliencie; to robi dopiero `required` wewnątrz schematu klienta. Na lustrze wyżej widać trzy osobne listy `required`, po jednej na poziom.

Nazwa w `required` bez odpowiednika w `properties` jest poprawna (walidator wymaga pola o dowolnej wartości), ale prawie zawsze to literówka; trener ostrzega.

Pusty obiekt `{}` bez `required` przechodzi. Gdy nazwy pól nie są z góry znane, pusty obiekt odrzuca `minProperties: 1`. <!-- twierdzenie --> <!-- zrodlo: validation §6.5.2 -->

**Przejdzie czy nie?** Schemat `z-required` i dokument poniżej (klient jest, choć pusty).

```json pytanie=klient-pusty schemat=z-required oczekiwane=odrzucony
{ "klient": {} }
```

```odpowiedz
Odrzucony, ale nie przez `required`: pole `klient` jest. Odrzuca go `type: "string"` w schemacie klienta, bo `{}` to obiekt. `required` sprawdza obecność, `properties` wartość; tu zadziałało to drugie.
```

## Nadmiarowe pola: `additionalProperties`

Domyślnie obiekt może mieć dowolne dodatkowe pola. Skutek: literówka `adrs` zamiast `adres` przechodzi bez słowa, a magazyn nie dostaje adresu. `additionalProperties: false` zamyka obiekt: dozwolone są tylko pola wymienione w `properties` (i pasujące do `patternProperties`, o którym za chwilę). <!-- twierdzenie --> <!-- zrodlo: core §10.3.2.3 -->

```json schemat=otwarty
{ "type": "object", "properties": { "adres": { "type": "string" } }, "required": ["adres"] }
```

```json schemat=zamkniety
{ "type": "object", "properties": { "adres": { "type": "string" } }, "required": ["adres"], "additionalProperties": false }
```

```json dokument=literowka-otwarty schemat=otwarty oczekiwane=odrzucony
{ "adrs": "Długa 5" }
```

```json dokument=literowka-zamkniety schemat=zamkniety oczekiwane=odrzucony
{ "adrs": "Długa 5" }
```

Oba odrzucone, bo `adres` jest wymagany. Różnica wychodzi, gdy literówka dotyczy pola opcjonalnego:

```json dokument=uwgi-otwarty schemat=otwarty oczekiwane=przechodzi
{ "adres": "Długa 5", "uwgi": "domofon 3" }
```

```json dokument=uwgi-zamkniety schemat=zamkniety oczekiwane=odrzucony
{ "adres": "Długa 5", "uwgi": "domofon 3" }
```

`additionalProperties` może być też schematem, np. `{"type": "string"}`: dodatkowe pola wolno, ale tylko tekstowe. Obok jest `patternProperties`: schematy dla pól, których nazwy pasują do wzorca (np. wszystkie pola `x-...`). Rzadko potrzebne, bez ćwiczenia. <!-- twierdzenie --> <!-- zrodlo: core §10.3.2.2 -->

Zamknięcie działa tylko na swoim poziomie: zamknięte zamówienie nie zamyka adresu w środku. Każdy obiekt zamyka się osobno.

Kiedy zamykać: komunikat do systemu, który odrzuca nieznane pola (etykieta kurierska), albo gdy literówki są kosztowne. Kiedy nie: dane, które mają rosnąć bez zmiany schematu, i wszystko, co przechodzi przez kilka wersji systemów. Odwołanie do przodu: `additionalProperties: false` w połączeniu z `allOf` potrafi odrzucić wszystko; wrócimy do tego w module 6.

## Obiekt jako słownik

Drugi sposób użycia obiektu: klucze nie są znane z góry, bo są danymi. Stan magazynu to mapa EAN → liczba sztuk:

```json
{ "5901234123457": 12, "5901234123464": 0 }
```

W `properties` nie da się tego opisać, bo nie wiadomo, jakie będą klucze. Schemat słownika składa się z trzech słów: `additionalProperties` ze schematem **wartości**, `propertyNames` ze schematem **kluczy** (klucz jest tekstem, więc działa na nim `pattern`), `minProperties`, żeby słownik nie był pusty. <!-- twierdzenie --> <!-- zrodlo: core §10.3.2.3, §10.3.2.4; validation §6.5.2 -->

```json schemat=slownik
{
  "type": "object",
  "additionalProperties": { "type": "integer", "minimum": 0 },
  "propertyNames": { "pattern": "^[0-9]{13}$" },
  "minProperties": 1
}
```

```json dokument=stan-ok schemat=slownik oczekiwane=przechodzi
{ "5901234123457": 12, "5901234123464": 0 }
```

```json dokument=stan-zly-klucz schemat=slownik oczekiwane=odrzucony
{ "SZP.36": 12 }
```

```json dokument=stan-zla-wartosc schemat=slownik oczekiwane=odrzucony
{ "5901234123457": "12" }
```

Kiedy lista obiektów, a kiedy słownik: lista, gdy element ma kilka atrybutów, kolejność ma znaczenie albo klucz może się powtórzyć; słownik, gdy klucz jest z natury unikalny i chcemy szybko trafić po kluczu. Pozycje zamówienia to lista (ten sam EAN może wystąpić w dwóch liniach, pozycja ma ilość i cenę); stan magazynu to słownik.

> **W draft-07:** identycznie; `propertyNames` pojawiło się w draft-06, więc w draft-04 trzeba było radzić sobie `patternProperties`.

## `null` kontra brak pola kontra pusty tekst

Najpierw trzy schematy, które rozróżniają trzy sytuacje: pole wymagane i tekstowe; pole wymagane, ale dopuszczające `null`; pole opcjonalne, ale niepuste.

```json schemat=uwagi-wymagane-tekst
{ "properties": { "uwagi": { "type": "string" } }, "required": ["uwagi"] }
```

```json schemat=uwagi-wymagane-lub-null
{ "properties": { "uwagi": { "type": ["string", "null"] } }, "required": ["uwagi"] }
```

```json schemat=uwagi-opcjonalne-niepuste
{ "properties": { "uwagi": { "type": "string", "minLength": 1 } } }
```

Teraz trzy zamówienia, które wyglądają podobnie, a są trzema różnymi sytuacjami (sprawdzone pierwszym schematem):

```json dokument=uwagi-brak schemat=uwagi-wymagane-tekst oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

```json dokument=uwagi-null schemat=uwagi-wymagane-tekst oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123", "uwagi": null }
```

```json dokument=uwagi-puste schemat=uwagi-wymagane-tekst oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123", "uwagi": "" }
```

Pierwszy nie ma pola. Drugi ma pole z wartością `null`, czyli „wiemy, że nie ma uwag”. Trzeci ma pole z pustym tekstem. O każdej z tych sytuacji decyduje inne słowo: o obecności pola `required`, o `null` wpis `"null"` na liście typów, o pustym tekście `minLength`. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.1, §6.5.3, §6.3.2 -->

Werdykty policzone walidatorem dla pozostałych kombinacji:

```json dokument=uwagi-brak-lub-null schemat=uwagi-wymagane-lub-null oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

```json dokument=uwagi-null-lub-null schemat=uwagi-wymagane-lub-null oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123", "uwagi": null }
```

```json dokument=uwagi-puste-lub-null schemat=uwagi-wymagane-lub-null oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123", "uwagi": "" }
```

```json dokument=uwagi-brak-opcjonalne schemat=uwagi-opcjonalne-niepuste oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

```json dokument=uwagi-null-opcjonalne schemat=uwagi-opcjonalne-niepuste oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123", "uwagi": null }
```

```json dokument=uwagi-puste-opcjonalne schemat=uwagi-opcjonalne-niepuste oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123", "uwagi": "" }
```

Zasada projektowa dla autorów: najpierw odpowiedz na pytania biznesowe („czy pole może nie istnieć? czy może być puste? czy brak informacji to `null`?”), potem dobierz słowa. Zasada dla czytających: jeśli schemat nie ma `required` i `minLength`, to „wymagane” w dokumentacji nic nie znaczy.

**Przejdzie czy nie?** Powtórka: schemat `uwagi-wymagane-lub-null` i dokument z `"uwagi": null`.

```odpowiedz
Przechodzi, bo `null` jest na liście typów, a pole jest obecne.
```

## Listy: `items`, `minItems`/`maxItems`, `uniqueItems`, `contains`, `prefixItems`

### `items` i liczba elementów

`items` to schemat, który musi spełnić **każdy** element listy. Pozycje zamówienia to lista obiektów z `ean`, `ilosc` i `cena`. `minItems: 1`, bo zamówienie bez pozycji nie ma sensu; pusta lista `[]` jest poprawną listą, więc bez `minItems` przechodzi. `maxItems` ogranicza liczbę pozycji w jednej przesyłce. <!-- twierdzenie --> <!-- zrodlo: core §10.3.1.2; validation §6.4.1, §6.4.2 -->

```json schemat=pozycje
{
  "type": "array",
  "minItems": 1,
  "items": {
    "type": "object",
    "properties": { "ean": { "type": "string" }, "ilosc": { "type": "integer" } },
    "required": ["ean", "ilosc"]
  }
}
```

```json dokument=pozycje-puste schemat=pozycje oczekiwane=odrzucony
[]
```

```json dokument=pozycje-bez-ilosci schemat=pozycje oczekiwane=odrzucony
[{ "ean": "5901234123457" }]
```

### `uniqueItems`

`uniqueItems: true` odrzuca listę z dwiema równymi wartościami. Równość dotyczy całych wartości: dla tekstów litera po literze, dla obiektów pole po polu. Niuans na pozycjach: dwie pozycje z tym samym EAN, ale inną ilością, to różne obiekty, więc `uniqueItems` ich nie wyłapie. <!-- twierdzenie --> <!-- zrodlo: validation §6.4.3; core §4.2.2 -->

```json schemat=unikalne
{ "type": "array", "uniqueItems": true }
```

```json dokument=kody-powtorzone schemat=unikalne oczekiwane=odrzucony
["WIOSNA10", "WIOSNA10"]
```

```json dokument=pozycje-ten-sam-ean schemat=unikalne oczekiwane=przechodzi
[{ "ean": "5901234123457", "ilosc": 2 }, { "ean": "5901234123457", "ilosc": 3 }]
```

### `contains`

`contains` wymaga, żeby **co najmniej jeden** element pasował do schematu, a reszta może być dowolna. Zamówienie dla magazynu musi mieć co najmniej jedną pozycję typu `produkt`; sama usługa montażu nie jest zamówieniem dla magazynu. `minContains` i `maxContains` doprecyzowują liczbę pasujących. <!-- twierdzenie --> <!-- zrodlo: core §10.3.1.3; validation §6.4.4, §6.4.5 -->

```json schemat=co-najmniej-produkt
{ "type": "array", "contains": { "properties": { "typ": { "const": "produkt" } }, "required": ["typ"] } }
```

```json dokument=same-uslugi schemat=co-najmniej-produkt oczekiwane=odrzucony
[{ "typ": "usluga", "nazwa": "montaż" }]
```

```json dokument=produkt-i-usluga schemat=co-najmniej-produkt oczekiwane=przechodzi
[{ "typ": "usluga", "nazwa": "montaż" }, { "typ": "produkt", "ean": "5901234123457" }]
```

### `prefixItems`

Krotka to lista o ustalonych pozycjach: wymiary paczki `[długość, szerokość, wysokość]` w centymetrach. `prefixItems` podaje schemat dla każdej pozycji po kolei, `items: false` zabrania czwartego elementu, `minItems: 3` wymusza komplet. <!-- twierdzenie --> <!-- zrodlo: core §10.3.1.1, §10.3.1.2 -->

```json schemat=wymiary
{
  "type": "array",
  "prefixItems": [{ "type": "number", "exclusiveMinimum": 0 }, { "type": "number", "exclusiveMinimum": 0 }, { "type": "number", "exclusiveMinimum": 0 }],
  "items": false,
  "minItems": 3
}
```

```json dokument=wymiary-ok schemat=wymiary oczekiwane=przechodzi
[60, 40, 30]
```

```json dokument=wymiary-cztery schemat=wymiary oczekiwane=odrzucony
[60, 40, 30, 5]
```

> **W draft-07:** krotkę zapisywało się tablicą schematów w `items`, a dodatkowe elementy kontrolował `additionalItems`. W 2020-12 tablica w `items` nie jest poprawnym schematem; to jeden z czterech sygnałów starego schematu z modułu 2.

**Przejdzie czy nie?** Powtórka: schemat `unikalne` i lista dwóch pozycji z tym samym EAN i różną ilością.

```odpowiedz
Przechodzi, bo obiekty różnią się ilością, więc nie są równe.
```
