Schemat zamówienia urósł. Adres występuje w nim dwa razy (dostawy i do faktury), produkt jest wspólny z katalogiem, a plik ma kilkaset linii. Ten moduł jest o tym, jak nie powtarzać definicji, jak dzielić schemat na pliki i jak walidator te pliki składa.

## Powtórzenia w schemacie: `$defs` i `$ref`

Skopiowany schemat adresu rozjeżdża się po pierwszej poprawce: w adresie dostawy kod pocztowy dostał wzorzec, w adresie do faktury nie. Rozwiązanie: definicja raz, w `$defs`, a w obu miejscach odwołanie `$ref`. <!-- twierdzenie --> <!-- zrodlo: core §8.2.4, §8.2.3.1 -->

```json schemat=adres-raz
{
  "type": "object",
  "properties": {
    "adresDostawy": { "$ref": "#/$defs/adres" },
    "adresFaktury": { "$ref": "#/$defs/adres" }
  },
  "$defs": {
    "adres": {
      "type": "object",
      "properties": { "miasto": { "type": "string" }, "kodPocztowy": { "type": "string", "pattern": "^[0-9]{2}-[0-9]{3}$" } },
      "required": ["miasto", "kodPocztowy"]
    }
  }
}
```

```json dokument=adres-raz-zly-kod-faktury schemat=adres-raz oczekiwane=odrzucony
{ "adresDostawy": { "miasto": "Gdańsk", "kodPocztowy": "80-827" }, "adresFaktury": { "miasto": "Gdańsk", "kodPocztowy": "80827" } }
```

`$ref` to odwołanie, nie kopia: zmiana w `$defs` działa we wszystkich miejscach. Wartość `$ref` to adres celu; `#/$defs/adres` znaczy „w tym pliku, pod kluczem `$defs`, pod kluczem `adres`”. Samo `$defs` niczego nie sprawdza; definicja bez `$ref` jest martwa i walidator jej nie użyje.

Odwołanie może prowadzić też do samego schematu, co daje rekurencję (kategoria z podkategoriami). W tym kursie tego nie ćwiczymy.

> **W draft-07:** `definitions` zamiast `$defs`. W 2020-12 stara nazwa nadal działa jako zwykłe miejsce na schematy (walidator rozwiąże `#/definitions/adres`, bo to po prostu ścieżka w pliku), ale nie jest słowem kluczowym; `$defs` jest.

## Identyfikatory fragmentów: JSON Pointer i `$anchor`

Część odwołania po `#` to **identyfikator fragmentu**. Są dwa rodzaje. <!-- twierdzenie --> <!-- zrodlo: core §5 -->

**JSON Pointer**: ścieżka po kluczach od korzenia pliku, rozdzielona `/`: `#/$defs/adres`, `#/properties/klient/properties/adres`, `#/prefixItems/0` (elementy list po numerze od zera). Jeśli nazwa klucza zawiera `~` albo `/`, zapisuje się je jako `~0` i `~1`. Wskaźnik prowadzi do dowolnego miejsca w pliku, nie tylko do `$defs`, ale odwołania w głąb `properties` są kruche: zmiana struktury je psuje. <!-- twierdzenie --> <!-- zrodlo: core §9.2.1; RFC 6901 §3, §4 -->

```json schemat=wskaznik-w-glab
{
  "type": "object",
  "properties": {
    "adresDostawy": { "type": "object", "properties": { "kodPocztowy": { "type": "string", "pattern": "^[0-9]{2}-[0-9]{3}$" } } },
    "kodPocztowyPaczkomatu": { "$ref": "#/properties/adresDostawy/properties/kodPocztowy" }
  }
}
```

```json dokument=paczkomat-zly-kod schemat=wskaznik-w-glab oczekiwane=odrzucony
{ "kodPocztowyPaczkomatu": "80827" }
```

**`$anchor`**: nazwa nadana schematowi (`"$anchor": "adres"`), do której odwołujemy się przez `#adres`, niezależnie od miejsca w pliku. Nazwa musi zaczynać się od litery. <!-- twierdzenie --> <!-- zrodlo: core §8.2.2 -->

```json schemat=kotwica
{
  "type": "object",
  "properties": { "adresDostawy": { "$ref": "#adres" } },
  "$defs": { "cokolwiek": { "$anchor": "adres", "type": "object", "required": ["miasto"] } }
}
```

```json dokument=kotwica-bez-miasta schemat=kotwica oczekiwane=odrzucony
{ "adresDostawy": {} }
```

Kiedy co: wskaźnik do `$defs` w małych schematach; `$anchor`, gdy schemat jest duży albo struktura się zmienia.

**Przejdzie czy nie?** `"$ref": "#/defs/adres"` (bez dolara). Odpowiedź: to nie jest werdykt dla dokumentu, tylko błąd kompilacji całego schematu, bo odwołanie nie prowadzi nigdzie. Trener pokazuje „odwołanie nie prowadzi do żadnej definicji”, a walidator w magazynie odmówi uruchomienia.

> **W draft-07:** zamiast `$anchor` używało się `$id` z samym fragmentem (`"$id": "#adres"`). W 2020-12 to niedozwolone; `$id` nie może mieć fragmentu.

