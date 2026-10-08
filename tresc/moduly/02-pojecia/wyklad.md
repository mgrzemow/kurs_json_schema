## Trzy pojęcia na jednym zamówieniu

Specyfikacja używa trzech słów, które warto odróżniać, bo potem pojawiają się w komunikatach walidatorów i w dokumentacji bibliotek.

### Dokument JSON

Dowolny tekst w formacie JSON z modułu 1: zamówienie, konfiguracja, odpowiedź API. Specyfikacja JSON Schema używa wymiennie słów „dokument JSON”, „tekst JSON” i „wartość JSON”, bo z jej punktu widzenia to to samo. <!-- twierdzenie --> <!-- zrodlo: core §4.1 -->

### Instancje

Instancja to dokument JSON w roli sprawdzanego: ten, do którego przykładamy schemat. To samo zamówienie jest „dokumentem”, gdy leży w pliku, i „instancją”, gdy walidator je sprawdza. Słowo pojawia się w komunikatach („instance is invalid”) i w nazwach opcji bibliotek. <!-- twierdzenie --> <!-- zrodlo: core §4.2 -->

### Dokument JSON Schema

Schemat to też dokument JSON, tylko z ustalonymi słowami kluczowymi. Ma to zaskakującą konsekwencję: schemat da się sprawdzić schematem. O tym za chwilę.

```json schemat=pojecia-schemat
{ "type": "object", "required": ["numer"] }
```

```json dokument=pojecia-instancja schemat=pojecia-schemat oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

Powyżej dokument JSON Schema (górny) i instancja (dolny). Oba są dokumentami JSON.

### Słowa kluczowe: asercje i adnotacje

Słowo kluczowe (keyword) to nazwa pola w schemacie, która coś znaczy dla walidatora: `type`, `required`, `minimum`. Specyfikacja dzieli słowa na kilka kategorii (są też identyfikatory i aplikatory, do których dojdziemy), a jedno słowo może należeć do kilku. Na razie interesują nas dwie. **Asercja** daje werdykt: `type: "string"` odrzuca liczbę. **Adnotacja** tylko opisuje: `title`, `description` niczego nie sprawdzają. Do adnotacji należy też, co zaskakuje, `format`; o tym w module 5. <!-- twierdzenie --> <!-- zrodlo: core §4.3.1, §7.6, §7.7; validation §7.2.1 -->

### Pułapka 1: nieznane słowa są po cichu ignorowane

Specyfikacja każe traktować nieznane słowa kluczowe jak adnotacje, czyli zbierać je i nic z nimi nie robić. Skutek: literówka w słowie kluczowym nie jest błędem. Schemat z `typ` zamiast `type` jest poprawny i przepuszcza wszystko. <!-- twierdzenie --> <!-- zrodlo: core §4.3.1 -->

```json schemat=literowka
{ "typ": "string" }
```

```json dokument=literowka-liczba schemat=literowka oczekiwane=przechodzi
42
```

Trener o tym ostrzega („czy chodziło o `type`?”), ale walidator w systemie magazynu nie powie ani słowa. Następna, stabilna wersja specyfikacji ma to zmienić i traktować nieznane słowa jako błąd; na razie trzeba uważać. (Źródło zapowiedzi poza repozytorium: json-schema.org, wpis „The last breaking change”, 2023.)

### Pułapka 2: pusty schemat przepuszcza wszystko

Schemat `{}` nie ma żadnej asercji, więc nie ma czego sprawdzać: przechodzi każdy dokument, także `null` i pusta lista. Schemat może być też samym `true` (to samo, co `{}`) albo `false`, które odrzuca wszystko. <!-- twierdzenie --> <!-- zrodlo: core §4.3.2 -->

```json schemat=pusty
{}
```

```json schemat=nic
false
```

```json dokument=pusty-zamowienie schemat=pusty oczekiwane=przechodzi
{ "numer": "ZAM-2026-000123" }
```

```json dokument=nic-zamowienie schemat=nic oczekiwane=odrzucony
{ "numer": "ZAM-2026-000123" }
```

**Przejdzie czy nie?** Schemat `{"reqired": ["numer"]}` i zamówienie bez numeru.

```json schemat=reqired
{ "reqired": ["numer"] }
```

```json pytanie=reqired schemat=reqired oczekiwane=przechodzi
{ "klient": "Jan Nowak" }
```

## Metaschematy i `$schema`

Skoro schemat jest dokumentem JSON, można napisać schemat, który sprawdza schematy. Taki schemat nazywa się **metaschematem**. Mówi on, że `type` przyjmuje jedną z siedmiu nazw, że `required` to lista tekstów, że `minimum` to liczba. Oficjalny metaschemat 2020-12 leży pod adresem `https://json-schema.org/draft/2020-12/schema` i składa się z kilku mniejszych metaschematów, po jednym dla każdego słownika (vocabulary). Słownik to zestaw słów kluczowych razem z ich znaczeniem: osobno słowa rdzenia, osobno aplikatory (`properties`, `items`), osobno walidacja (`minimum`, `pattern`), osobno adnotacje i kilka innych. <!-- twierdzenie --> <!-- zrodlo: core §4.3.4, §4.3.3, §8.1 -->

