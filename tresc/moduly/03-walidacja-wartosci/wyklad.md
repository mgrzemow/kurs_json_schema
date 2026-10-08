*Treść próbna prototypu. Służy do sprawdzenia mechaniki trenera i zostanie zastąpiona przy pisaniu modułu 3.*

Magazyn odrzuca zamówienia, w których „ilość” raz jest liczbą, a raz tekstem, a status to dowolny napis. W tym module opisujemy pojedyncze wartości: jakiego mają być typu, z jakiej listy, jakiej długości, do jakiego wzorca pasować i w jakim zakresie się mieścić.

## Walidacja instancji dowolnego typu

Najprostsza reguła mówi, jakiego typu ma być wartość. Słowo `type` przyjmuje jedną z nazw: `"string"`, `"number"`, `"integer"`, `"boolean"`, `"object"`, `"array"` albo `"null"`. Typ `"integer"` pasuje do każdej liczby bez części ułamkowej, więc `36` przejdzie, a `36.5` nie. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.1 -->

Status zamówienia to nie dowolny tekst. Słowo `enum` wylicza dozwolone wartości; instancja przechodzi, gdy jest równa którejś z nich. Wielkość liter i polskie znaki mają znaczenie, bo porównanie jest dokładne. <!-- twierdzenie --> <!-- zrodlo: validation §6.1.2 -->

```json schemat=status
{
  "type": "string",
  "enum": ["nowe", "oplacone", "wyslane", "dostarczone", "anulowane"]
}
```

```json dokument=status-ok schemat=status oczekiwane=przechodzi
"wyslane"
```

```json dokument=status-zly schemat=status oczekiwane=odrzucony
"Wysłane"
```

## Walidacja instancji tekstowych

Nazwa klienta nie może być pusta ani nieskończenie długa. `minLength` i `maxLength` liczą znaki tekstu. Pusty tekst `""` to nadal tekst, więc samo `"type": "string"` go przepuści; dopiero `"minLength": 1` go odrzuci. <!-- twierdzenie --> <!-- zrodlo: validation §6.3.2 -->

```json schemat=nazwa
{ "type": "string", "minLength": 1, "maxLength": 80 }
```

```json dokument=nazwa-pusta schemat=nazwa oczekiwane=odrzucony
""
```

## Wyrażenia regularne

Kod pocztowy to dwie cyfry, myślnik i trzy cyfry. Słowo `pattern` przyjmuje wyrażenie regularne w dialekcie ECMA-262 (tym samym, co w JavaScripcie). Tekst przechodzi, jeśli wzorzec gdziekolwiek w nim pasuje: wzorzec **nie jest domyślnie zakotwiczony** do początku i końca tekstu. <!-- twierdzenie --> <!-- zrodlo: validation §6.3.3 -->

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

W JSON-ie odwrotny ukośnik trzeba podwoić: klasa cyfr `\d` w pliku wygląda jak `"\\d"`. Parser JSON zamienia `\\` na pojedynczy `\`, zanim wzorzec trafi do walidatora.

**Przejdzie czy nie?** Schemat `kod-bez-kotwic` i dokument poniżej. Odpowiedz na czacie, potem odsłoń.

```json pytanie=kod-za-dlugi schemat=kod-bez-kotwic oczekiwane=przechodzi
"00-9500"
```

## Walidacja instancji numerycznych

Szprychy sprzedajemy w opakowaniach po 36 sztuk. `multipleOf` przyjmuje liczbę większą od zera i przepuszcza instancję, gdy wynik dzielenia jest liczbą całkowitą. `minimum` i `maximum` ustalają zakres z granicami włącznie, a `exclusiveMinimum` i `exclusiveMaximum` bez granic. <!-- twierdzenie --> <!-- zrodlo: validation §6.2.1, §6.2.2, §6.2.4 -->

```json schemat=szprychy
{ "type": "integer", "minimum": 36, "maximum": 360, "multipleOf": 36 }
```

```json dokument=szprychy-ok schemat=szprychy oczekiwane=przechodzi
72
```

```json dokument=szprychy-zle schemat=szprychy oczekiwane=odrzucony
50
```

> **W draft-07:** `exclusiveMinimum` i `exclusiveMaximum` były wartościami logicznymi dopisywanymi obok `minimum` i `maximum` (`"minimum": 0, "exclusiveMinimum": true`). Od draft-06 są osobnymi liczbami: `"exclusiveMinimum": 0`. Stary zapis w 2020-12 jest po cichu ignorowany, bo `true` nie jest liczbą. <!-- twierdzenie --> <!-- zrodlo: validation §6.2.5; spec/tests/draft2020-12/exclusiveMinimum.json; draft-07 poza repozytorium: json-schema.org/draft-07 release notes -->
