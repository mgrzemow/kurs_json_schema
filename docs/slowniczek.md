# Słowniczek terminów

Polskie odpowiedniki ustalone raz i używane konsekwentnie w wykładzie, ćwiczeniach, interfejsie i materiałach. Tam, gdzie nazwa angielska jest popularniejsza, w tekście podajemy obie (polska i w nawiasie angielska) przy pierwszym użyciu w module.

| Angielski | Polski w kursie | Uwagi |
|---|---|---|
| JSON document | dokument JSON | tekst w formacie JSON |
| instance | instancja | dokument JSON w roli sprawdzanego |
| JSON Schema document | dokument JSON Schema, schemat | „schemat” w tekście bieżącym |
| keyword | słowo kluczowe | nazwy słów zawsze w `kodzie`, bez odmiany |
| assertion | asercja | słowo dające werdykt (`type`, `minimum`) |
| annotation | adnotacja | słowo opisujące (`title`, `description`, domyślnie `format`) |
| applicator | aplikator | słowo stosujące podschematy (`properties`, `items`, `allOf`); używane rzadko, głównie w module 6 |
| subschema | podschemat | schemat zagnieżdżony w innym |
| meta-schema | metaschemat | schemat opisujący schematy |
| vocabulary | słownik | zestaw słów kluczowych; tylko hasłowo w module 2 |
| dialect | dialekt | metaschemat + słowniki, czyli „wersja” w praktyce |
| validator | walidator | program sprawdzający instancję według schematu |
| validation | walidacja | sprawdzanie; „walidacja `format`” to nazwa przełącznika w trenerze |
| verdict (valid/invalid) | werdykt: przechodzi / odrzucony | w interfejsie „Przechodzi”, „Odrzucony” |
| property | pole | w obiekcie JSON; „właściwość” nie jest używana |
| key | klucz | nazwa pola, zwłaszcza w słowniku z dynamicznymi kluczami |
| object | obiekt | |
| array | lista | „tablica” tylko w nazwie z json.org („array”) i w ramkach o draft-07 („tablica w `items`”) |
| string | tekst | |
| number / integer | liczba / liczba całkowita | |
| boolean | wartość logiczna | `true`/`false` |
| null | `null` | nie tłumaczymy; „wartość `null`” |
| required | wymagane (pole) | |
| optional | opcjonalne (pole) | |
| additional properties | nadmiarowe pola, dodatkowe pola | |
| reference (`$ref`) | odwołanie | nie „referencja” |
| definition (`$defs`) | definicja | |
| identifier (`$id`) | identyfikator | |
| base URI | adres bazowy | |
| fragment identifier | identyfikator fragmentu | nagłówek z obowiązkowego zakresu |
| JSON Pointer | JSON Pointer, wskaźnik | nazwa własna; w tekście „wskaźnik” po pierwszym użyciu |
| anchor (`$anchor`) | kotwica (nazwa) | uwaga: „kotwice” to też `^` i `$` w regex; rozróżniamy kontekstem |
| regular expression | wyrażenie regularne | „regex” dopuszczalne w tekście bieżącym po pierwszym użyciu |
| pattern | wzorzec | |
| anchored (regex) | zakotwiczony | |
| format | format | |
| format-assertion | sprawdzanie formatu jako asercji | |
| draft | draft (wersja robocza) | nazwy wersji bez tłumaczenia: draft-07, 2020-12 |
| bundling | pakowanie | moduł 7, jednym zdaniem |
| discriminator | pole rozróżniające | moduł 6, `oneOf` |
| schema generator | generator schematów | |
| loading / dereferencing | ładowanie / rozwiązywanie odwołań | nagłówek „Ładowanie i przetwarzanie schematów” |
| evaluation | ewaluacja | tylko przy `unevaluatedProperties` („pola nieocenione”) |