Fragment słownika walidacji, tylko do przeczytania (definicja `type` z pliku `meta/validation`):

```json
"type": {
  "anyOf": [
    { "$ref": "#/$defs/simpleTypes" },
    { "type": "array", "items": { "$ref": "#/$defs/simpleTypes" }, "minItems": 1, "uniqueItems": true }
  ]
},
"simpleTypes": {
  "enum": ["array", "boolean", "integer", "null", "number", "object", "string"]
}
```

Nic więcej o metaschematach nie trzeba wiedzieć poza jednym: słowo `$schema` w schemacie wskazuje metaschemat, czyli wersję (dialekt) JSON Schema, w której schemat jest napisany. Walidator po tym poznaje, jakimi regułami się kierować. Bez `$schema` walidator przyjmuje swoją domyślną wersję, a każdy walidator może mieć inną. Zalecenie na cały kurs: zawsze wpisuj `$schema`. <!-- twierdzenie --> <!-- zrodlo: core §8.1.1 -->

```json schemat=z-naglowkiem
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["numer"]
}
```

Trener sprawdza zawsze według 2020-12. Gdy `$schema` wskazuje inną wersję, pokazuje o tym informację pod edytorem. To ograniczenie narzędzia na potrzeby kursu, nie reguła specyfikacji.

## Wersje w pigułce

JSON Schema rozwijało się jako seria wersji roboczych (draft):

| Wersja | Rok | Co warto wiedzieć |
|---|---|---|
| draft-00 do draft-03 | 2009–2010 | prehistoria; `required: true` wewnątrz pola |
| draft-04 | 2013 | pierwsza szeroko wdrożona; `id` bez dolara |
| draft-06 | 2017 | `$id`, `exclusiveMinimum` jako liczba, `const` |
| draft-07 | 2018 | `if`/`then`/`else`; najczęściej spotykana w praktyce |
| 2019-09 | 2019 | przejściowa: `$defs`, `dependentRequired`, `unevaluated*` |
| 2020-12 | 2020 | aktualna, tej uczymy: `prefixItems`, słowa obok `$ref` działają |
| wersja stabilna | w przygotowaniu | bez zmian łamiących zgodność; według planów IETF nie wcześniej niż 2027 |

(Źródła poza repozytorium: json-schema.org/specification-links, datatracker.ietf.org/wg/jsonschema.)

**Dlaczego uczymy nowszej wersji, skoro w praktyce częściej spotyka się draft-07?** Draft-07 jest wszędzie, bo przez kilka lat nie było niczego nowszego, a edytory, generatory i OpenAPI 3.0 na nim stanęły. 2020-12 stopniowo go wypiera: OpenAPI 3.1 i nowe biblioteki walidacji wspierają ją w pełni, a następna wersja specyfikacji ma być stabilna, czyli bez zmian łamiących zgodność. Kto uczy się 2020-12, uczy się wersji, która zostanie standardem na długo. Kto zna 2020-12, przeczyta draft-07 bez trudu, bo różnice to kilka słów kluczowych; dlatego przy każdym takim słowie będzie w tym kursie ramka „W draft-07”. W drugą stronę jest trudniej: kto zna tylko draft-07, nie wie, czego mu brakuje.

**Jak rozpoznać stary schemat.** Cztery sygnały, każdy wystarczy:

1. `definitions` zamiast `$defs`.
2. `"exclusiveMinimum": true` obok `minimum` (draft-04); w nowszych to liczba.
3. `id` bez dolara (draft-04) zamiast `$id`.
4. Tablica w `items` (krotka) zamiast `prefixItems`.

Plus nagłówek: `"$schema": "http://json-schema.org/draft-07/schema#"` albo `draft-04`.

Jedno zdanie o OpenAPI, bo tam najczęściej spotyka się schematy: OpenAPI 3.0 używa własnego dialektu bliskiego draft-04, a OpenAPI 3.1 to pełne 2020-12. Szczegóły w module 9.

**Przejdzie czy nie?** To pytanie o rozpoznawanie, nie o werdykt: które z trzech nagłówków to aktualna wersja i po czym poznać pozostałe?

- `"$schema": "http://json-schema.org/draft-04/schema#"`
- `"$schema": "http://json-schema.org/draft-07/schema#"`
- `"$schema": "https://json-schema.org/draft/2020-12/schema"`

```odpowiedz
Aktualny jest trzeci. Stare mają `http`, myślnik po `draft` i `#` na końcu.
```

> **W draft-07:** nagłówek to `http://json-schema.org/draft-07/schema#` (z `http` i `#`). W 2020-12: `https://json-schema.org/draft/2020-12/schema`, bez `#`. Oba wpisujemy dosłownie, znak po znaku; wiele walidatorów nie rozpozna wersji zapisanej inaczej.
