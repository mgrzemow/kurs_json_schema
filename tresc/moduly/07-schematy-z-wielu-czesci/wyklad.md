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

> **W draft-07:** `definitions` zamiast `$defs`. W metaschemacie 2020-12 `definitions` jest oznaczone jako przestarzałe. Odwołanie `#/definitions/adres` zadziała w większości walidatorów, bo to po prostu ścieżka w pliku, ale specyfikacja tego nie gwarantuje; w nowych schematach używaj `$defs`.

## Identyfikatory fragmentów: JSON Pointer i `$anchor`

Część odwołania po `#` to **identyfikator fragmentu**. Są dwa rodzaje. <!-- twierdzenie --> <!-- zrodlo: core §5 -->

### JSON Pointer

JSON Pointer to ścieżka po kluczach od najwyższego poziomu pliku (korzenia), rozdzielona `/`: `#/$defs/adres`, `#/properties/klient/properties/adres`, `#/prefixItems/0` (elementy list po numerze od zera). Jeśli nazwa klucza zawiera `~` albo `/`, zapisuje się je jako `~0` i `~1`. Wskaźnik prowadzi do dowolnego schematu w pliku, nie tylko do `$defs`, ale odwołania w głąb `properties` są kruche: zmiana struktury je psuje. <!-- twierdzenie --> <!-- zrodlo: core §8.2.2, §9.2.1; RFC 6901 §3, §4 -->

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

### `$anchor`

`$anchor` to nazwa nadana schematowi (`"$anchor": "adres"`{s}), do której odwołujemy się przez `#adres`, niezależnie od miejsca w pliku. Nazwa musi zaczynać się od litery albo podkreślnika. <!-- twierdzenie --> <!-- zrodlo: core §8.2.2 -->

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

**Przejdzie czy nie?** `"$ref": "#/defs/adres"`{s} (bez dolara).

```odpowiedz
To nie jest werdykt dla dokumentu, tylko błąd całego schematu, wykryty przy jego przygotowaniu do użycia (kompilacji), bo odwołanie nie prowadzi nigdzie. Edytor pokazuje „odwołanie nie prowadzi do żadnej definicji”, a walidator w magazynie najpewniej odmówi uruchomienia. (Specyfikacja nie rozstrzyga, co robić z odwołaniem bez celu; tak zachowują się Ajv i większość popularnych walidatorów.)
```

> **W draft-07:** zamiast `$anchor` używało się `$id` z samym fragmentem (`"$id": "#adres"`{s}). W 2020-12 to niedozwolone; `$id` nie może mieć fragmentu.

## `$ref` z regułami obok

W 2020-12 słowa obok `$ref` działają. `{"$ref": "#/$defs/adres", "description": "Adres dostawy"}`{s} dodaje opis, a `{"$ref": "#/$defs/produkt", "required": ["ean"]}`{s} zaostrza definicję: wartość musi spełnić i definicję, i regułę obok, jak przy `allOf`. <!-- twierdzenie --> <!-- zrodlo: core §8.2.3.1, §7.5.1; spec/tests/draft2020-12/ref.json -->

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

> **W draft-07:** wszystko obok `$ref` było ignorowane, więc `{"$ref": "...", "required": ["ean"]}`{s} wymagało tylko tego, co w definicji. Stare schematy owijają `$ref` w `allOf`, żeby dołożyć regułę. Taki zapis w 2020-12 nadal działa, ale nie jest już potrzebny. Pułapka: przy przenoszeniu schematu z draft-07 na 2020-12 reguły obok `$ref` zaczynają działać.

## Wiele plików: `$id` i adres bazowy

### Identyfikator każdego pliku

Produkt jest wspólny dla zamówienia i katalogu, więc dostaje osobny plik. Każdy plik ma `$id`, czyli identyfikator w postaci URI: `https://kurs.example/schematy/produkt`. URI to ogólna nazwa zapisu, który znasz z paska przeglądarki; tutaj służy jako niepowtarzalna nazwa schematu (u nas całego pliku). <!-- twierdzenie --> <!-- zrodlo: core §8.2.1 -->

`$ref` między plikami wskazuje `$id` celu: w całości albo względnie. Odwołanie względne działa jak link względny na stronie WWW: walidator uzupełnia je do pełnego identyfikatora, a punktem odniesienia jest adres bazowy, czyli tu `$id` pliku, w którym odwołanie stoi. W pliku o `$id` `https://kurs.example/schematy/zamowienie` odwołanie `"$ref": "produkt"`{s} rozwiązuje się więc do `https://kurs.example/schematy/produkt`. <!-- twierdzenie --> <!-- zrodlo: core §8.2.1, §9.2 -->

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

### `$id` to nie adres do pobrania

To jedna z najczęstszych pułapek. `$id` to identyfikator, a nie adres do pobrania. Specyfikacja nie wymaga pobierania schematów z sieci, a typowy walidator, także ten na tej stronie, niczego nie ściąga; schematy trzeba mu podać przed użyciem, a on zapamiętuje każdy pod jego `$id` (rejestruje go). Adres `https://kurs.example/...` nie istnieje w sieci i nie musi; gdyby istniał, typowy walidator i tak by tam nie poszedł. W ćwiczeniach z wieloma plikami panel „jak to widzi walidator” pokazuje mapę nazwa pliku → `$id`, a diagram zależności pokazuje odwołania, w tym zepsute. <!-- twierdzenie --> <!-- zrodlo: core §9.1.2 -->

