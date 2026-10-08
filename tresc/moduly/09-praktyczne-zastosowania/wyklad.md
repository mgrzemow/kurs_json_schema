Ostatni moduł jest wyłącznie wykładem: gdzie JSON Schema spotyka się w praktyce i co w każdym z tych miejsc jest specyficzne. Każdy obszar ma ten sam układ: gdzie, co jest inne i jak to wygląda na przykładzie zamówień. Twierdzenia o zewnętrznych narzędziach pochodzą z ich dokumentacji.

## Kontrakty API: OpenAPI

Opis API w OpenAPI wylicza ścieżki, czyli adresy w API (np. `/zamowienia`), i dla każdej mówi, jakie żądania przyjmuje i jakie odpowiedzi zwraca. Żądanie to komunikat wysłany do systemu, odpowiedź to to, co system odsyła. Schematy danych stoją w `components/schemas`, a ścieżki odwołują się do nich przez `$ref`. Nasze zamówienie jako treść żądania `POST /zamowienia`, którym sklep zakłada zamówienie w magazynie:

```yaml
paths:
  /zamowienia:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Zamowienie"
components:
  schemas:
    Zamowienie:
      type: object
      required: [numer, klient, pozycje]
      properties:
        numer: { type: string, pattern: "^ZAM-[0-9]{4}-[0-9]{6}$" }
```

Specyfika: **OpenAPI 3.0** używa własnego dialektu bliskiego draft-04: `nullable: true`{s} zamiast `["string", "null"]`{s}, brak `$defs`, brak `if`/`then`, własne `discriminator` zamiast pola rozróżniającego z `const`. **OpenAPI 3.1** to pełne 2020-12: schemat z kursu da się wkleić bez zmian. Przy pracy z 3.0 schemat trzeba „cofnąć” o kilka słów (ramki „W draft-07” z kursu pokazują które); przy 3.1 nie trzeba nic. `readOnly` i `writeOnly` z modułu 5 mają w OpenAPI praktyczne znaczenie: OpenAPI ustala, że pole `readOnly` nie jest wymagane w żądaniu, a `writeOnly` nie pojawia się w odpowiedzi. To reguła OpenAPI, nie JSON Schema: walidator JSON Schema traktuje oba słowa jako adnotacje i nie zmienia przez nie działania `required`. (Źródła: specyfikacje OpenAPI 3.0.3 i 3.1.0, rozdziały o Schema Object, poza repozytorium.)

Zdanie z domeny: ten sam schemat zamówienia opisuje żądanie sklepu i odpowiedź magazynu, a dokumentacja w Swagger UI (interaktywnej stronie WWW z opisem API) powstaje z niego automatycznie.

## Pliki konfiguracyjne i podpowiedzi w edytorach

SchemaStore to katalog schematów dla setek formatów konfiguracji (pakiety npm, pliki CI opisujące automatyczne sprawdzenia po każdej zmianie, ustawienia edytorów). VS Code (popularny edytor programistyczny) i inne edytory dobierają schemat po nazwie pliku albo po `$schema` w pliku i dają podpowiedzi, opisy po najechaniu i podkreślenia błędów. Edytor na tej stronie robi dokładnie to samo, tyle że z własnym schematem podpowiedzi.

Specyfika: tu rządzi draft-07, bo takie jest wsparcie edytorów, i SchemaStore wprost je zaleca. Własny schemat konfiguracji podpina się przez `$schema` w pliku albo w ustawieniach edytora; od tej chwili każdy, kto edytuje plik, dostaje podpowiedzi. (Źródło: SchemaStore, przewodnik dla autorów, poza repozytorium.)

Zdanie z domeny: plik konfiguracji integracji sklep–magazyn (adresy, limity, mapowanie statusów) z podpowiedziami i walidacją w edytorze, zanim ktoś wdroży literówkę.

## Walidacja w kodzie

Programista nie pisze walidatora sam, tylko dołącza do programu gotową bibliotekę: Ajv (JavaScript), `jsonschema` (Python), networknt i everit (Java), JsonSchema.Net (.NET). Dwa fragmenty, tylko do przeczytania:

```python
from jsonschema import Draft202012Validator
Draft202012Validator(schemat).validate(zamowienie)            # rzuca jeden wyjątek: pierwszy błąd
bledy = list(Draft202012Validator(schemat).iter_errors(zamowienie))  # wszystkie błędy
```

```js
import Ajv2020 from "ajv/dist/2020";
const sprawdz = new Ajv2020({ allErrors: true }).compile(schemat);
if (!sprawdz(zamowienie)) console.log(sprawdz.errors);
```

Specyfika: różne biblioteki wspierają różne wersje, inaczej traktują `format` (moduł 5) i mają różne dialekty wyrażeń regularnych (moduł 3). Komunikaty błędów są po angielsku i techniczne; na tej stronie były tłumaczone na polski, biblioteka w magazynie tego nie zrobi. Rada praktyczna: ten sam zestaw przykładów „musi przejść / musi zostać odrzucony”, którego używaliśmy w ćwiczeniach, uruchomić w docelowej bibliotece przed wdrożeniem. To jest test kontraktu i nie wymaga pisania schematu dwa razy.

