# Wiodący temat: zamówienie w hurtowni części rowerowych

Decyzja prowadzącego z 2026-10-08.

**Scenariusz.** Hurtownia części rowerowych sprzedaje firmom (serwisy, sklepy) i osobom prywatnym. Sklep internetowy wysyła **zamówienie** do systemu magazynowego. Schemat zamówienia to umowa między zespołem sklepu a zespołem magazynu: magazyn odrzuca zamówienie, którego nie da się skompletować. Ten jeden dokument rośnie przez cały kurs.

**Nazwy pól:** polskie, camelCase, bez polskich znaków (`numerKlienta`, `kodPocztowy`, `ilosc`). Brak diakrytyków dostaje uzasadnienie w module 4 (`ilosc` kontra `ilość` jako literówka, która przechodzi).

**Przestrzeń identyfikatorów schematów:** `https://kurs.example/schematy/…` (np. `…/zamowienie`, `…/adres`, `…/klient`, `…/produkt`).

Dlaczego ta branża: kody EAN-13 i katalogowe (`pattern`), opakowania zbiorcze (`multipleOf` z sensem biznesowym), wymiary paczki (`prefixItems`), klient firmowy kontra prywatny (`if`/`then`, `dependentRequired`), rodzaje płatności (`oneOf`), adres użyty dwa razy (`$defs`, `$ref`, wiele plików).

## Rozbudowa obiektu moduł po module

| Moduł | Co dochodzi do zamówienia | Słowa kluczowe, które z tego wynikają |
|---|---|---|
| 0 | minimalne zamówienie: numer, klient, pozycje | motywacja: umowa sklep ↔ magazyn |
| 1 | pozycje (tablica), ilość i cena (liczby), czy faktura (`true`/`false`), uwagi (`null`), adres (obiekt) | struktury JSON; błędy: `12,50`, cudzysłowy z Worda, `True`/`None`, zbędny przecinek, komentarz, duplikat pola; to samo zamówienie w XML-u |
| 2 | bez zmian; stary schemat zamówienia od dostawcy w draft-07 | pojęcia; wersje w pigułce (jedyne miejsce z innymi wersjami) |
| 3 | `typDokumentu`, status, waluta, numer zamówienia `ZAM-2026-000123`, kod pocztowy, NIP, numer klienta (8 cyfr), EAN-13, kod katalogowy `SZP.36`, rabat, opakowanie zbiorcze | `type` (`integer` kontra `number`, `["string","null"]`), `enum`, `const`, `minLength`/`maxLength`, `pattern` + regex (kotwice, klasy, powtórzenia, alternatywa, ucieczki), `minimum`/`maximum`/`exclusive*`, `multipleOf` (36 szprych; `0.01` dla ceny jako pułapka zmiennoprzecinkowa) |
| 4 | literówki `adrs`, `ilość`; `uwagi: null` kontra brak `dataDostawy` kontra `kodRabatowy: ""`; kody rabatowe; pozycje typu produkt/usługa; wymiary paczki | `properties`, `required`, `additionalProperties`, `items`, `minItems`/`maxItems`, `uniqueItems` (niuans: te same EAN z różną ilością to różne obiekty), `contains`, `prefixItems` |
| 5 | data zamówienia, znacznik utworzenia, e-mail, uuid zamówienia, link do faktury, adres IP (antyfraud, tylko hasłowo); stare pole `kodKlienta`; token płatności | formaty (`date`, `date-time`, `email`, `uuid`, `uri`, `ipv4`), adnotacja kontra asercja; `title`, `description`, `examples`, `default` (waluta PLN), `deprecated`, `readOnly` (numer, utworzono), `writeOnly` (token) |
| 6 | adres dostawy = adres + instrukcje dla kuriera; płatność: przelew / karta / za pobraniem; kontakt: e-mail lub telefon; faktura → NIP; kraj ≠ PL → EORI; kod rabatowy → źródło rabatu | `allOf` (z pułapką `additionalProperties: false` w gałęzi i akapitem o `unevaluatedProperties`), `anyOf` kontra `oneOf` parami, `not` (status ≠ anulowane), `if`/`then`/`else`, `dependentRequired` |
| 7 | adres dostawy i adres do faktury z jednej definicji; osobne pliki: zamówienie, klient, adres, produkt (produkt dzielony z katalogiem) | `$defs`, `$ref`, JSON Pointer, `$anchor`, `$id`, adres bazowy, odwołania względne, zepsute odwołanie, `$ref` z regułami obok |
| 8 | kilka prawdziwych zamówień → genson | wady generatora: `required` z przykładów, cena jako `integer`, status bez `enum`, brak wzorców i zakresów, `anyOf` z `null`, `$schema` bez wersji |
| 9 | `POST /zamowienia` w OpenAPI | `components/schemas`, `$ref` (jeśli moduł 9 zostaje) |

## Miejsca, gdzie domena pasuje słabiej

- `ipv4` i `uri`: tylko w tabeli formatów, bez ćwiczenia.
- `const`: jedno użycie (`typDokumentu`), wystarczające dla tematu pobocznego.
- `prefixItems`: jedno użycie (wymiary paczki), zgodne z programem („krótko”).
