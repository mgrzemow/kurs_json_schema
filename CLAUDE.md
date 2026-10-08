# Trener JSON Schema — jednodniowy kurs zdalny

Interaktywna strona do jednodniowego kursu JSON Schema (ok. 5 h, zdalnie), na której jest **wykład i ćwiczenia**, oraz statyczne materiały do rozesłania po kursie. Oba produkty powstają z jednego źródła treści. Do napisania są nie tylko ćwiczenia, ale też wszystkie części opisowe (wykład).

**Prowadzący** to autor kursu i trener, który poprowadzi zajęcia. To z nim pracujesz i to on podejmuje decyzje merytoryczne. W tym pliku nie ma innych ról.

## Jak pracujesz z prowadzącym

- **Na początku pracy, zanim powstanie jakakolwiek treść:**
  1. **Profile uczestników.** Zapytaj prowadzącego, co wie hipotetyczny uczestnik. Profili może być kilka (np. analityk biznesowy, analityk systemowy, programista). Dopytaj o: rolę i to, co uczestnik będzie robił ze schematami po kursie; znajomość JSON, API/REST, XML/XSD, wyrażeń regularnych, OpenAPI/Swagger; programowanie (czy i w czym); narzędzia, z których korzysta (np. Excel, Postman); angielski techniczny; typowe obawy. Zapisz wynik w `docs/profile-uczestnikow.md`: dla każdego profilu kim jest, co wie, czego nie wie, czego potrzebuje po kursie. Pokaż plik prowadzącemu do akceptacji.
  2. **Wiodący temat.** Razem z prowadzącym starannie wybierz wiodący temat (domenę) przykładów, danych i ćwiczeń. Zaproponuj 2–3 warianty z krótkim uzasadnieniem i poczekaj na decyzję.
- **Treść ćwiczeń i dane w plikach JSON są do ustalenia w rozmowie.** Nie wymyślaj ich bez akceptacji. Najpierw zaproponuj (krótko, w punktach), poczekaj na decyzję, potem implementuj.
- **Tryb pracy nad treścią (decyzja z 2026-10-08, po akceptacji prototypu):** najpierw dla każdego modułu szczegółowy opis sekcji wykładu i ćwiczeń (co, jakie przykłady, pytania do sali, pułapki, źródła), moduł po module, każdy do akceptacji prowadzącego. Dopiero gdy wszystkie opisy są zaakceptowane, generujesz cały kurs naraz (wykłady, ćwiczenia, dane), a potem prowadzący nanosi poprawki. Opisy sekcji zapisuj w `docs/konspekty/`.
- **W razie wątpliwości pytaj**, zamiast zgadywać. Dotyczy to szczególnie tempa wykładu, tego, co uczestnik już wie, i miejsc, w których zasady dydaktyczne z tego pliku nie pasują.
- Decyzje zapisane w tym pliku są ustalone. Jeśli coś w praktyce okaże się niewykonalne albo złe, powiedz o tym wprost i zaproponuj alternatywę, zamiast po cichu zmieniać kierunek.
- Po ustaleniu nowych decyzji zaproponuj aktualizację tego pliku.

## Odbiorcy

Szczegółowe profile: `docs/profile-uczestnikow.md` (do utworzenia z prowadzącym, patrz wyżej). Jeśli pliku nie ma albo profil jest niepełny, zapytaj prowadzącego, zanim zaczniesz pisać treść.

Ogólnie w jednej grupie są:
- **analitycy** — mało techniczni, częściej czytają i poprawiają cudze schematy niż piszą od zera; VS Code i terminal są dla nich barierą;
- **osoby, które będą pisać schematy** — potrzebują pewności w średnio zaawansowanych konstrukcjach.

Język kursu, interfejsu, komunikatów i materiałów: **polski**.

## Format kursu

- Zdalnie, ok. 5 h z dwiema przerwami po 10 min. Prowadzący udostępnia ekran.
- **Zajęcia prowadzone przez trenera**, z ćwiczeniami wykonywanymi indywidualnie przez każdego uczestnika. Żadnej pracy w parach ani grupach.
- Rytm każdego modułu: prowadzący omawia wykład na udostępnionym ekranie i pokazuje przykłady na żywo w trenerze → uczestnicy samodzielnie robią ćwiczenia, a prowadzący obserwuje postępy i pomaga → wspólne omówienie.
- **Ćwiczeń jest więcej, niż zmieści się w czasie.** Prowadzący dobiera ich liczbę do grupy albo daje limit czasu („zróbcie, ile zdążycie w 15 minut”).
- Po kursie dostęp do ćwiczeń znika (strona zostaje zdjęta z GitHub Pages), uczestnicy dostają statyczne materiały. Niedokończone ćwiczenia są w materiałach, więc można je zrobić później.