## `$ref` z regułami obok

W 2020-12 słowa obok `$ref` działają. `{"$ref": "#/$defs/adres", "description": "Adres dostawy"}` dodaje opis, a `{"$ref": "#/$defs/produkt", "required": ["ean"]}` zaostrza definicję: wartość musi spełnić i definicję, i regułę obok, jak przy `allOf`. <!-- twierdzenie --> <!-- zrodlo: core §8.2.3.1, §7.5.1; spec/tests/draft2020-12/ref.json -->

```json schemat=ref-z-regula
{
  "type": "object",
  "properties": {
    "pozycja": { "$ref": "#/$defs/produkt", "required": ["ean"] }
  },
  "$defs": { "produkt": { "type": "object", "properties": { "nazwa": { "type": "string" }, "ean": { "type": "string" } }, "required": ["nazwa"] } }
}
```

```json dokument=pozycja-bez-ean schemat=ref-z-regula oczekiwane=odrzucony
{ "pozycja": { "nazwa": "Szprycha" } }
```

> **W draft-07:** wszystko obok `$ref` było ignorowane, więc `{"$ref": "...", "required": ["ean"]}` wymagało tylko tego, co w definicji. Stare schematy owijają `$ref` w `allOf`, żeby dołożyć regułę. Taki zapis w 2020-12 nadal działa, ale nie jest już potrzebny. To pułapka z listy obowiązkowej kursu: przy przenoszeniu schematu z draft-07 na 2020-12 reguły obok `$ref` zaczynają działać.

## Wiele plików: `$id` i adres bazowy

Produkt jest wspólny dla zamówienia i katalogu, więc dostaje osobny plik. Każdy plik ma `$id`, czyli identyfikator w postaci URI: `https://kurs.example/schematy/produkt`. <!-- twierdzenie --> <!-- zrodlo: core §8.2.1 -->

`$ref` między plikami wskazuje `$id` celu: w całości albo względnie. W pliku o `$id` `https://kurs.example/schematy/zamowienie` odwołanie `"$ref": "produkt"` rozwiązuje się względem adresu bazowego do `https://kurs.example/schematy/produkt`, dokładnie tak, jak link względny na stronie WWW. <!-- twierdzenie --> <!-- zrodlo: core §8.2.1, §9.1.1 -->

```json
{
  "$id": "https://kurs.example/schematy/zamowienie",
  "type": "object",
  "properties": {
    "pozycje": { "type": "array", "items": { "$ref": "produkt" } },
    "adresDostawy": { "$ref": "adres" }
  }
}
```

**Pułapka z listy obowiązkowej: `$id` to identyfikator, a nie adres do pobrania.** Walidator niczego nie ściąga z sieci; schematy trzeba mu podać (zarejestrować) przed użyciem. Adres `https://kurs.example/...` nie istnieje w sieci i nie musi; gdyby istniał, walidator i tak by tam nie poszedł. W trenerze panel „jak to widzi walidator” pokazuje mapę nazwa pliku → `$id`, a diagram zależności pokazuje odwołania, w tym zepsute. <!-- twierdzenie --> <!-- zrodlo: core §9.1.2 -->

Uwaga dla autorów: `$id` wewnątrz podschematu zmienia adres bazowy dla wszystkiego poniżej. To zaawansowane i częste źródło błędów, więc w kursie `$id` stoi wyłącznie na poziomie pliku.

> **W draft-07:** to samo `$id`. W draft-04 było `id` bez dolara, co jest jednym z sygnałów starego schematu z modułu 2.

## Ładowanie i przetwarzanie schematów

Co walidator robi po kolei: <!-- twierdzenie --> <!-- zrodlo: core §9.1, §9.2 -->

1. Wczytuje pliki, które mu podano.
2. Rejestruje każdy pod jego `$id`.
3. Bierze schemat główny i w czasie kompilacji rozwiązuje każde `$ref`: adres bazowy plus odwołanie dają identyfikator, a identyfikator prowadzi do zarejestrowanego schematu albo do fragmentu w nim.
4. Dopiero potem sprawdza dokumenty.

Zepsute odwołanie to błąd w kroku 3, czyli błąd kompilacji całego schematu, a nie werdykt dla dokumentu. Dlatego w trenerze przy zepsutym odwołaniu przykłady nie dostają werdyktów („czeka”), tylko diagnoza mówi, w którym pliku jest zepsute odwołanie.

Pakowanie (bundling) jednym zdaniem: wiele plików da się scalić w jeden, wstawiając je do `$defs` z zachowaniem ich `$id`; narzędzia robią to automatycznie, w kursie nie ćwiczymy. <!-- twierdzenie --> <!-- zrodlo: core §9.3.1 -->

**Przejdzie czy nie?** Plik `adres` ma `$id` `https://kurs.example/schematy/adres.json`, a zamówienie odwołuje się do `adres`. Odpowiedź: zepsute, bo `https://kurs.example/schematy/adres` i `https://kurs.example/schematy/adres.json` to różne identyfikatory. Walidator porównuje je jak teksty, co do znaku.
