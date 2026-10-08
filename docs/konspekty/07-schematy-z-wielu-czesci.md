# Moduł 7: Schematy z wielu części (40 min) — opis sekcji

Status: **zaakceptowany 2026-10-08** (RFC 6901 w spec/; błędne rozwiązanie 7-3 tylko w omówieniu). Rdzeń kursu, nie skracać. Budżet: 15 min wykładu, 20 min ćwiczeń, 5 min omówienia. Nagłówki z obowiązkowego zakresu: „Identyfikatory fragmentów”, „Ładowanie i przetwarzanie schematów”. Kolejność dydaktyczna ustalona 2026-10-08: najpierw `$defs`/`$ref` w jednym pliku, potem wiele plików, potem `$id` i adres bazowy jako „jak walidator to znajduje”, a JSON Pointer i `$anchor` jako składnia celu odwołania.

RFC 6901 (JSON Pointer) jest w `spec/tekst/rfc6901.txt`; twierdzenia o składni wskaźników cytują jego sekcje.

## Sekcja 7.1: Powtórzenia w schemacie: `$defs` i `$ref` (4 min)

- Adres występuje w zamówieniu dwa razy (dostawy i do faktury). Skopiowany schemat rozjeżdża się po pierwszej poprawce (w jednym miejscu kod pocztowy ma wzorzec, w drugim nie). Rozwiązanie: definicja raz w `$defs`, użycie przez `$ref`. <!-- core §8.2.4, §8.2.3.1 -->
- `$ref` to odwołanie, nie kopia: zmiana w `$defs` działa we wszystkich miejscach. Wartość `$ref` to adres celu; `#/$defs/adres` znaczy „w tym pliku, pod kluczem `$defs`, pod kluczem `adres`”.
- `$defs` to tylko miejsce na schematy; sam w sobie niczego nie sprawdza (definicja bez `$ref` jest martwa).
- Jedno zdanie o rekurencji (kategoria z podkategoriami przez `$ref` do samego siebie), bez ćwiczenia.
- Ramka „W draft-07”: `definitions` zamiast `$defs`; w 2020-12 stara nazwa nadal działa jako zwykłe miejsce na schematy, ale `$ref` do `#/definitions/...` to tylko konwencja, nie słowo kluczowe.

## Sekcja 7.2: Identyfikatory fragmentów: JSON Pointer i `$anchor` (4 min)

- Część po `#` w odwołaniu to identyfikator fragmentu. Dwa rodzaje. <!-- core §5 -->
- **JSON Pointer**: ścieżka po kluczach rozdzielona `/`, od korzenia dokumentu: `#/$defs/adres`, `#/properties/klient/properties/adres`, `#/prefixItems/0`. Znaki specjalne: `~` zapisujemy jako `~0`, `/` jako `~1`. Wskaźnik prowadzi do dowolnego miejsca, nie tylko do `$defs`, ale odwołania w głąb `properties` są kruche (zmiana struktury je psuje). <!-- core §9.2.1; RFC 6901 §3, §4 -->
- **`$anchor`**: nazwa nadana schematowi (`"$anchor": "adres"`), do której odwołujemy się przez `#adres`, niezależnie od miejsca w pliku. Nazwa musi zaczynać się od litery. <!-- core §8.2.2 -->
- Kiedy co: JSON Pointer do `$defs` w małych schematach; `$anchor`, gdy schemat jest duży albo struktura się zmienia.
- Pytanie do sali: `$ref: "#/defs/adres"` (bez dolara) → błąd kompilacji, nie werdykt; trener pokazuje „odwołanie nie prowadzi do żadnej definicji”.
- Ramka „W draft-07”: zamiast `$anchor` używało się `$id` z samym fragmentem (`"$id": "#adres"`); w 2020-12 to niedozwolone.

## Sekcja 7.3: `$ref` z regułami obok (2 min)