## Zasady dydaktyczne

### Wykład

1. **Najpierw problem, potem rozwiązanie.** Kolejność toku myślenia: po co, potem jaka logika, na koniec składnia. Chodzi o logikę wypowiedzi, a nie o stałe słowa czy nagłówki. Nie twórz powtarzalnych sekcji „Problem / Logika / Składnia”. Tam, gdzie ten tok nie ma sensu (np. strona ze ściągą słów kluczowych), daj prowadzącemu do decyzji, jak to ułożyć.
2. **Mało nowych rzeczy na krok, mało odwołań do przodu.** Odwołanie do przodu tylko wyraźnie oznaczone, np. „wrócimy do tego w module 7”. Nie ma sztywnego limitu: decyduje dostępny czas, a czasem trzeba iść szybciej. W razie wątpliwości pytaj.
3. **Niuanse pokazuj parami.** Dwa schematy różniące się tylko tym niuansem, pokazane na dokumencie, dla którego dają różny werdykt (np. `anyOf` kontra `oneOf`, wzorzec z `^…$` i bez).
4. **Każde nowe pojęcie musi zostać gdzieś objaśnione.** Co uczestnik już wie, wynika z profili w `docs/profile-uczestnikow.md`. Jeśli nie masz pewności, czy pojęcie wymaga wyjaśnienia, zapytaj prowadzącego.
5. **Pytania do sali.** Co jakiś czas blok „przejdzie czy nie?”: prowadzący pyta, uczestnicy odpowiadają na czacie, potem odsłonięcie. Szczególnie po etapach koncepcyjnie trudnych.
6. **Jeden wiodący temat rośnie przez cały kurs.** Ten sam obiekt (model, dokument) rozbudowuje się z modułu na moduł. Jeśli w którymś module wiodący temat zupełnie nie pasuje, zaproponuj prowadzącemu alternatywę i daj do decyzji.

Ta sama treść wykładu pełni dwie role:
- **na kursie** prowadzący omawia ją na udostępnionym ekranie, więc tekst jest podzielony na krótkie sekcje, a przykłady schematów i dokumentów otwiera się przyciskiem „Otwórz w edytorze”;
- **po kursie** jest rozdziałem statycznych materiałów, więc musi być zrozumiała bez głosu prowadzącego.

Zakres wykładu wyznacza program modułu i lista pułapek (niżej). Każde hasło z obowiązkowego zakresu ma w wykładzie co najmniej akapit. Diagramy tam, gdzie pomagają (np. diagramy składni z json.org, zależności między plikami schematów), rysowane w SVG/HTML, a nie pobierane jako obrazki.

### Ćwiczenia

1. **Wymagania językiem biznesu, nie słowami kluczowymi** („numer klienta ma 8 cyfr”, a nie „użyj `pattern`”).
2. **Staraj się dawać trzy ćwiczenia do tematu** (temat to mniej więcej sekcja modułu):
   - ★ zastosuj wzorzec rozwiązania pokazany na wykładzie do innego problemu;
   - ★★ podane jest tylko wymaganie albo problem;
   - ★★★ zawiera niejednoznaczność, trudność albo pułapkę.
3. **Przykłady projektowane przeciw popularnym błędnym rozwiązaniom**, ale nie na siłę: tylko tam, gdzie istnieje typowy, często popełniany błąd. Nie każde ćwiczenie musi być podchwytliwe. Każdy taki typowy błąd zapisz w danych ćwiczenia jako „błędne rozwiązanie”, a test sprawdza, że oblewa ono co najmniej jeden przykład.
4. **Stopniowana pomoc:** werdykt z wyjaśnieniem, dlaczego nie działa → podpowiedź → na końcu rozwiązanie. Podpowiedź nigdy nie zdradza rozwiązania.
5. **Każdy temat pojawia się kilka razy:** pierwszy raz jako temat sam w sobie, potem jako część innych tematów. Przygotuj tabelę „temat × moduły, w których występuje” i tematy pojawiające się tylko raz daj prowadzącemu do decyzji.
6. **Poprawianie częściej niż pisanie od zera.** Zepsute albo niekompletne rozwiązanie na start ćwiczy rozwiązywanie problemu i skraca czas ćwiczenia.
7. **Czas:** każde ćwiczenie ma szacowany czas dla przeciętnego uczestnika. Pojedyncze ćwiczenie ★★ to orientacyjnie kilka minut (ok. 5–10), ale to szacunek, a nie limit. Ćwiczeń w module może być więcej, niż mieści się w czasie, dlatego:
   - **kolejność ma znaczenie** — najważniejsze ćwiczenia są pierwsze, żeby grupa, która zrobi tylko kilka, zrobiła te właściwe;
   - **każde ćwiczenie da się zrobić niezależnie** od poprzednich w module.