Zdanie z domeny: magazyn sprawdza zamówienie na wejściu i odsyła komunikat z listą błędów; sklep uruchamia ten sam schemat w testach, zanim wyśle.

## Schematy z kodu i kod ze schematów

Pydantic, Zod, klasy Java i .NET generują schemat z typów; quicktype generuje typy ze schematu. Schemat z kodu opisuje typy, nie reguły biznesowe (moduł 8), a wersja zależy od biblioteki. Kod ze schematu daje programiście klasy, czyli gotowe struktury w kodzie do pracy z zamówieniem, ale reguły spoza typów (wzorce, warunki) zostają tylko w schemacie i trzeba je sprawdzać walidatorem.

## Komunikaty i zdarzenia

Systemy nie zawsze rozmawiają ze sobą bezpośrednio. Często jeden zostawia komunikat o zdarzeniu („zamówienie opłacone”) w kolejce, jak list w skrzynce, a inne odbierają go we własnym tempie; technicznie to kolejki i strumienie komunikatów. Schema Registry firmy Confluent, używany z Kafką, obsługuje JSON Schema obok Avro i Protobuf (dwóch innych formatów opisu danych), AsyncAPI opisuje zdarzenia tak, jak OpenAPI opisuje API, CloudEvents definiuje kopertę zdarzenia, czyli wspólne pola wokół treści (m.in. skąd zdarzenie pochodzi i jakiego jest typu). Specyfika: producent (system, który wysyła) i konsument (system, który odbiera) zmieniają się w różnym czasie, więc liczy się **zgodność wstecz**: nowa wersja schematu nie może zepsuć systemów, które jeszcze działają według starej. Dodanie pola opcjonalnego jest bezpieczne. Dodanie pola do `required`, zamknięcie obiektu przez `additionalProperties: false`{s} albo zawężenie `enum` łamie starych producentów albo konsumentów. Schema Registry potrafi odrzucić nową wersję schematu, która nie jest zgodna z poprzednią. (Źródła: dokumentacja Confluent Schema Registry, AsyncAPI, CloudEvents, poza repozytorium.)

Zdanie z domeny: zdarzenie „zamówienie opłacone” wysyłane do magazynu i księgowości; schemat wersjonowany w `$id` (`.../zamowienie-oplacone/v2`), a konsumenci ignorują nowe pola opcjonalne.

## Ustrukturyzowane odpowiedzi modeli AI

Definicje narzędzi (działań, o których wykonanie model może poprosić aplikację) i wymuszanie formatu odpowiedzi w API modeli językowych opisuje się JSON Schema: model ma zwrócić dokument zgodny ze schematem. Specyfika: dostawcy obsługują **podzbiór** słów (zwykle bez `pattern`, `format`, `minimum`, czasem bez `oneOf`), często wymagają `additionalProperties: false`{s} i wszystkich pól w `required`, a schemat trzeba czasem uprościć, zanim zostanie przyjęty. Wynik i tak warto sprawdzić walidatorem po stronie aplikacji, bo „zgodny ze schematem” u dostawcy znaczy „zgodny z podzbiorem, który obsługuje”. (Źródła: dokumentacje dostawców modeli; celowo bez nazw wersji modeli, żeby ten akapit nie zestarzał się w rok.)

Zdanie z domeny: model wyciąga zamówienie z maila klienta do dokumentu zgodnego ze schematem zamówienia, a walidator sprawdza wynik przed wysłaniem do magazynu.

## Formularze ze schematu

Biblioteki generujące formularz z JSON Schema (react-jsonschema-form, JSON Forms, podobne w innych frameworkach, czyli zestawach narzędzi do budowy aplikacji): `title` staje się etykietą, `description` podpowiedzią, `enum` listą wyboru, `default` wartością początkową, `required` gwiazdką. Adnotacje z modułu 5 nabierają praktycznego sensu, a formularz do ręcznego wpisania zamówienia powstaje z tego samego pliku, co walidacja w magazynie.

## Bazy danych

Dla porządku, bez omawiania: MongoDB sprawdza dokumenty własnym wariantem `$jsonSchema` (podzbiór draft-04 z rozszerzeniami typów BSON, binarnego formatu, w którym MongoDB przechowuje dokumenty), a Kubernetes (platforma do uruchamiania aplikacji na wielu serwerach) opisuje własne zasoby „strukturalnym” podzbiorem schematu OpenAPI. Wspólna cecha: dialekty i podzbiory, nie pełna specyfikacja, więc schemat z kursu trzeba dopasować do narzędzia.

## Materiały i co dalej

Materiały w PDF i HTML zawierają wykład, wszystkie ćwiczenia (także niezrobione) z rozwiązaniami w dodatku na końcu, ściągawkę słów kluczowych z kolumną „w draft-07” i listę kontrolną z modułu 8.

Gdzie szukać dalej: json-schema.org (specyfikacja i przewodnik „Understanding JSON Schema”), oficjalny zestaw testów JSON-Schema-Test-Suite jako wyrocznia przy sporach o to, co powinien zrobić walidator, oraz dokumentacja własnej biblioteki walidacji, zwłaszcza rozdział o `format`.