- W 2020-12 słowa obok `$ref` działają: `{"$ref": "#/$defs/adres", "description": "Adres dostawy"}` dodaje opis, a `{"$ref": "#/$defs/produkt", "required": ["ean"]}` zaostrza definicję. Działa to jak `allOf` z dwóch schematów. <!-- core §8.2.3.1, §7.5.1 -->
- **Pułapka z listy obowiązkowej** i ramka „W draft-07”: w draft-07 wszystko obok `$ref` było ignorowane, więc stare schematy owijały `$ref` w `allOf`. Taki zapis w 2020-12 nadal działa, ale nie jest już potrzebny. Para: ten sam schemat z `required` obok `$ref` sprawdzony w trenerze (2020-12) i opis, co zrobiłby walidator draft-07.

## Sekcja 7.4: Wiele plików: `$id` i adres bazowy (3 min)

- Produkt jest wspólny dla zamówienia i katalogu, więc dostaje osobny plik. Każdy plik ma `$id`, czyli identyfikator w postaci URI: `https://kurs.example/schematy/produkt`. <!-- core §8.2.1 -->
- `$ref` między plikami wskazuje `$id` celu, w całości albo względnie: w pliku o `$id` `https://kurs.example/schematy/zamowienie` odwołanie `"$ref": "produkt"` rozwiązuje się względem adresu bazowego do `https://kurs.example/schematy/produkt`. Zasady jak dla linków na stronie WWW. <!-- core §8.2.1, §9.1.1 -->
- **Pułapka z listy obowiązkowej: `$id` to identyfikator, a nie adres do pobrania.** Walidator niczego nie ściąga z sieci; schematy trzeba mu dać (zarejestrować) przed użyciem. Adres `https://kurs.example/...` nie istnieje w sieci i nie musi. W trenerze: panel „jak to widzi walidator” pokazuje mapę nazwa pliku → `$id`, diagram zależności pokazuje odwołania i te zepsute. <!-- core §9.1.2 -->
- Uwaga dla autorów: `$id` wewnątrz podschematu zmienia adres bazowy dla wszystkiego poniżej; to zaawansowane i częste źródło błędów, więc w kursie `$id` tylko na poziomie pliku.
- Ramka „W draft-07”: to samo `$id`; w draft-04 `id` bez dolara (sygnał starego schematu z modułu 2).

## Sekcja 7.5: Ładowanie i przetwarzanie schematów (2 min)

- Co robi walidator po kolei: wczytuje pliki, rejestruje każdy pod jego `$id`, bierze schemat główny, w czasie kompilacji rozwiązuje każde `$ref` (adres bazowy + odwołanie → zarejestrowany schemat albo fragment), dopiero potem sprawdza dokumenty. Zepsute odwołanie to błąd kompilacji całego schematu, nie werdykt dla dokumentu. <!-- core §9.1, §9.2 -->
- Pakowanie (bundling) jednym zdaniem: wiele plików da się scalić w jeden przez wstawienie ich do `$defs` z zachowaniem `$id`; narzędzia robią to automatycznie, w kursie nie ćwiczymy. <!-- core §9.3.1 -->
- Pytanie do sali: plik `adres` ma `$id` `https://kurs.example/schematy/adres.json`, a zamówienie odwołuje się do `adres` → zepsute (identyfikatory muszą się zgadzać co do znaku).

## Ćwiczenia (kolejność według ważności; łącznie ok. 42 min)