### Rzetelność

Dwa niezależne źródła prawdy, które sprawdzają co innego:
- **narzędzie IT (walidator)** sprawdza **werdykty**: czy dany schemat naprawdę przepuszcza albo odrzuca dany dokument;
- **specyfikacja wczytana z pliku, a nie z pamięci modelu**, sprawdza **twierdzenia w tekście** o tym, jak działa JSON Schema.

Zasady:
1. Każdy schemat, dokument i rozwiązanie — w ćwiczeniach i w wykładzie — przechodzi przez walidator w testach. Werdykty w tekście są wyliczane, a nie wpisane ręcznie.
2. **Specyfikacja leży w repozytorium**, w `spec/`: JSON Schema 2020-12 Core i Validation (tekst), RFC 8259 (składnia JSON, źródło dla modułu 1), RFC 6901 (JSON Pointer, źródło dla modułu 7), oficjalne metaschematy 2020-12 i katalog `tests/draft2020-12` z oficjalnego [JSON-Schema-Test-Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite). Pobierz je w pierwszej sesji i nigdy nie edytuj. Zestaw testów rozstrzyga, gdy zdanie w specyfikacji jest niejasne.
3. **Twierdzenia o specyfikacji sprawdzane u źródła.** Przy najmniejszej niepewności zajrzyj do `spec/` albo sprawdź zachowanie walidatorem, zamiast pisać z pamięci.
4. **Każde twierdzenie o działaniu JSON Schema w wykładzie ma źródło** w danych (ukryte dla uczestników): numer sekcji specyfikacji albo plik z zestawu testów. Prowadzący sprawdza je wyrywkowo.
5. **Po napisaniu lub zmianie treści uruchom agenta `weryfikator-specyfikacji`** (`.claude/agents/weryfikator-specyfikacji.md`). Działa w osobnym kontekście, czyta tylko `spec/` i ocenia twierdzenia bez znajomości Twojego rozumowania.
6. **Rozbieżność** między walidatorem a specyfikacją, albo między Twoim tekstem a raportem weryfikatora, idzie do decyzji prowadzącego. Nie rozstrzygaj jej sam.
7. **Słowniczek terminów** w `docs/slowniczek.md`: polskie odpowiedniki ustalone raz i używane konsekwentnie, np. keyword = słowo kluczowe, instance = instancja, annotation = adnotacja, assertion = asercja. Aktualizuj go przy każdym nowym terminie. Tam, gdzie nazwa angielska jest popularniejsza, w tekście podawaj obie.
8. **Hooki Claude Code** (`.claude/settings.json`): gdy powstaną testy, skonfiguruj uruchamianie testów treści po zmianach w `tresc/` albo przed zakończeniem pracy, tak żeby nieprzechodzące testy wracały do Ciebie jako błąd do poprawienia.

### Styl tekstu

Unikaj ogólnikowych wstępów („JSON Schema to potężne narzędzie…”), ścian punktorów zamiast krótkich akapitów z przykładem, tonu reklamowego i równej szczegółowości dla rzeczy ważnych i nieważnych. Kurs nie może wyglądać na wygenerowany według szablonu.

Styl zwięzły, rzetelny, techniczny, czasem lekka ironia, czasem żart, co jakiś czas dygresja z anegdotą dotyczącą tematu. Anegdoty i historie muszą być prawdziwe i mieć źródło albo być wyraźnie oznaczone jako wymyślony przykład.

Tematy najważniejsze dla szkolenia — styl bardziej rozbudowany, tematy poboczne — bardziej zwięzły.

### Gdy zasady się wykluczają

Kolejność ważności: poprawność merytoryczna > obowiązkowy zakres formalny > czas modułu > pozostałe zasady. W razie koniecznych kompromisów między zasadami zapytaj prowadzącego.

## Weryfikacja kursu oczami uczestnika

