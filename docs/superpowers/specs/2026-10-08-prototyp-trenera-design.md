# Prototyp trenera JSON Schema — projekt

Data: 2026-10-08. Status: do realizacji. Prowadzący ocenia strukturę na działającym prototypie, więc decyzje o układzie strony są robocze i mogą się zmienić po pierwszym pokazie.

## Cel

Pierwszy prototyp trenera na GitHub Pages, będący szkieletem docelowej aplikacji: cała infrastruktura techniczna kursu z próbną treścią (jeden moduł wykładu i po jednym ćwiczeniu każdego rodzaju, z domeny zamówienia w hurtowni części rowerowych). Do tego budowanie materiałów statycznych w wersji minimalnej (HTML + PDF), żeby sprawdzić założenie „jedno źródło treści, dwa produkty”.

Sukces: adres `https://mgrzemow.github.io/kurs_json_schema/` otwiera się bez żadnego odwołania do CDN i pokazuje działający edytor Monaco z polskimi podpowiedziami, walidację 2020-12 z polskimi komunikatami, przełącznik formatów, projekt wielu plików z `$id`, wykład z „Otwórz w edytorze”, postęp w localStorage, tryb „Duży tekst”, motyw jasny i ciemny. Workflow „Materiały” daje do pobrania HTML i PDF z werdyktami policzonymi w budowaniu.

Poza zakresem prototypu: prawdziwa treść modułów, minutnik, odblokowywanie modułów, notatki dla prowadzącego.

## Decyzje technologiczne

- **Vite + npm**, wynik w `dist/`, `base: '/kurs_json_schema/'`. Zero CDN w działaniu; `package-lock.json` przypina wersje. Katalog `vendor/` z CLAUDE.md nie powstaje (rolę kopii pełni lock + `dist/`); do zaktualizowania w CLAUDE.md.
- **Monaco** z npm, tylko rdzeń + język JSON, worker JSON przez `new Worker(new URL(..., import.meta.url), { type: 'module' })` i `MonacoEnvironment.getWorker`. Wbudowana diagnostyka JSON wyłączona (`validate: false`), własne znaczniki przez `setModelMarkers`. Podpowiedzi z własnego spłaszczonego schematu 2020-12 z polskimi opisami, zarejestrowanego pod URI `https://json-schema.org/draft/2020-12/schema` i dopasowanego do wszystkich modeli schematów; `enableSchemaRequest: false`. Jeśli wyłączenie `validate` wyłączy podpowiedzi, zostawiamy `validate: true` i filtrujemy markery Monaco (usuwamy właściciela `json`).
- **Ajv 2020** (`ajv/dist/2020`), dwie instancje: bez formatów i z `ajv-formats` (tryb `full`). Opcje: `allErrors: true`, `strict: false`, `useDefaults: false`, `validateSchema: true`. `unicodeRegExp`: domyślnie `true`; do potwierdzenia uruchomieniem oficjalnego zestawu testów (`spec/tests`) jako test jednorazowy z listą znanych odstępstw w `tests/znane-odstepstwa.json`.
- **Zwykły JavaScript** (ES2022, moduły ES), bez frameworka. Małe funkcje renderujące HTML ze stringów, jak w prototypie. Styl CSS w jednym pliku z własnościami (zmiennymi) dla motywów i trybu „Duży tekst”.
- **Testy**: `node --test` (wbudowany runner Node), bez dodatkowych bibliotek.
- **Materiały**: ten sam skrypt budowania treści + szablon HTML + Playwright (Chromium) do PDF.
- **Nazewnictwo w kodzie**: identyfikatory i nazwy plików po polsku bez znaków diakrytycznych (spójnie z prototypem i z treścią), komentarze po polsku. Nazwy z bibliotek (Monaco, Ajv) bez zmian. Do zapisania w CLAUDE.md jako decyzja.

## Struktura strony i nawigacja

SPA z trasami po `#`:

- `#/` start: lista modułów (tytuł, minuty, liczba ćwiczeń, postęp).
- `#/m/<nr>` moduł z zakładkami **Wykład** i **Ćwiczenia**. Wykład: jedna przewijana strona, sekcje z nagłówkami i kotwicami (`#/m/3/wyklad/<kotwica>`), przykłady z przyciskiem „Otwórz w edytorze”. Ćwiczenia: lista (numer, tytuł, gwiazdki, czas, „zrobione”).
- `#/m/<nr>/cw/<id>` ćwiczenie: trzy kolumny (zadanie | edytor | przykłady), układ zależny od rodzaju ćwiczenia (niżej).
- `#/piaskownica` wolny edytor schematu i dokumentu; „Otwórz w edytorze” z wykładu prowadzi tu z wypełnioną treścią i przyciskiem „Wróć do wykładu” (powrót do tej samej kotwicy).
- `#/generator` generator schematu w stylu genson z wklejonego JSON-a.

Pasek u góry: tytuł kursu, bieżący moduł, przełączniki „Duży tekst”, motyw, „sprawdzaj formaty”. Na wąskim ekranie kolumny układają się pionowo. Wszystkie moduły widoczne od razu.

Stan w localStorage pod kluczem `kurs-json-schema/v1`: treść edytorów per ćwiczenie i plik, zaliczone ćwiczenia, odpowiedzi w „zgadnij, potem sprawdź”, przełączniki. Każdy odczyt i zapis w `try/catch`. Cofanie: „Wstaw rozwiązanie” i „Zacznij od nowa” używają `executeEdits` Monaco, więc Ctrl+Z działa.

## Rodzaje ćwiczeń w prototypie

| Rodzaj | Środek | Prawa kolumna |
|---|---|---|
| 1. Napisz/popraw schemat | edytor schematu | przykłady w grupach „muszą przejść” / „muszą zostać odrzucone”, werdykt przy każdej zmianie, powód po polsku, opcjonalna wskazówka przy niesłusznie przechodzącym |
| 2. Napraw dokument JSON | edytor dokumentu | lista błędów składni z linią; opcjonalnie schemat, który dokument ma spełnić po naprawie |
| 3. Zgadnij, potem sprawdź | schemat tylko do odczytu | dokumenty z przyciskami „przejdzie” / „nie przejdzie”; po odpowiedzi na wszystkie: „Sprawdź” odsłania werdykty i wyjaśnienia |
| 4. Projekt z wieloma plikami | zakładki plików nad edytorem, plik główny oznaczony; klik w `$ref` otwiera cel | przykłady jak w 1 + diagram zależności (SVG) z zepsutymi odwołaniami na czerwono + podgląd „jak to widzi walidator” (lista zarejestrowanych `$id`) |
| 5. Popraw wygenerowany schemat | jak 1 (schemat startowy z genson) | jak 1 + lista kontrolna wad do odhaczenia |

Prototyp zawiera po jednym ćwiczeniu rodzajów 1–4; rodzaj 5 to rodzaj 1 z inną treścią, więc w prototypie nie ma osobnego przykładu.

## Format treści w `tresc/`

```
tresc/
  kurs.json                      tytuł, lista modułów (nr, katalog, tytuł, minuty)
  moduly/
    03-walidacja-wartosci/
      modul.json                 nr, tytuł, minuty, nagłówki z obowiązkowego zakresu
      wyklad.md                  wykład; sekcje = nagłówki ##
      cwiczenia/
        3-1-kod-pocztowy/
          cwiczenie.json         metadane, polecenie, podpowiedź, przykłady, źródła
          start.json             schemat startowy (rodzaj 1, 5); dla rodzaju 2 start.txt (zepsuty dokument nie jest poprawnym JSON-em)
          rozwiazanie.json
          bledne/
            bez-kotwic.json      typowe błędne rozwiązanie; pole "dlaczego" w cwiczenie.json
        3-4-projekt/             rodzaj 4: pliki/ z kilkoma schematami, plik główny wskazany w cwiczenie.json
```

