Magazyn odrzuca zamówienia, w których „ilość” raz jest liczbą, a raz tekstem, a status to dowolny napis. W tym module opisujemy pojedyncze wartości: jakiego mają być typu, z jakiej listy, jakiej długości, do jakiego wzorca pasować i w jakim zakresie się mieścić. Obiekty i listy przyjdą w module 4. W wykładzie każdy przykład to jedna wartość; niektóre ćwiczenia opakowują ją w prosty obiekt z jednym albo dwoma polami (do ich przeczytania wystarczy wiedzieć, że `properties` opisuje pola obiektu, a `required` z modułu 0 wymienia pola obowiązkowe; więcej o obu w module 4).

## Walidacja instancji dowolnego typu

### `type`

Najprostsza reguła mówi, jakiego typu ma być wartość. `type` przyjmuje jedną z siedmiu nazw: `"string"`{s}, `"number"`{s}, `"integer"`{s}, `"boolean"`{s}, `"object"`{s}, `"array"`{s}, `"null"`{s}. Sześć z nich odpowiada wprost rodzajom wartości JSON z modułu 1. Siódma, `"integer"`{s}, to liczba bez części ułamkowej. I tu pierwsza niespodzianka: `36.0`{d} jest liczbą całkowitą, bo jej część ułamkowa wynosi zero, więc `{"type": "integer"}`{s} ją przepuszcza. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.1; spec/tests/draft2020-12/type.json -->

```json schemat=typ-integer
{ "type": "integer" }
```

```json schemat=typ-number
{ "type": "number" }
```

```json dokument=ilosc-ulamek-integer schemat=typ-integer oczekiwane=odrzucony
36.5
```

```json dokument=ilosc-ulamek-number schemat=typ-number oczekiwane=przechodzi
36.5
```

`type` może też być listą nazw, np. `["string", "null"]`{s}: wartość ma być tekstem albo `null`. Przyda się w module 4 przy polach, które mogą nie mieć wartości.

**Przejdzie czy nie?** Schemat `typ-integer` i dokument `36.0`{d}.

```json pytanie=integer-zero-ulamek schemat=typ-integer oczekiwane=przechodzi
36.0
```

### `enum`

Status zamówienia to nie dowolny tekst. `enum` wylicza dozwolone wartości; instancja przechodzi, gdy jest **równa** którejś z nich. Porównanie jest dokładne: wielkość liter i każdy znak mają znaczenie, więc `Wyslane` to co innego niż `wyslane`. Wartości na liście mogą być różnych typów (`[1, "jeden", null]`{d}), ale taka mieszanka to zły projekt, nie zaleta. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.2 -->

```json schemat=status
{
  "type": "string",
  "enum": ["nowe", "oplacone", "wyslane", "dostarczone", "anulowane"]
}
```

```json dokument=status-ok schemat=status oczekiwane=przechodzi
"wyslane"
```

```json dokument=status-wielka-litera schemat=status oczekiwane=odrzucony
"Wyslane"
```

### `const`

Magazyn odbiera tym samym kanałem zamówienia, zwroty i reklamacje, więc każdy dokument ma pole `typDokumentu`. W schemacie zamówienia ma ono jedną jedyną dozwoloną wartość. Do tego służy `const`, które działa jak `enum` z jednym elementem. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.3 -->

```json schemat=typ-dokumentu
{ "const": "zamowienie" }
```

```json dokument=typ-dokumentu-zwrot schemat=typ-dokumentu oczekiwane=odrzucony
"zwrot"
```

## Walidacja instancji tekstowych

Nazwa klienta nie może być pusta ani nieskończenie długa. `minLength` i `maxLength` liczą **znaki** tekstu, nie bajty: `Dętka` to pięć znaków, choć w UTF-8 zajmuje sześć bajtów. Pusty tekst `""`{d} jest tekstem, więc samo `"type": "string"`{s} go przepuści; dopiero `"minLength": 1`{s} go odrzuci. <!-- twierdzenie --> <!-- zrodlo: validation §6.3.1, §6.3.2 -->

```json schemat=nazwa
{ "type": "string", "minLength": 1, "maxLength": 80 }
```