Po ukończeniu treści (albo wcześniej, na prośbę prowadzącego, dla pojedynczego modułu) uruchom agenta `uczestnik` (`.claude/agents/uczestnik.md`) **osobno dla każdego profilu** z `docs/profile-uczestnikow.md`. Agent przechodzi wykład i ćwiczenia wyłącznie z wiedzą danego profilu i zgłasza miejsca niejasne, za szybkie, za nudne, niejednoznaczne polecenia i nierealne czasy ćwiczeń. Zbierz raporty w `docs/raporty-uczestnikow/` i przedstaw prowadzącemu podsumowanie z propozycjami zmian. Raport jest sygnałem, a nie wyrocznią: model udający początkującego bywa niedokładny, decyzję podejmuje prowadzący.

Do tej weryfikacji potrzebny jest skrypt `scripts/sprawdz-rozwiazanie`, który przyjmuje identyfikator ćwiczenia i schemat (przez stdin) i wypisuje dokładnie te werdykty i polskie komunikaty, które uczestnik zobaczyłby w trenerze.

## Decyzje merytoryczne

- **Wersja: cały kurs na JSON Schema 2020-12, z solidną wiedzą o różnicach względem draft-07.** Decyzja z 2026-10-08. Uzasadnienie: w publicznych korpusach draft-07 nadal dominuje (SchemaStore ok. 91% draft-07, 8% 2020-12; APIs.guru 59% OpenAPI 3.0, 1,4% OpenAPI 3.1), więc uczestnik po kursie najczęściej spotka draft-07, ale uczymy wersji aktualnej. Konsekwencje:
  - ćwiczenia i wszystkie przykłady wyłącznie w 2020-12;
  - różnice do draft-07 omawiane solidnie: przy każdym słowie kluczowym, które się różni, krótka ramka „w draft-07” (`definitions` kontra `$defs`, tablica w `items` kontra `prefixItems`, `exclusiveMinimum` jako boolean kontra liczba, `dependencies` kontra `dependentRequired`, słowa obok `$ref` ignorowane kontra działające), oraz kolumna „w draft-07” w ściągawce słów kluczowych;
  - **inne wersje opisane tylko w jednym miejscu** (moduł 2, „wersje w pigułce”): krótka historia (draft-00…03 prehistoria, draft-04, draft-06, draft-07 jako najczęściej spotykany w praktyce, 2019-09 przejściowy, 2020-12 aktualny, stabilna wersja w przygotowaniu — wg IETF nie wcześniej niż 2027) i jak rozpoznać stary schemat (`definitions`, `exclusiveMinimum: true`, `id` bez dolara, tablica w `items`). Poza modułem 2 nie wspominamy o draft-04, draft-06 ani 2019-09.
