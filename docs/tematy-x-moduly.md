# Tematy × moduły

Każdy temat pojawia się pierwszy raz jako temat sam w sobie (pogrubiony moduł), a potem jako część innych tematów. Tabela wymagana przez CLAUDE.md (zasady ćwiczeń, pkt 5). Stan po wygenerowaniu treści 2026-10-08.

| Temat | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| składnia JSON, typowe błędy | | **1-1, 1-2, 1-3** | | | | | | | |
| pusty schemat, nieznane słowa | | | **2-1, 2-2** | | 4-8 | | | | 8-1 |
| `type`, `integer` | | | 2-2 | **3-3, 3-4, 3-9** | 4-3, 4-7 | 5-1 | | | 8-1 |
| `enum`, `const` | | | | **3-1, 3-9** | 4-6 | 5-3 | 6-2, 6-7 | | 8-1 |
| `minLength`, `maxLength` | | | | **3-5** | 4-3 | | | | 8-1 |
| `pattern`, kotwice, ucieczki | | | | **3-2, 3-6, 3-7, 3-8** | 4-2, 4-10 | 5-4 | | 7-1, 7-5 | 8-1 |
| zakresy liczb, `multipleOf` | | | | **3-3, 3-4** | 4-10 | | | | 8-1 |
| `properties`, `required` | 0-1 | | 2-2 | | **4-1, 4-3, 4-8, 4-9** | | 6-1, 6-5 | 7-7 | 8-1 |
| `additionalProperties`, słownik | | | | | **4-2, 4-10** | | 6-4 | | 8-1 |
| `null` / brak / pusty tekst | | | | | **4-3** | | | | 8-1 |
| `items`, `minItems`, `uniqueItems`, `contains`, `prefixItems` | | | | | **4-4, 4-5, 4-6, 4-7** | | | 7-3 | 8-1 |
| `format` jako adnotacja / asercja | | | | | | **5-1, 5-2, 5-4** | | | 8-1 |
| adnotacje (`default`, `deprecated`, `readOnly`…) | | | | | | **5-3, 5-5** | | | 8-1 |
| `allOf`, `unevaluatedProperties` | | | | | | | **6-4** | 7-4 (reguły obok `$ref`) | |
| `anyOf`, `oneOf` | | | | | | | **6-2, 6-3, 6-5** | | |
| `not` | | | | | | | **6-7, 6-8** | | |
| `if`/`then`/`else` | | | | | | | **6-1, 6-8** | | 8-1 |
| `dependentRequired` | | | | | | | **6-6** | | |
| `$defs`, `$ref` | | | | | | | | **7-1, 7-5, 7-7** | |
| JSON Pointer, `$anchor` | | | | | | | | **7-5** | |
| `$ref` z regułami obok | | | | | | | | **7-3, 7-4** | |
| `$id`, adres bazowy, wiele plików | | | | | | | | **7-2, 7-3, 7-6** | |
| generatory, lista kontrolna | | | | | | | | | **8-1** |

## Tematy występujące tylko raz (do decyzji prowadzącego)

- `dependentRequired`: tylko 6-6. Wraca w ćwiczeniu końcowym jedynie pośrednio (warunek faktura → NIP zapisany przez `if`). Można dodać do 8-1 wymaganie „kod rabatowy wymaga źródła”, jeśli chcesz.
- JSON Pointer / `$anchor`: tylko 7-5 (temat poboczny zgodnie z programem).
- `not`: 6-7 i 6-8, oba w module 6.
- `anyOf`/`oneOf`: tylko moduł 6. Ćwiczenie końcowe nie ma płatności, więc `oneOf` tam nie wraca. Można dodać pole `platnosc` do danych genson w przyszłej edycji.