```json dokument=nazwa-pusta schemat=nazwa oczekiwane=odrzucony
""
```

```json dokument=nazwa-ok schemat=nazwa oczekiwane=przechodzi
"Serwis Rowerowy Dętka"
```

Zapowiedź na moduł 4: pusty tekst, `null` i brak pola to trzy różne sytuacje, które wymagają trzech różnych reguł. Tu widzimy tylko pierwszą.

## Wyrażenia regularne

Kod pocztowy to dwie cyfry, myślnik i trzy cyfry. Do opisu takich kształtów tekstu służy `pattern` z wyrażeniem regularnym w dialekcie ECMA-262, czyli tym samym, którego używa JavaScript. Tekst przechodzi, gdy wzorzec pasuje do **jakiegokolwiek jego fragmentu**. Specyfikacja wprost zakazuje walidatorom domyślnego kotwiczenia wzorca do początku i końca tekstu, więc wzorzec `es` pasuje do `expression`. <!-- twierdzenie --> <!-- zrodlo: validation §6.3.3; core §6.4 -->

Dlatego te dwa schematy różnią się tylko kotwicami `^` i `$`, a dla tego samego dokumentu dają różny werdykt:

```json schemat=kod-bez-kotwic
{ "type": "string", "pattern": "[0-9]{2}-[0-9]{3}" }
```

```json schemat=kod-z-kotwicami
{ "type": "string", "pattern": "^[0-9]{2}-[0-9]{3}$" }
```

```json dokument=kod-z-dopiskiem-bez schemat=kod-bez-kotwic oczekiwane=przechodzi
"kod: 00-950, pilne"
```

```json dokument=kod-z-dopiskiem-z schemat=kod-z-kotwicami oczekiwane=odrzucony
"kod: 00-950, pilne"
```

### Klocki, z których składa się wzorzec

Każdy klocek z przykładem z zamówienia:

- **Znak dosłowny i klasa znaków.** `Z` pasuje do litery Z; `[0-9]` do jednej cyfry; `[A-Z]` do jednej wielkiej litery; `[^0-9]` do jednego znaku, który nie jest cyfrą. Skrót `\d` znaczy „cyfra”, ale czytaj niżej o przenośności.
- **Powtórzenia.** `{2}` dokładnie dwa razy, `{1,3}` od jednego do trzech, `+` co najmniej raz, `*` zero lub więcej razy, `?` zero albo raz. Kod pocztowy: `[0-9]{2}-[0-9]{3}`. Numer zamówienia: `ZAM-[0-9]{4}-[0-9]{6}`.
- **Kotwice.** `^` początek tekstu, `$` koniec. Bez nich wzorzec szuka fragmentu.
- **Alternatywa i grupa.** `|` znaczy „albo”, nawiasy grupują. Waluta: `^(PLN|EUR|CZK)$`. Bez nawiasów `^PLN|EUR|CZK$` znaczy „zaczyna się od PLN, albo zawiera EUR, albo kończy się na CZK”, co przepuszcza `EURO`:

```json schemat=waluta-bez-grupy
{ "type": "string", "pattern": "^PLN|EUR|CZK$" }
```

```json schemat=waluta-z-grupa
{ "type": "string", "pattern": "^(PLN|EUR|CZK)$" }
```

```json dokument=euro-bez-grupy schemat=waluta-bez-grupy oczekiwane=przechodzi
"EURO"
```

```json dokument=euro-z-grupa schemat=waluta-z-grupa oczekiwane=odrzucony
"EURO"
```