- **Metaschematy — tylko opisowo.**
- **OpenAPI — tylko opisowo**, jako jeden z obszarów w module 9: `components/schemas`, `$ref`, OpenAPI 3.0 (własny dialekt bliski draft-04, `nullable`) kontra 3.1 (pełne 2020-12). Moduł 9 (decyzja z 2026-10-08) to przegląd praktycznych zastosowań JSON Schema ze specyfiką każdego obszaru, bez ćwiczeń.
- **Wiodący temat: zamówienie w hurtowni części rowerowych** (sklep → magazyn). Szczegóły i plan rozbudowy obiektu moduł po module: `docs/domena.md`. Nazwy pól polskie, camelCase, bez polskich znaków (`numerKlienta`). Identyfikatory schematów w `https://kurs.example/schematy/…`.
- **Nacisk ćwiczeniowy na poziom średni (★★).**
- Kurs ma służyć obu grupom odbiorców: ćwiczenia z czytania i poprawiania schematów (analitycy) przeplatają się z pisaniem (autorzy schematów).
- Pułapki, które muszą wybrzmieć (w wykładzie lub w ćwiczeniach):
  - pusty schemat `{}` przepuszcza wszystko;
  - `properties` nie oznacza „wymagane” — do tego jest `required`;
  - `additionalProperties` domyślnie pozwala na dowolne pola (literówki przechodzą bez słowa);
  - pole opcjonalne ≠ pole dopuszczające `null` ≠ pusty tekst;
  - `format` jest domyślnie tylko adnotacją;
  - `default` niczego nie wpisuje do danych;
  - nieznane słowa kluczowe są po cichu ignorowane (w v1 ma się to zmienić);
  - `pattern` bez `^` i `$` dopasowuje fragment tekstu; w JSON-ie `\` trzeba podwoić;
  - `oneOf` zawodzi, gdy pasują dwie opcje naraz;
  - `$id` to identyfikator, a nie adres do pobrania — walidator niczego nie ściąga z sieci;
  - w 2020-12 słowa obok `$ref` działają (w draft-07 były ignorowane);
  - generator schematów opisuje to, co jest w przykładach, a nie to, co powinno być;
  - `additionalProperties: false` w gałęzi `allOf` odrzuca wszystko, bo każda gałąź widzi tylko swoje `properties`; rozwiązaniem w 2020-12 jest `unevaluatedProperties` (jeden akapit w module 6, bez osobnego ćwiczenia);
  - `multipleOf` z ułamkiem dziesiętnym (np. `0.01`) bywa zawodny przez arytmetykę zmiennoprzecinkową (moduł 3).

## Program (kolejność dydaktyczna)

| Moduł | Min | Zawartość (hasłowo) |
|---|---|---|
| 0. Start | 10 | po co JSON Schema (umowa między zespołami, walidacja, dokumentacja); jak działa trener |
| 1. JSON | 25 | czym jest JSON; JSON a XML (analogia JSON Schema ↔ XSD); struktury danych wg json.org: object, array, value, string, number, whitespace (z diagramami składni); typowe błędy |
| 2. Pojęcia | 15 | dokument JSON, instancja, dokument JSON Schema; metaschemat i `$schema` (opisowo); wersje w pigułce |
| 3. Walidacja wartości | 40 | walidacja dowolnego typu (`type`, `enum`, `const`); teksty (`minLength`, `maxLength`, `pattern`); mini-lekcja wyrażeń regularnych (dialekt ECMA-262, kotwice, klasy, powtórzenia, alternatywy, ucieczki w JSON-ie); liczby (`minimum`, `maximum`, `exclusive*`, `multipleOf`) |
| *przerwa* | 10 | |
| 4. Obiekty i listy | 45 | `properties`, `required`, `additionalProperties`, `null` kontra brak pola; `items`, `minItems`/`maxItems`, `uniqueItems`, `contains`, `prefixItems` (krótko) |
| 5. Formaty i adnotacje | 25 | zdefiniowane formaty 2020-12 (`date`, `date-time`, `email`, `uuid`, `uri`, `ipv4`…) — adnotacja kontra asercja; adnotacje metadanych: `title`, `description`, `examples`, `default`, `deprecated`, `readOnly`, `writeOnly` |
| *przerwa* | 10 | |
| 6. Łączenie warunków | 30 | `allOf`, `anyOf`, `oneOf`, `not`; `if`/`then`/`else`; `dependentRequired` |
| 7. Schematy z wielu części | 40 | identyfikatory fragmentów (JSON Pointer, `$anchor`); `$defs`, `$ref`; ładowanie i przetwarzanie schematów (`$id`, adres bazowy, rozwiązywanie odwołań); wiele plików; `$ref` z regułami obok |
| 8. Nie musicie pisać od zera | 35 | generatory schematów: z przykładów (genson, quicktype), z kodu (pydantic, Zod/TS, Java, .NET), z XSD, modele AI; co generują źle; lista kontrolna poprawek; **ćwiczenie końcowe: poprawa wygenerowanego schematu** |
| 9. Praktyczne zastosowania JSON Schema | 15 | wyłącznie wykład: najpopularniejsze obszary użycia i specyfika każdego z nich (m.in. OpenAPI, pliki konfiguracyjne i podpowiedzi w edytorach, walidacja w kodzie, komunikaty i zdarzenia, ustrukturyzowane odpowiedzi modeli AI); lista obszarów do ustalenia z prowadzącym w konspekcie; informacja o materiałach |

Moduły opisowe (2, 9, części 5 i 8) mogą być w całości wykładem; moduł 9 jest wyłącznie wykładem, bez ćwiczeń. Moduły 3, 4 i 7 to rdzeń — nie skracać. Przy braku czasu skracamy moduł 6 (zostaje `if`/`then`) i 9.

### Ćwiczenie końcowe (moduł 8)

Punkt wyjścia to **prawdziwy wynik generatora genson** (czytelny, jeden zagnieżdżony schemat, typowe wady). Dane wejściowe do generatora ustalamy z prowadzącym. Generujemy je naprawdę (`pip install genson`, `genson -i 2 plik1.json plik2.json …`), nie piszemy ręcznie „na wzór”. W wykładzie obok ten sam przykład z quicktype (`npx quicktype --lang schema …`) dla porównania. Typowe wady, które ćwiczenie ma odsłonić: `required` wywnioskowane z przykładów, brak reguł biznesowych (`enum`, `pattern`, zakresy, `minItems`), brak lub nadmiar `additionalProperties`, przypadkowe formaty, nagłówek `$schema` bez wersji (genson) lub stary draft (quicktype).

## Obowiązkowy zakres formalny

Program poniżej został narzucony z zewnątrz. Jest minimum i bywa nielogiczny, ale **każde hasło musi być formalnie pokryte** (choćby hasłowo), na wypadek dociekliwego uczestnika. Hasła mają się pojawić **dosłownie w nagłówkach** trenera i materiałów po kursie.

| Hasło z programu | Moduł |
|---|---|
| 1. Wprowadzenie do JSON: Czym jest JSON? / JSON a XML / Podstawowe struktury danych (object, array, value, string, number, whitespace) | 1 |
| 2. Podstawy JSON Schema: Dokument JSON / Instancje / Dokument JSON Schema | 2 |
| 2. Identyfikatory fragmentów / Ładowanie i przetwarzanie schematów | 7 |
| 3. Walidacja JSON Schema: Walidacja instancji tekstowych / Walidacja instancji numerycznych / Wyrażenia regularne | 3 |
| 4. Metaschematy | 2 (opisowo) |
| 4. Walidacja instancji dowolnego typu | 3 |
| 4. Zdefiniowane formaty / Podstawowe adnotacje metadanych | 5 |

Utrzymuj tę tabelę jako test: materiały po kursie muszą zawierać każde hasło.

## Rodzaje ćwiczeń

1. **Napisz/popraw schemat** — edytor schematu + przykłady „muszą przejść” / „muszą zostać odrzucone”, werdykty na bieżąco przy każdej zmianie. Przy przykładzie, który niesłusznie przechodzi, opcjonalna wskazówka; przy poprawnie odrzuconym — powód po polsku.
2. **Napraw dokument JSON** — zepsuty JSON, polskie komunikaty składni wskazujące linię.
3. **Zgadnij, potem sprawdź** — gotowy schemat i dokumenty; uczestnik najpierw obstawia werdykt, potem trener weryfikuje.
4. **Projekt z wieloma plikami** — kilka schematów z `$id` w zakładkach, jeden plik główny.
5. **Popraw wygenerowany schemat** — ćwiczenie końcowe (moduł 8).

Dane każdego ćwiczenia: poziom (★/★★/★★★), szacowany czas, kolejność w module, kontekst, polecenie, nowe słowa kluczowe, podpowiedź, rozwiązanie, schemat startowy, przykłady z krótkim opisem, błędne rozwiązania (jeśli są typowe), źródła twierdzeń. Dobre praktyki:
- jeden przykład sprawdza jedną rzecz;
- przykłady na granicach zakresów (np. dokładnie `minimum`);
- schemat startowy działa częściowo, żeby na starcie część przykładów była zielona, a część czerwona.

## Architektura techniczna

- **Statyczna strona na GitHub Pages.** Żadnego serwera. Krok budowania jest dozwolony, ale wynik ma być zbiorem statycznych plików.
- **Zero CDN w trakcie działania.** Firmowe sieci uczestników mogą blokować CDN-y. Biblioteki (Monaco, Ajv, ajv-formats) pochodzą z npm z wersjami przypiętymi w `package-lock.json`, a Vite buduje wszystko do `dist/` (workery Monaco z tej samej domeny). Katalog `vendor/` nie istnieje. Czcionki systemowe. Test: żaden plik w `dist/` nie odwołuje się poza własną domenę.
- **Edytor: Monaco.** Kolorowanie, podpowiedzi i opisy po najechaniu z JSON language service.
  - Do podpowiedzi rejestrujemy **własny, uproszczony „schemat podpowiedzi”** dla 2020-12 z **polskimi opisami** (`description`/`markdownDescription`), np. „required — lista pól, które muszą wystąpić”. Oficjalny metaschemat 2020-12 jest podzielony na słowniki i używa `$dynamicRef`, z czym language service może sobie nie radzić — sprawdź, ale domyślnie zakładaj własny, spłaszczony schemat.
  - Własną diagnostykę Monaco (angielskie komunikaty) wyłączamy albo filtrujemy. Źródłem prawdy są nasze polskie komunikaty. Zweryfikuj, czy wyłączenie walidacji nie wyłącza podpowiedzi.
  - Sprawdź aktualny sposób osadzania Monaco bez CDN (AMD `min/vs` kontra ESM i bundler) i to, czy web workery ładują się z tej samej domeny. Wybierz najprostszy działający wariant.
- **Walidator: Ajv w trybie 2020-12** (`allErrors: true`, `strict: false`). Formaty przez `ajv-formats` z **przełącznikiem w pasku „walidacja `format`” (włączony = `format` jest asercją)** (moduł 5). Dwie instancje Ajv (bez formatów i z `ajv-formats` w trybie `full`); opcje w `trener/rdzen/walidator.js`. Znane odstępstwa Ajv od oficjalnego zestawu testów są w `tests/znane-odstepstwa.json` (głównie `$dynamicRef`, `unevaluated*`, `$ref` z względnymi `$id`, pusty `enum`); test `tests/ajv-spec.test.mjs` pilnuje, żeby nie przybyło nowych.
- **Własny parser JSON z polskimi komunikatami** (zbędny przecinek, apostrofy, cudzysłów drukarski z Worda, przecinek dziesiętny, `True`/`None`, niepodwojony `\`, komentarze, twarda spacja, duplikaty pól) z pozycją błędu → zaznaczenie linii w edytorze.
- **Tłumaczenie błędów Ajv na polski**, z miejscem w dokumencie („Pole „x” w elemencie nr 2: …”) i, przy wielu plikach, informacją, z którego pliku pochodzi reguła.
- **Ostrzeżenia o schemacie**: nieznane słowo kluczowe (z podpowiedzią najbliższego, np. `requried` → `required`; przy obiekcie — „przenieś do properties”), pole w `required`, którego nie ma w `properties`, duplikaty kluczy, `format` jako adnotacja.
- **Wiele plików**: wirtualny projekt; każdy schemat ma `$id` w jednej przestrzeni (np. `https://kurs.example/schematy/…`); rejestracja przez `addSchema`; klik w `$ref` otwiera cel; prosty diagram zależności z zaznaczeniem zepsutych odwołań; podgląd „jak to widzi walidator”.
- **Sekcja wykładu** w każdej lekcji: przełączanie wykład ↔ ćwiczenia, przykłady z przyciskiem „Otwórz w edytorze”, czytelna przy udostępnianiu ekranu w trybie „Duży tekst”.
- **Postęp w `localStorage`** (klucz z przestrzenią nazw, każdy odczyt i zapis w `try/catch`). Cofanie zmian (Ctrl+Z) musi działać także po „Wstaw rozwiązanie” i „Zacznij od nowa”.
- Tryb „Duży tekst” do udostępniania ekranu. Jasny i ciemny motyw. Docelowo laptopy, ale wąski ekran nie może się rozsypać.
- Opcjonalnie: zakładka „Generator” (prosty generator w stylu genson w JS — uczestnik wkleja własny JSON i widzi wygenerowany schemat).