`cwiczenie.json`: `id`, `rodzaj` (1–5), `tytul`, `poziom` (1–3), `czasMin`, `kolejnosc`, `kontekst`, `polecenie`, `slowa` (nowe słowa kluczowe), `podpowiedz`, `przyklady` (lista: `opis`, `dane`, `ok`, opcjonalnie `wskazowka`), `zrodla` (lista: tekst twierdzenia + sekcja spec albo plik testów), `bledne` (lista: plik, `dlaczego`), dla rodzaju 2: `bledy` (oczekiwane komunikaty, do testów), dla rodzaju 3: `odpowiedzi` z wyjaśnieniami, dla rodzaju 4: `glowny` i lista plików.

Wykład w Markdown z blokami kodu oznaczonymi w linii otwierającej fence: ```` ```json schemat=adres ````, ```` ```json dokument=adres-ok schemat=adres oczekiwane=przechodzi ````. Skrypt budowania paruje dokument ze schematem, liczy werdykt Ajv i porównuje z `oczekiwane`; rozbieżność to błąd budowania. Pytania do sali: blok ```` ```json pytanie=... ```` z `oczekiwane`, renderowany z przyciskiem „Odsłoń”. Źródła twierdzeń: komentarz HTML `<!-- zrodlo: validation §6.3.3 -->` po akapicie; test sprawdza, że każdy akapit oznaczony `<!-- twierdzenie -->` ma źródło. Ramka „w draft-07”: blok cytatu zaczynający się od `**W draft-07:**`.

Skrypt `scripts/zbuduj-tresc.mjs` czyta to wszystko, waliduje strukturę własnym schematem JSON (`tresc/schemat-cwiczenia.json`), konwertuje Markdown (biblioteka `marked`), liczy werdykty i zapisuje `public/tresc/kurs.json` oraz `public/tresc/modul-<nr>.json`.

## Moduły kodu

```
trener/
  rdzen/                       bez zależności od przeglądarki; importowane z Node
    parser-json.js             z prototypu: parsujJSON z polskimi komunikatami i pozycją
    komunikaty.js              z prototypu: tłumaczenie błędów Ajv (komunikat, komunikaty, podmiot…)
    analiza-schematu.js        z prototypu: nieznane słowa, required bez properties, duplikaty, format
    walidator.js               opakowanie Ajv: dwie instancje, kompilacja schematu, projekt wielu plików (addSchema), błędy kompilacji po polsku
    generator.js               generator schematu w stylu genson
    sprawdz-cwiczenie.js       dla ćwiczenia + tekstu schematu/dokumentu zwraca werdykty i komunikaty; używane przez UI, testy i scripts/sprawdz-rozwiazanie
  ui/
    main.js                    start, router po #, stan, localStorage
    edytor.js                  Monaco: tworzenie, markery, schemat podpowiedzi, zamiana treści bezpieczna dla Ctrl+Z
    schemat-podpowiedzi.json   spłaszczony 2020-12 z polskimi opisami
    widoki/start.js, modul.js, wyklad.js, cwiczenie.js, piaskownica.js, generator.js
    widoki/cwiczenie-*.js      warianty środka i prawej kolumny dla rodzajów 1–4
    diagram.js                 SVG zależności plików
    style.css
  index.html
