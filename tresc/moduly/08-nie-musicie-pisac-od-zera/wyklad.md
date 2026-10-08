Siedem modułów temu zamówienie miało trzy pola. Teraz ma kilkanaście, z zagnieżdżeniami, listami i warunkami. Nikt nie chce pisać takiego schematu od zera, i nikt nie musi. Ten moduł jest o tym, skąd wziąć gotowy schemat i co z nim zrobić, zanim stanie się umową między systemami.

## Skąd wziąć schemat

Cztery źródła, każde daje coś innego i czegoś nie daje.

### Z przykładów

Generator (genson w Pythonie, quicktype, dziesiątki stron online) dostaje kilka dokumentów i opisuje to, co w nich zobaczył: typy pól, strukturę, które pola wystąpiły zawsze. Nie wie nic o regułach biznesowych: nie zgadnie, że status ma pięć wartości, a kod pocztowy wzorzec. Zaoszczędza pisanie `properties`, czyli najnudniejszą część.

### Z kodu

Programista i tak opisuje w kodzie, jak wygląda zamówienie: jakie ma pola i jakiego typu. Z takiej definicji typów schemat generują biblioteki: Pydantic w Pythonie, Zod i typy w TypeScripcie, adnotacje w Javie i .NET (znaczniki w kodzie, niezwiązane z adnotacjami JSON Schema). Dają strukturę i tyle reguł, ile programista zapisał w kodzie (często tylko typy). Wersja schematu zależy od biblioteki i bywa to draft-07; nagłówek `$schema` mówi, co dostaliśmy (moduł 2).

### Z XSD

Konwertery przenoszą strukturę i typy, ale z XML-owymi nawykami: atrybuty stają się polami, wszystko jest tekstem, a `minOccurs` (w XSD to on mówi, czy element jest obowiązkowy) czasem gubi się po drodze. Do przejrzenia pole po polu.

### Z modelu AI

Model językowy napisze schemat, który wygląda wiarygodnie, łącznie z `pattern` i `enum`. Problem w tym, że reguły biznesowe zgaduje, a zgaduje pewnie siebie. Schemat od modelu sprawdza się dokładnie tak samo jak wygenerowany z przykładów: przykładami, które muszą przejść i muszą zostać odrzucone.

### Wspólna zasada

Wspólna zasada: generator to punkt wyjścia, nie wynik. Najważniejsza pułapka brzmi: **generator opisuje to, co jest w przykładach, a nie to, co powinno być.**

## Co generatory robią źle

### Wynik genson

Trzy prawdziwe zamówienia z hurtowni (firmowe krajowe z fakturą, prywatne z kodem rabatowym, zagraniczne z EORI i usługą montażu) poszły do genson. Polecenie i jego wynik, bez żadnych poprawek: <!-- twierdzenie --> <!-- zrodlo: wynik genson 1.4.0 z 2026-10-08 zapisany w tresc/moduly/08-nie-musicie-pisac-od-zera/cwiczenia/8-1-popraw-wygenerowany/start.json; test tests/genson.test.mjs porównuje go z generatorem -->

```
genson -i 2 zamowienie-1.json zamowienie-2.json zamowienie-3.json
```

```json schemat=genson format=bez
{
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "properties": {
    "typDokumentu": { "type": "string" },
    "numer": { "type": "string" },
    "status": { "type": "string" },
    "waluta": { "type": "string" },
    "faktura": { "type": "boolean" },
    "klient": {
      "type": "object",
      "properties": {
        "numerKlienta": { "type": "string" },
        "nazwa": { "type": "string" },
        "nip": { "type": "string" },
        "email": { "type": "string" },
        "telefon": { "type": "string" }
      },
      "required": ["email", "nazwa", "numerKlienta"]
    },
    "pozycje": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ean": { "type": "string" },
          "nazwa": { "type": "string" },
          "ilosc": { "type": "integer" },
          "cena": { "type": "number" },
          "typ": { "type": "string" }
        },
        "required": ["cena", "ean", "ilosc", "nazwa"]
      }
    },
    "uwagi": { "type": ["null", "string"] },
    "wymiaryPaczki": { "type": "array", "items": { "type": "integer" } }
  },
  "required": ["adresDostawy", "dataZamowienia", "faktura", "klient", "numer", "pozycje", "status", "typDokumentu", "utworzono", "uwagi", "waluta"]
}
```

### Wady i poprawki

(Skrócone o adres i kilka pól; pełny wynik jest schematem startowym ćwiczenia końcowego.) Wady, każda jako para „co generator napisał” → „co powinno być”, z modułem, w którym to było:

| Generator napisał | Powinno być | Moduł |
|---|---|---|
| `"$schema": "http://json-schema.org/schema#"`{s} (bez wersji) | nagłówek 2020-12 | 2 |
| `uwagi` w `required`, bo było w każdym z trzech plików | magazyn przyjmuje zamówienia z kilku kanałów (sklep, telefon, EDI, czyli automatyczna wymiana dokumentów z systemami partnerów), a nie każdy wysyła uwagi: `uwagi` opcjonalne; `required` z wymagań, nie z obecności | 4 |
| `nip`, `kodRabatowy`, `eori` opcjonalne, bo w którymś pliku ich brakło | NIP wymagany przy fakturze, EORI poza Polską | 6 |
| `status`, `waluta`, `typ` jako zwykły `string` | `enum`, `const` | 3 |
| brak wzorców numeru, kodu pocztowego, NIP-u, EAN-u | `pattern` | 3 |
| `ilosc` i `cena` bez zakresów | `exclusiveMinimum`, `maximum` | 3 |
| `pozycje` bez `minItems` | `minItems: 1`{s} | 4 |
| `wymiaryPaczki` jako lista dowolnej liczby liczb całkowitych | krotka trzech liczb: `prefixItems`, `items: false`{s}, `minItems: 3`{s} | 4 |
| daty i e-mail jako `string` | `format` ze świadomością, że to adnotacja | 5 |
| brak `additionalProperties` gdziekolwiek | decyzja per obiekt | 4 |
| brak `title` i `description` | opisy dla ludzi | 5 |

Jedna rzecz wyszła akurat dobrze: `uwagi` jako `["null", "string"]`{s}, bo w jednym pliku było `null`. Gdyby we wszystkich trzech był tekst, generator napisałby `string` i `null` zacząłby odpadać.

**Przejdzie czy nie?** Przez schemat z genson: zamówienie 2 w oryginale i to samo zamówienie bez pola `uwagi`.

```json pytanie=zamowienie-2 schemat=genson oczekiwane=przechodzi
{
  "typDokumentu": "zamowienie",
  "numer": "ZAM-2026-000124",
  "status": "nowe",
  "waluta": "PLN",
  "faktura": false,
  "klient": {
    "numerKlienta": "00098765",
    "nazwa": "Jan Nowak",
    "email": "jan@example.com"
  },
  "adresDostawy": {
    "ulica": "Floriańska 12/3",
    "miasto": "Kraków",
    "kodPocztowy": "31-019",
    "kraj": "PL"
  },
  "pozycje": [
    {
      "ean": "5901234123471",
      "nazwa": "Łańcuch 11rz.",
      "ilosc": 1,
      "cena": 249
    }
  ],
  "uwagi": null,
  "kodRabatowy": "WIOSNA10",
  "dataZamowienia": "2026-10-08",
  "utworzono": "2026-10-08T11:02:33Z"
}
```

```json pytanie=zamowienie-2-bez-uwag schemat=genson oczekiwane=odrzucony
{
  "typDokumentu": "zamowienie",
  "numer": "ZAM-2026-000124",
  "status": "nowe",
  "waluta": "PLN",
  "faktura": false,
  "klient": {
    "numerKlienta": "00098765",
    "nazwa": "Jan Nowak",
    "email": "jan@example.com"
  },
  "adresDostawy": {
    "ulica": "Floriańska 12/3",
    "miasto": "Kraków",
    "kodPocztowy": "31-019",
    "kraj": "PL"
  },
  "pozycje": [
    {
      "ean": "5901234123471",
      "nazwa": "Łańcuch 11rz.",
      "ilosc": 1,
      "cena": 249
    }
  ],
  "kodRabatowy": "WIOSNA10",
  "dataZamowienia": "2026-10-08",
  "utworzono": "2026-10-08T11:02:33Z"
}
```

```odpowiedz
Pierwsze przechodzi. Drugie odrzucone, bo `uwagi` trafiło do `required`. Pierwsze zamówienie od klienta, który nie wpisał uwag, wywróciłoby integrację.
```

### Dla porównania: quicktype

Quicktype na tych samych plikach: `$schema` draft-06, definicje w `definitions` z `$ref`, `additionalProperties: false`{s} **wszędzie** (nadmiar: nowe pole w którymkolwiek systemie zepsuje kontrakt), zgadnięte `format: date`{s} i `date-time` (trafne, ale przypadkowe: zgadywanie po wyglądzie tekstu), `anyOf` z `null` zamiast listy typów. Inne narzędzie, inne wady, ta sama zasada.

**Generator** na tej stronie (link na stronie startowej) robi to samo, co genson: wklej własne dokumenty i zobacz, czego brakuje.

## Lista kontrolna poprawek

Dziesięć punktów do odhaczenia przy każdym wygenerowanym schemacie, niezależnie od źródła. Ta sama lista jest w ćwiczeniu końcowym (do odhaczania) i w materiałach.

1. `$schema` na 2020-12 albo świadomie wybrana wersja.
2. `required` według wymagań, nie według przykładów: co naprawdę musi być?
3. `enum` i `const` dla pól o zamkniętej liście wartości.
4. `pattern` dla identyfikatorów i kodów; `minLength` dla tekstów, które nie mogą być puste.
5. Zakresy liczb: `minimum`, `exclusiveMinimum`, `maximum`; `multipleOf` z ułamkiem tylko po sprawdzeniu w docelowej bibliotece (moduł 3).
6. Listy: `minItems`, `uniqueItems`, krotki jako `prefixItems`.
7. `null` kontra brak pola kontra pusty tekst, świadomie dla każdego pola.
8. `format` tam, gdzie ma sens, ze świadomością, że to adnotacja.
9. `additionalProperties`: decyzja per obiekt, nie automat.
10. `title` i `description` na schemacie i polach; `$defs` dla powtórzeń.

Ćwiczenie końcowe to przejście tej listy na prawdziwym wyniku genson. Zajmie więcej niż typowe ćwiczenie, bo zbiera wszystko z modułów 3–7; najważniejsze jest pierwsze pięć punktów.