## Jedno źródło treści → dwa produkty

- Treść (wykłady, ćwiczenia, przykłady, rozwiązania, źródła) w `tresc/` jako dane (np. Markdown + JSON/YAML). Kod trenera nie zawiera treści na sztywno.
- `build` generuje:
  1. **trener** → `dist/` → GitHub Pages;
  2. **materiały statyczne** (HTML + PDF, np. przez Playwright) — bez interakcji, z werdyktami przykładów **policzonymi w trakcie budowania** prawdziwym walidatorem, rozwiązania w osobnym dodatku na końcu, ściągawka słów kluczowych, nagłówki zgodne z obowiązkowym zakresem.
- GitHub Actions: „Publikuj trener” (Pages przy zmianie na `main`) i „Materiały” (uruchamiane ręcznie, wynik jako artefakt do pobrania). Prowadzący nie musi niczego instalować lokalnie.
- Procedura po kursie: wyłączyć Pages → uruchomić „Materiały” → wysłać PDF/HTML.

## Proponowana struktura repozytorium

```
tresc/                 lekcje, ćwiczenia, przykłady, rozwiązania, źródła (jedyne źródło treści)
trener/                kod interaktywnej strony
materialy/             szablon statycznych materiałów
public/                pliki kopiowane do dist/ bez zmian (public/tresc/ generowane, ignorowane w git)
spec/                  specyfikacja 2020-12, metaschematy, oficjalny zestaw testów (tylko do odczytu)
docs/                  profile-uczestnikow.md, slowniczek.md, raporty-uczestnikow/
scripts/               zbuduj-tresc, zbuduj-materialy, sprawdz-rozwiazanie, testuj-ajv-spec, sprawdz-strone, sprawdz-interakcje (Playwright)
tests/                 testy ćwiczeń, wykładu, parsera i komunikatów
.claude/agents/        weryfikator-specyfikacji.md, uczestnik.md
.claude/settings.json  hooki uruchamiające testy
.github/workflows/
```