Uwaga dla autorów: `$id` wewnątrz podschematu zmienia adres bazowy dla wszystkiego poniżej. To zaawansowane i częste źródło błędów, więc w tym kursie `$id` stoi wyłącznie na poziomie pliku.

> **W draft-07:** to samo `$id`. W draft-04 było `id` bez dolara, co jest jednym z sygnałów starego schematu z modułu 2.

## Ładowanie i przetwarzanie schematów

### Kolejność działań walidatora

Co walidator robi po kolei: <!-- twierdzenie --> <!-- zrodlo: core §9.1, §9.2 -->

1. Wczytuje pliki, które mu podano.
2. Rejestruje każdy pod jego `$id`.
3. Bierze schemat główny i rozwiązuje każde `$ref`. Typowy walidator, np. Ajv, robi to raz, zanim zobaczy pierwszy dokument: kompiluje schemat, czyli przygotowuje go do użycia (sama specyfikacja nie mówi o kompilacji ani o tym, kiedy rozwiązać odwołania). Rozwiązanie odwołania wygląda tak: adres bazowy plus odwołanie dają identyfikator, a identyfikator prowadzi do zarejestrowanego schematu albo do fragmentu w nim.
4. Dopiero potem sprawdza dokumenty.

Zepsute odwołanie to błąd w kroku 3, czyli w Ajv (także na tej stronie) błąd kompilacji całego schematu, a nie werdykt dla dokumentu (specyfikacja dopuszcza też walidatory, które rozwiązują odwołania leniwie). Dlatego w ćwiczeniach przy zepsutym odwołaniu przykłady nie dostają werdyktów („czeka”), tylko diagnoza mówi, w którym pliku jest zepsute odwołanie.

**Przejdzie czy nie?** Plik `adres` ma `$id` `https://kurs.example/schematy/adres.json`, a zamówienie odwołuje się do `adres`.

```odpowiedz
Zepsute, bo `https://kurs.example/schematy/adres` i `https://kurs.example/schematy/adres.json` to różne identyfikatory. Identyfikatory porównuje się po drobnym ujednoliceniu zapisu (np. wielkość liter w nazwie domeny nie ma znaczenia), ale końcówka `.json` to zawsze inny identyfikator.
```

### Pakowanie wielu plików w jeden

Pakowanie (bundling) jednym zdaniem: wiele plików da się scalić w jeden, wstawiając je do `$defs` z zachowaniem ich `$id`; narzędzia robią to automatycznie, w tym kursie nie ćwiczymy. <!-- twierdzenie --> <!-- zrodlo: core §9.3.1 -->

## Jak to wygląda w prawdziwych repozytoriach

Trzy sytuacje, które spotkasz w firmowych repozytoriach schematów, czyli we wspólnych katalogach, w których zespół trzyma pliki razem z historią ich zmian. Nie ćwiczymy ich, ale warto je rozpoznać.

**Odwołanie do kawałka innego pliku.** Częsty układ to jeden plik „wspólny” z wieloma definicjami (kod pocztowy, NIP, EAN, kwota) i pliki, które biorą z niego pojedyncze elementy. Odwołanie łączy wtedy dwie rzeczy z tego modułu: najpierw identyfikator pliku, potem po `#` ścieżkę do definicji w środku, np. `wspolne#/$defs/kodPocztowy`. Walidator najpierw znajduje plik, a potem idzie w nim po ścieżce, dokładnie tak, jak przy odwołaniu w obrębie jednego pliku. <!-- twierdzenie --> <!-- zrodlo: core §8.2.3.1, §9.2 -->

**Pliki bez `$id`, z odwołaniami po ścieżkach.** W wielu repozytoriach schematy nie mają `$id` i odwołują się do siebie jak do plików na dysku, np. `./adres.json`. To nie błąd: adresem bazowym schematu bez `$id` jest miejsce, z którego go wczytano, więc odwołanie względne rozwiązuje się względem katalogu pliku. Działa to, dopóki narzędzie wczytuje pliki z dysku z zachowaniem ich położenia; po skopiowaniu schematu gdzie indziej odwołania mogą przestać pasować. W tym kursie używamy `$id`, bo nie zależy od tego, skąd plik wczytano. <!-- twierdzenie --> <!-- zrodlo: core §9.1.1, §8.2.1 -->

**Jak podać walidatorowi wiele plików.** Walidator nic nie pobiera sam, więc wszystkie pliki trzeba mu dać przed sprawdzeniem dokumentu. Część narzędzi uruchamia się z linii poleceń, czyli tekstowym poleceniem w terminalu zamiast przycisków w oknie; tak samo działają automatyczne sprawdzenia uruchamiane po każdej zmianie w repozytorium (pipeline CI). W takich narzędziach zwykle podaje się plik główny i osobno listę plików, do których się odwołuje. W kodzie każdy plik rejestruje się w walidatorze, zanim skompiluje się schemat główny. Jeśli walidator zgłasza „nie można rozwiązać odwołania”, najczęściej brakuje któregoś pliku na tej liście albo jego `$id` nie zgadza się z odwołaniem. Szczegóły są w dokumentacji konkretnego narzędzia. <!-- twierdzenie --> <!-- zrodlo: core §9.1.2 -->