scripts/
  zbuduj-tresc.mjs             tresc/ → public/tresc/*.json
  zbuduj-materialy.mjs         public/tresc/*.json → materialy/wynik/kurs.html + kurs.pdf (Playwright)
  sprawdz-rozwiazanie.mjs      id ćwiczenia + schemat ze stdin → werdykty i komunikaty jak w trenerze
  testuj-ajv-spec.mjs          jednorazowo: oficjalny zestaw testów vs Ajv, lista odstępstw
materialy/
  szablon.html, styl.css       szablon materiałów
tests/
  cwiczenia.test.mjs           dla każdego ćwiczenia: rozwiązanie przechodzi, start oblewa ≥1, każde błędne oblewa ≥1, JSON poprawny
  wyklad.test.mjs              werdykty w wykładzie zgodne; każde twierdzenie ma źródło
  parser.test.mjs              zepsute dokumenty → komunikat i pozycja
  komunikaty.test.mjs          błędy Ajv → polskie zdania
  zakres.test.mjs              hasła z obowiązkowego zakresu w nagłówkach treści
```

Przepływ danych: tekst z edytora → `parsujJSON` → (błąd składni → marker + komunikat) albo wartość → `walidator.kompiluj` → funkcja walidująca → przykłady → `komunikaty` → render. W projekcie wielu plików: wszystkie pliki parsowane, rejestrowane w świeżej instancji Ajv przez `addSchema`, kompilowany plik główny; błąd nierozwiązanego `$ref` tłumaczony na „odwołanie X w pliku Y nie prowadzi do żadnego schematu”.

Obsługa błędów: każdy błąd składni, kompilacji lub nieoczekiwany wyjątek Ajv kończy się polskim komunikatem w interfejsie, nigdy pustym ekranem; instancja Ajv po wyjątku jest tworzona na nowo (jak w prototypie).

## Budowanie, CI, hooki

- `npm run tresc` → `scripts/zbuduj-tresc.mjs`; `npm run build` → tresc + `vite build`; `npm run dev` → tresc + `vite`; `npm test` → `node --test tests/`; `npm run materialy` → `scripts/zbuduj-materialy.mjs`.
- `.github/workflows/publikuj.yml`: push na `main` → `npm ci`, `npm test`, `npm run build`, `actions/upload-pages-artifact` + `actions/deploy-pages`.
- `.github/workflows/materialy.yml`: `workflow_dispatch` → `npm ci`, `npx playwright install --with-deps chromium`, `npm run materialy`, `actions/upload-artifact` z `materialy/wynik/`.
- `.claude/settings.json`: hook `PostToolUse` na Edit/Write w `tresc/` oraz hook `Stop` uruchamiający `npm test`; nieprzechodzące testy wracają jako błąd.
- Ustawienia repozytorium: Pages ze źródłem „GitHub Actions” (włączane przez `gh api`).

## Treść próbna prototypu

Moduł 3 „Walidacja wartości” w wersji szkicowej (dwie, trzy sekcje wykładu z przykładami i jednym pytaniem do sali, z zaznaczeniem, że to treść próbna) oraz cztery ćwiczenia, po jednym rodzaju: (1) kod pocztowy i numer zamówienia przez `pattern`; (2) napraw zepsute zamówienie JSON; (3) zgadnij werdykty dla schematu ilości z `multipleOf`; (4) projekt z plikami `zamowienie`, `adres`, `klient`, w którym jedno odwołanie jest zepsute. Treść próbna podlega tym samym testom, co docelowa. Zostanie zastąpiona przy pisaniu modułu 3.

## Kolejność realizacji

1. Szkielet: repo na GitHubie, Vite, Monaco z workerem, Ajv, jeden ekran, workflow Pages, pierwsza publikacja. Potwierdzenie pod prawdziwym adresem, że podpowiedzi Monaco działają.
2. Rdzeń z prototypu + testy parsera i komunikatów.
3. Format treści, skrypt budowania treści, testy ćwiczeń i wykładu, hooki.
4. Widoki: start, moduł, wykład, ćwiczenie rodzaj 1, piaskownica.
5. Ćwiczenia rodzaj 2, 3, 4 (wiele plików, diagram), generator.
6. Motywy, „Duży tekst”, wąski ekran, localStorage, Ctrl+Z.
7. Materiały: szablon, PDF, workflow.
8. Jednorazowy test Ajv kontra oficjalny zestaw, `sprawdz-rozwiazanie`, aktualizacja CLAUDE.md.