## Testy (uruchamiane w CI i przez hooki)

- Dla każdego ćwiczenia: rozwiązanie przechodzi wszystkie przykłady, schemat startowy oblewa co najmniej jeden, każde zapisane błędne rozwiązanie oblewa co najmniej jeden, wszystkie przykłady są poprawnym JSON-em.
- Każdy schemat i dokument z wykładu jest poprawny, a werdykty podane w tekście zgadzają się z walidatorem.
- Parser: zestaw zepsutych dokumentów → oczekiwany polski komunikat i pozycja.
- Pokrycie obowiązkowego zakresu: każde hasło z tabeli występuje w nagłówkach materiałów.
- Każde twierdzenie w wykładzie oznaczone jako wymagające źródła ma podane źródło.

## Stan implementacji

Prototyp trenera z całą infrastrukturą techniczną jest zbudowany (2026-10-08) i opublikowany: https://mgrzemow.github.io/kurs_json_schema/. Projekt: `docs/superpowers/specs/2026-10-08-prototyp-trenera-design.md`, plan: `docs/superpowers/plans/2026-10-08-prototyp-trenera.md`. Treść modułu 3 w `tresc/` jest **próbna** (pole `"probna": true` w `modul.json`) i zostanie zastąpiona przy pisaniu prawdziwego modułu 3.

