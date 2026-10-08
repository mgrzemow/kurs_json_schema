# Moduł 9: Praktyczne zastosowania JSON Schema (15 min) — opis sekcji

Status: propozycja do akceptacji. Wyłącznie wykład. Lista obszarów zaakceptowana 2026-10-08 do omówienia: 1, 2, 3, 5, 6 szerzej (po 2–3 min), 4 i 7 jednym akapitem, 8 tylko w materiałach. Na końcu informacja o materiałach (1 min). Każdy obszar ma ten sam układ: gdzie uczestnik to spotka, co jest specyficzne, jedno zdanie z domeny zamówienia.

## Sekcja 9.1: Kontrakty API: OpenAPI (3 min)

- Opis API w OpenAPI zawiera schematy w `components/schemas`, a ścieżki odwołują się do nich przez `$ref` (`#/components/schemas/Zamowienie`). Przykład w wykładzie: `POST /zamowienia` z zamówieniem z kursu jako treścią żądania (fragment YAML/JSON, bez „Otwórz w edytorze”).
- Specyfika: OpenAPI 3.0 używa własnego dialektu bliskiego draft-04 (`nullable: true` zamiast `["string", "null"]`, brak `$defs`, brak `if`/`then`); OpenAPI 3.1 to pełne 2020-12. Przy pracy z 3.0 schemat z kursu trzeba „cofnąć”; przy 3.1 wkleić. `readOnly`/`writeOnly` z modułu 5 mają tu swoje źródło. (Źródła poza `spec/`: specyfikacja OpenAPI 3.0.3 §4.7.24, 3.1.0 §4.8.24; cytowane jako „poza repozytorium”.)
- Zdanie z domeny: ten sam schemat zamówienia opisuje żądanie sklepu i odpowiedź magazynu.

## Sekcja 9.2: Pliki konfiguracyjne i podpowiedzi w edytorach (2 min)

- SchemaStore: katalog schematów dla setek formatów konfiguracji; VS Code i inne edytory dobierają schemat po nazwie pliku albo po `$schema` i dają podpowiedzi, opisy po najechaniu i podkreślenia błędów. Uczestnik już to widział: trener robi to samo własnym schematem podpowiedzi.
- Specyfika: tu rządzi draft-07, bo takie jest wsparcie edytorów; własne schematy konfiguracji można podpiąć przez `$schema` w pliku albo w ustawieniach edytora.
- Zdanie z domeny: plik konfiguracji integracji sklep–magazyn z podpowiedziami w edytorze.

## Sekcja 9.3: Walidacja w kodzie (3 min)

- Biblioteki: Ajv (JavaScript), `jsonschema` (Python), networknt i everit (Java), JsonSchema.Net (.NET). Fragment kodu w Pythonie (3 linie: `validate(instance, schema)`) i w JavaScripcie (Ajv), bez uruchamiania.
- Specyfika: różne biblioteki wspierają różne wersje, inaczej traktują `format` (moduł 5) i mają różne dialekty wyrażeń regularnych (moduł 3). Przed wdrożeniem: ten sam zestaw przykładów „musi przejść / musi zostać odrzucony” uruchomić w docelowej bibliotece. To dokładnie to, co trener robi na kursie.
- Zdanie z domeny: magazyn sprawdza zamówienie na wejściu i odsyła komunikat z listą błędów.

## Sekcja 9.4: Schematy z kodu i kod ze schematów (1 akapit)

- Pydantic, Zod, klasy Java i .NET generują schemat z typów; quicktype generuje typy ze schematu. Specyfika: schemat z kodu opisuje typy, nie reguły biznesowe (moduł 8), a wersja zależy od biblioteki.

## Sekcja 9.5: Komunikaty i zdarzenia (2 min)

- Kolejki i strumienie: Kafka Schema Registry (obsługuje JSON Schema obok Avro), AsyncAPI (opis zdarzeń jak OpenAPI dla API), CloudEvents. Specyfika: producent i konsument zmieniają się w różnym czasie, więc liczy się **zgodność wstecz**: dodawanie pól opcjonalnych jest bezpieczne, dodawanie do `required` i zamykanie obiektów (`additionalProperties: false`) łamie starych producentów.
- Zdanie z domeny: zdarzenie „zamówienie opłacone” wysyłane do magazynu i księgowości; schemat wersjonowany w `$id`.

## Sekcja 9.6: Ustrukturyzowane odpowiedzi modeli AI (2 min)

- Definicje narzędzi i wymuszanie formatu odpowiedzi w API modeli językowych opisuje się JSON Schema; model ma zwrócić dokument zgodny ze schematem. Specyfika: dostawcy obsługują podzbiór słów (zwykle bez `pattern`, `format`, `minimum`), często wymagają `additionalProperties: false` i pełnego `required`, a wynik i tak warto sprawdzić walidatorem po stronie aplikacji. (Źródła poza `spec/`: dokumentacje dostawców; bez nazw konkretnych wersji modeli w tekście, żeby nie starzał się w rok.)
- Zdanie z domeny: model wyciąga zamówienie z maila klienta do dokumentu zgodnego ze schematem zamówienia, a walidator sprawdza wynik przed wysłaniem do magazynu.

## Sekcja 9.7: Formularze ze schematu (1 akapit)

- Biblioteki generujące formularz z JSON Schema (react-jsonschema-form, JSON Forms): `title`, `description`, `enum`, `default` z modułu 5 stają się etykietami, listami wyboru i wartościami początkowymi. Adnotacje nabierają sensu.

## Sekcja 9.8: Bazy danych (tylko w materiałach)

- MongoDB sprawdza dokumenty własnym wariantem `$jsonSchema`; Kubernetes opisuje własne zasoby „strukturalnym” podzbiorem OpenAPI. Specyfika: dialekty i podzbiory, nie pełna specyfikacja.

## Sekcja 9.9: Materiały i co dalej (1 min)

- Co dostaną po kursie: PDF/HTML z wykładem, wszystkimi ćwiczeniami (także niezrobionymi) i rozwiązaniami w dodatku, ściągawka słów kluczowych z kolumną „w draft-07”, lista kontrolna z modułu 8.
- Gdzie szukać dalej: json-schema.org (specyfikacja i „Understanding JSON Schema”), oficjalny zestaw testów jako wyrocznia przy sporach, dokumentacja własnej biblioteki walidacji.

## Uwagi do decyzji

- Anegdoty: w tym module nie planuję żadnej, bo każda wymagałaby źródła, którego nie mam w repozytorium; jeśli chcesz, dodam jedną o SchemaStore (historia katalogu) po znalezieniu źródła.
- Fragmenty kodu (Python, JavaScript) są ilustracją; nie testujemy ich w CI.