1. **7-1 ★★ (6 min, rodzaj 1) Adres dwa razy.** Start: adres dostawy i adres do faktury opisane dwa razy, z różnicą (w jednym brak wzorca kodu). Polecenie: opisz adres raz i użyj go w obu miejscach; oba adresy mają sprawdzać kod pocztowy. Przykłady: zły kod w adresie faktury nie, oba poprawne ok. Rozwiązanie z `$defs` i `$ref`; rozwiązanie przez dopisanie wzorca w obu kopiach też przechodzi przykłady (omówienie: działa, ale wraca problem rozjazdu). Błędne: `$ref: "#/defs/adres"` (błąd kompilacji); `$ref: "adres"` w jednym pliku (nie prowadzi nigdzie). Źródło: core §8.2.4, §8.2.3.1.
2. **7-2 ★★ (8 min, rodzaj 4) Zamówienie z trzech plików.** Obecne próbne 3-4 (zepsute odwołanie `klinet`), przeniesione tu. Źródło: core §8.2.1, §9.1.2.
3. **7-3 ★★★ (8 min, rodzaj 4) Czwarty plik: produkt.** Pozycja zamówienia ma odwoływać się do wspólnego schematu produktu z osobnego pliku, a w zamówieniu dodatkowo wymagać `ean`. Start: plik `produkt` bez `$id` (trener: „plik nie ma `$id`”), odwołanie w zamówieniu już wpisane. Rozwiązanie: `$id` zgodny z przestrzenią, `$ref` z `required` obok. Przykłady: pozycja bez EAN nie (reguła obok `$ref`), produkt z katalogu bez EAN w innym pliku nadal ok (plik główny katalogu jako drugi przykład projektu nie jest potrzebny: wystarczy, że `required` jest obok `$ref`, a nie w `produkt`). Błędne: `required: ["ean"]` wpisane do pliku `produkt` (przykłady zamówienia przechodzą, ale polecenie mówi, że produkt w katalogu może nie mieć EAN; test przez przykład z drugim plikiem głównym, do rozstrzygnięcia przy generowaniu, czy trener obsłuży dwa główne; jeśli nie, błędne rozwiązanie jest tylko opisane). Źródło: core §8.2.1, §8.2.3.1.
4. **7-4 ★★ (5 min, rodzaj 3) Reguły obok `$ref`.** Schemat z `$defs/adres` i polem `adresDostawy: {"$ref": "#/$defs/adres", "required": ["kraj"]}`; dokumenty: adres z krajem ok, bez kraju nie, adres do faktury bez kraju (bez reguły obok) ok. Wyjaśnienia o 2020-12 kontra draft-07. Źródło: core §8.2.3.1, §7.5.1.
5. **7-5 ★ (4 min, rodzaj 1) Wskaźnik do kodu pocztowego.** Kod pocztowy opisany w `$defs/adres/properties/kodPocztowy` ma być użyty także w polu `kodPocztowyPaczkomatu`. Start: `$ref: "#/$defs/adres/kodPocztowy"` (brakuje `properties`). Rozwiązanie: poprawny JSON Pointer albo `$anchor` na kodzie pocztowym i `#kodPocztowy`. Błędne: start (błąd kompilacji). Źródło: core §5, §8.2.2, §9.2.1; RFC 6901.
6. **7-6 ★★★ (6 min, rodzaj 4) `$id` to nie adres.** Projekt, w którym plik `adres` ma `$id` `https://example.com/schemas/adres.json` (skopiowany z innego projektu), a zamówienie odwołuje się do `adres`. Trener: odwołanie nie prowadzi do żadnego pliku. Rozwiązanie: ujednolicić `$id` do przestrzeni projektu albo wpisać w `$ref` pełny identyfikator; oba przechodzą. Wyjaśnienie w rozwiązaniu: nic nie jest pobierane z `example.com`. Błędne: `$ref: "https://kurs.example/schematy/adres.json"` (literówka `.json`). Źródło: core §8.2.1, §9.1.2.
7. **7-7 ★ (3 min, rodzaj 1) Martwa definicja.** Schemat ma `$defs/klient` z regułami, ale pole `klient` opisane inline bez `$ref`, więc reguły z `$defs` nie działają. Przykłady: klient bez e-maila przechodzi na starcie, ma nie przechodzić. Rozwiązanie: `$ref`. Źródło: core §8.2.4.

Tabela „temat × ćwiczenia”: `$defs`/`$ref` (7-1, 7-5, 7-7), JSON Pointer/`$anchor` (7-5), reguły obok `$ref` (7-3, 7-4), `$id`/adres bazowy/wiele plików (7-2, 7-3, 7-6), ładowanie (7-2, 7-6). Każdy temat co najmniej dwa ćwiczenia poza `$anchor` (jedno, temat poboczny).

## Uwagi do decyzji

- Decyzja 2026-10-08: błędne rozwiązanie w 7-3 (`required` wpisane do pliku `produkt`) jest tylko opisane w omówieniu, bez testu i bez rozszerzania trenera.
- Rekurencja przez `$ref` tylko jednym zdaniem.