Polecenia: `npm run dev` (podgląd lokalny), `npm test` (wszystkie testy, ok. 6 s), `npm run build` (treść + trener do `dist/`), `npm run materialy` (HTML + PDF do `materialy/wynik/`), `node scripts/sprawdz-interakcje.mjs` (klikanie po zbudowanej stronie w Chromium; wymaga `npm run preview` w tle), `node scripts/sprawdz-rozwiazanie.mjs <id> < plik` (werdykty jak w trenerze).

Format treści: katalog na moduł (`tresc/moduly/NN-nazwa/` z `modul.json`, `wyklad.md`, `cwiczenia/<id>/cwiczenie.json` + pliki), opisany w specu. Bloki kodu w wykładzie: ```` ```json schemat=nazwa ````, ```` ```json dokument=nazwa schemat=nazwa oczekiwane=przechodzi|odrzucony ````, ```` ```json pytanie=nazwa schemat=… oczekiwane=… ````. Twierdzenia: `<!-- twierdzenie -->` w akapicie plus `<!-- zrodlo: validation §6.3.3 -->`. Ramka draft-07: cytat zaczynający się od `**W draft-07:**`.

Stary jednoplikowy prototyp (`prototyp/trener.html`, CodeMirror + Ajv z CDN) jest już tylko historyczny; jego logika została przeniesiona do `trener/rdzen/`.

## Styl tekstów w interfejsie

- Krótkie, proste zdania, bez żargonu tam, gdzie nie jest potrzebny. Piszemy do analityka, nie do programisty.
- Komunikat błędu mówi, co jest nie tak i jak to naprawić, bez przepraszania.
- Formy neutralne płciowo (tryb rozkazujący: „Dodaj…”, „Popraw…”).
- Nazwy słów kluczowych zawsze w `kodzie`, dokładnie tak, jak w specyfikacji.

## Otwarte kwestie (do ustalenia z prowadzącym)

- Ogólna struktura strony: zrealizowana w prototypie (SPA z trasami po `#`, start → moduł z zakładkami Wykład/Ćwiczenia → ćwiczenie w trzech kolumnach, osobna piaskownica i generator); do oceny przez prowadzącego na działającej stronie.
- Treść wszystkich ćwiczeń (domena ustalona: `docs/domena.md`).
- Konspekty wykładu dla każdego modułu.
- Czy potrzebne są notatki dla prowadzącego (niewidoczne dla uczestników).
- Czy w każdym module ma być ramka „minimum dla analityka”.
- Dane wejściowe do generatora w ćwiczeniu końcowym.
- Czy ćwiczenia są widoczne od razu, czy moduły odblokowuje prowadzący. W prototypie wszystko jest widoczne; odblokowywanie na statycznej stronie jest możliwe tylko przez plik konfiguracyjny w repozytorium z opóźnieniem publikacji.
- Czy w trenerze ma być minutnik do pracy na czas.
- Zakładka „Generator”: zrobiona w prototypie (`#/generator`), do oceny.
- (ustalone w prototypie) Konwencja nazewnictwa w kodzie: polskie identyfikatory, nazwy plików i komentarze bez znaków diakrytycznych, nazwy z bibliotek bez zmian. Nazwy pól w danych kursu: polskie bez znaków diakrytycznych.