- **Kropka i inne znaki specjalne.** `.` to „dowolny znak”. Dosłowna kropka wymaga ucieczki `\.`. Kod katalogowy `SZP.36`: `^[A-Z]{3}\.[0-9]{2}$`. Tak samo każdy znak, który we wzorcu coś znaczy: `+`, `*`, `?`, `(`, `)`, `[`, `{`, `|`, `^`, `$`. Telefon z plusem na początku to `^\+48`.
- **Ucieczka w JSON-ie.** Wzorzec stoi w tekście JSON, a w tekście JSON `\` jest znakiem ucieczki (moduł 1). Dlatego `\.` zapisujemy w pliku jako `"\\."`{s}, a `\d` jako `"\\d"`{s}: parser JSON zamienia `\\` na jeden `\`, zanim wzorzec trafi do walidatora. Niepodwojony ukośnik to błąd składni JSON, który edytor pokaże od razu. <!-- twierdzenie --> <!-- zrodlo: RFC 8259 §7 -->

```json schemat=kod-katalogowy
{ "type": "string", "pattern": "^[A-Z]{3}\\.[0-9]{2}$" }
```

```json dokument=kod-katalogowy-ok schemat=kod-katalogowy oczekiwane=przechodzi
"SZP.36"
```

```json dokument=kod-katalogowy-x schemat=kod-katalogowy oczekiwane=odrzucony
"SZPX36"
```

### Przenośność

Specyfikacja zaleca autorom schematów ograniczyć się do małego podzbioru składni: pojedyncze znaki, klasy `[abc]` i `[a-z]` z zaprzeczeniem (dopełnieniem) `[^...]`, powtórzenia `+ * ? {x} {x,y} {x,}`, kotwice `^ $`, grupy `( )` i alternatywa `|`. Powód: walidatory w różnych językach różnie wspierają resztę. Na przykład `\d` w Pythonie pasuje także do cyfr spoza alfabetu łacińskiego (arabsko-indyjskich, dewanagari), a w JavaScripcie tylko do `0-9`; `[0-9]` działa wszędzie tak samo. W tym kursie trzymamy się tego podzbioru, plus ucieczki znaków specjalnych, takiej jak `\.` dla dosłownej kropki. <!-- twierdzenie --> <!-- zrodlo: core §6.4; spec/tests/draft2020-12/optional/ecmascript-regex.json -->

(Zachowanie `\d` w Pythonie: dokumentacja modułu `re`, poza repozytorium.)

### Wzorce z domeny

| Pole | Wzorzec |
|---|---|
| kod pocztowy | `^[0-9]{2}-[0-9]{3}$` |
| numer zamówienia | `^ZAM-[0-9]{4}-[0-9]{6}$` |
| NIP | `^[0-9]{10}$` |
| EAN-13 (kod kreskowy produktu) | `^[0-9]{13}$` |
| kod katalogowy | `^[A-Z]{3}\.[0-9]{2}$` (w JSON-ie `\\.`) |
| waluta | `^(PLN\|EUR\|CZK)$` |

**Przejdzie czy nie?** Wracamy do wzorca kodu pocztowego bez kotwic z początku sekcji. Klient wpisał kod o jedną cyfrę za długi: `"00-9500"`{d}. Czy ten schemat go odrzuci?

```json schemat=kod-bez-kotwic
{ "type": "string", "pattern": "[0-9]{2}-[0-9]{3}" }
```

```json pytanie=kod-za-dlugi schemat=kod-bez-kotwic oczekiwane=przechodzi
"00-9500"
```

```odpowiedz
Nie odrzuci, dokument przechodzi. Wzorzec bez kotwic szuka pasującego fragmentu, a `00-950` jest fragmentem tekstu `00-9500`. Dopiero `^` i `$` wymuszają, żeby cały tekst był kodem pocztowym, i wtedy `"00-9500"`{d} zostaje odrzucony.
```

## Walidacja instancji numerycznych

### Zakresy

`minimum` i `maximum` ustalają zakres **z granicami włącznie**; `exclusiveMinimum` i `exclusiveMaximum` wykluczają granicę. Ilość w pozycji: większa od zera i najwyżej tysiąc, czyli `exclusiveMinimum: 0`{s} i `maximum: 1000`{s}. Rabat procentowy od zera do stu włącznie: `minimum: 0`{s}, `maximum: 100`{s}. <!-- twierdzenie --> <!-- zrodlo: validation §6.2.2, §6.2.3, §6.2.4, §6.2.5 -->

```json schemat=ilosc
{ "type": "integer", "exclusiveMinimum": 0, "maximum": 1000 }
```

```json dokument=ilosc-zero schemat=ilosc oczekiwane=odrzucony
0
```

```json dokument=ilosc-tysiac schemat=ilosc oczekiwane=przechodzi
1000
```

### `multipleOf`

Szprychy sprzedajemy w opakowaniach po 36 sztuk. `multipleOf` przyjmuje liczbę większą od zera i przepuszcza instancję, gdy wynik dzielenia jest liczbą całkowitą. <!-- twierdzenie --> <!-- zrodlo: validation §6.2.1 -->

```json schemat=szprychy
{ "type": "integer", "minimum": 36, "maximum": 360, "multipleOf": 36 }
```

```json dokument=szprychy-ok schemat=szprychy oczekiwane=przechodzi
72
```

```json dokument=szprychy-zle schemat=szprychy oczekiwane=odrzucony
50
```

### Pułapka: `multipleOf` z ułamkiem dziesiętnym

Kusi, żeby cenę z dwoma miejscami po przecinku opisać przez `multipleOf: 0.01`{s}. Komputer zapisuje większość ułamków dziesiętnych w przybliżeniu, tak jak kalkulator pokazuje 1/3 jako 0,3333333. Ten sposób liczenia to arytmetyka zmiennoprzecinkowa; używa jej większość walidatorów i w niej `19.99 / 0.01` nie daje dokładnie `1999`, tylko liczbę „prawie całkowitą”, i walidator odrzuca cenę 19,99 zł. Specyfikacja nie ogranicza precyzji liczb i oficjalny zestaw testów oczekuje poprawnej obsługi ułamkowego `multipleOf`, ale walidator liczący w arytmetyce zmiennoprzecinkowej może dać wynik niezgodny z oczekiwaniem; w praktyce `multipleOf` z ułamkiem jest loterią zależną od biblioteki. Dla pieniędzy bezpieczniej trzymać grosze jako liczbę całkowitą (`1999`{d}) albo zapisać wymaganie w dokumentacji i sprawdzać je w kodzie. <!-- twierdzenie --> <!-- zrodlo: validation §4.2, §6.2.1; spec/tests/draft2020-12/multipleOf.json -->

```json schemat=cena-grosze
{ "type": "number", "exclusiveMinimum": 0, "multipleOf": 0.01 }
```

```json dokument=cena-12-50 schemat=cena-grosze oczekiwane=przechodzi
12.5
```

```json dokument=cena-19-99 schemat=cena-grosze oczekiwane=odrzucony
19.99
```

(Werdykt dla `19.99`{d} policzył walidator Ajv, którego używa ta strona. Inny walidator może dać inny wynik, i to jest cała pułapka.)

### Reguły dla liczb nie dotyczą tekstów

Słowa `minimum`, `maximum`, `multipleOf` sprawdzają wyłącznie liczby. Tekst `"36"`{d} nie jest liczbą, więc te słowa go nie dotyczą i przechodzi bez `type`. Dlatego przy regułach liczbowych `type` jest zawsze potrzebny. <!-- twierdzenie --> <!-- zrodlo: validation §6.2; spec/tests/draft2020-12/multipleOf.json -->

```json schemat=szprychy-bez-type
{ "minimum": 36, "multipleOf": 36 }
```

```json dokument=szprychy-tekst schemat=szprychy-bez-type oczekiwane=przechodzi
"36"
```

> **W draft-07:** `exclusiveMinimum` i `exclusiveMaximum` są osobnymi liczbami, tak jak w 2020-12 (zmiana weszła w draft-06). Starszy zapis, w którym były wartościami logicznymi obok `minimum` i `maximum` (`"minimum": 0, "exclusiveMinimum": true`{s}), pochodzi z draft-04 i wciąż krąży w starych schematach i generatorach. W 2020-12 `"exclusiveMinimum": true`{s} nie jest poprawnym schematem, bo specyfikacja wymaga liczby. Część walidatorów odrzuci taki schemat (Ajv na tej stronie tak robi), inne po cichu zignorują słowo, a wtedy granica przestanie być wyłączona. <!-- twierdzenie --> <!-- zrodlo: validation §6.2.5; spec/metaschematy/meta/validation.json -->
