# Profile uczestników

Dwa profile. Wszystko poniżej to założenia robocze przyjęte z prowadzącym 2026-10-08; nie ma danych o konkretnej grupie. Zdania oznaczone **[założenie]** są propozycją do edycji.

Wspólne dla obu profili:
- potrafią otworzyć stronę w przeglądarce; nie zakładamy żadnych innych narzędzi (VS Code, terminal, Git, Postman);
- czytają angielski techniczny, ale trudniejsze pojęcia tłumaczymy po polsku; komunikaty trenera są po polsku;
- nie wiadomo, jakich walidatorów i wersji używają ich systemy, więc kurs uczy 2020-12 z solidną wiedzą o różnicach do draft-07 (najczęściej spotykanego w praktyce); pozostałe wersje tylko w module 2;
- nie zakładamy wcześniejszych szkoleń z JSON Schema.

## Profil A: Analityk

**Kim jest.** Analityk biznesowy albo systemowy. Pracuje na styku biznesu i IT: zbiera wymagania, pisze specyfikacje, uzgadnia z programistami i dostawcami, jak mają wyglądać dane wymieniane między systemami. **[założenie]** Nie programuje.

**Co wie.**
- JSON: widział go, ma intuicję składni (nawiasy, klucze, wartości, listy). Nie odróżnia pewnie `null` od pustego tekstu, nie wie, że klucze muszą być w cudzysłowie, nie zna reguł dla przecinków i ucieczek. **[założenie]**
- JSON Schema: może nic nie wiedzieć. Może nie rozumieć, po co w ogóle opisywać dane schematem.
- API/REST: słyszał o „API”, rozumie, że systemy wymieniają komunikaty. Pojęcia request/response, endpoint, nagłówek nie są pewne. **[założenie]**
- XML/XSD: mógł widzieć XML; XSD raczej nie czytał. Analogia do XSD nie jest bezpieczna, używamy jej tylko jako opcjonalnej dygresji. **[założenie]**
- Wyrażenia regularne: zero albo „widziałem, nie rozumiem”.
- OpenAPI/Swagger: mógł widzieć Swagger UI jako dokumentację API; nie edytował plików OpenAPI. **[założenie]**
- Programowanie: nie. Może znać formuły w Excelu i podstawy SQL. **[założenie]**

**Czego nie wie i co go zaskoczy.**
- Że walidator robi dokładnie to, co jest napisane, i nic więcej: pusty schemat przepuszcza wszystko, `properties` nie wymaga, literówki w nazwach pól przechodzą bez słowa.
- Różnica między „pole nieobecne”, „pole z `null`” i „pole z pustym tekstem”.
- Że `format` i `description` niczego nie sprawdzają (domyślnie).
- Wyrażenia regularne jako takie; kotwice `^` i `$`.
- Że schemat może być rozbity na wiele plików i że `$ref` to odwołanie, a nie kopiowanie.

**Co będzie robił po kursie. [założenie]**
- Czytał schematy dostarczone przez programistów albo dostawców i oceniał, czy odpowiadają wymaganiom biznesowym („czy numer klienta ma wymuszone 8 cyfr?”).
- Zgłaszał i poprawiał drobne rzeczy: dodanie pola do `required`, dopisanie `enum`, zakres liczby, opis pola.
- Pisał proste schematy od zera jako załącznik do specyfikacji wymagań (jeden obiekt, kilkanaście pól).
- Sprawdzał przykładowe dokumenty JSON względem schematu, żeby wyjaśnić spór „dane są złe” kontra „schemat jest zły”.

**Czego potrzebuje z kursu.**
- Pewności w czytaniu: umie powiedzieć, co dany schemat przepuści, a czego nie.
- Listy pułapek, które przeoczy przy przeglądzie cudzego schematu.
- Umiejętności poprawienia schematu w małym zakresie bez psucia reszty.
- Słownictwa, żeby rozmawiać z programistami (wymagane, opcjonalne, `null`, format, odwołanie).

**Typowe obawy. [założenie]** „To jest dla programistów.” „Nie znam regexów.” Obawa przed terminalem i narzędziami deweloperskimi (dlatego trener działa w przeglądarce bez instalacji).

**Tempo.** Wolniejsze. Dla tego profilu moduły 1, 3 i 4 są najważniejsze, moduł 7 w wersji „umiem przeczytać `$ref` i znaleźć cel”. Ćwiczenia ★ i ★★ z czytania i poprawiania.

## Profil B: Inżynier (DevOps / integracje)

**Kim jest.** Osoba techniczna, która będzie schematy **pisać** częściej niż czytać. **[założenie]** Inżynier DevOps albo integracji: opisuje konfiguracje, komunikaty między usługami, kontrakty API, dane wejściowe pipeline'ów. Zna JSON i YAML z codziennej pracy. Pisze skrypty (Bash, Python albo PowerShell), niekoniecznie aplikacje.

**Co wie.**
- JSON: czyta i pisze swobodnie. Zna YAML i wie, że to nadzbiór JSON-a. Mogą mu się mylić reguły obu formatów (komentarze, cudzysłowy). **[założenie]**
- JSON Schema: widział `$schema` i `properties` w plikach konfiguracyjnych narzędzi (np. schematy ustawień edytora, schematy Helm/GitHub Actions). Mógł kopiować fragmenty bez rozumienia. Nie pisał schematu od zera. Nie odróżnia wersji. **[założenie]**
- API/REST: tak, zna request/response, kody HTTP, nagłówki.
- XML/XSD: raczej nie XSD. **[założenie]**
- Wyrażenia regularne: używa w `grep`, `sed`, skryptach. Nie zna różnic dialektów (PCRE kontra ECMA-262 kontra Python). **[założenie]**
- OpenAPI/Swagger: widział pliki OpenAPI, może je uzupełniał; nie wie, czym się różni 3.0 od 3.1. **[założenie]**
- Programowanie: skrypty tak, aplikacje niekoniecznie. Może nie znać typowych pułapek zmiennoprzecinkowych i Unicode. **[założenie]**

**Czego nie wie i co go zaskoczy.**
- Różnice między wersjami (`definitions` kontra `$defs`, `items` jako tablica, `exclusiveMinimum: true`) i że jego dotychczasowe wzorce mogą pochodzić z draft-07.
- `$id`, adres bazowy, rozwiązywanie odwołań między plikami; że walidator niczego nie pobiera z sieci.
- `oneOf` zawodzące, gdy pasują dwie opcje; `additionalProperties: false` w gałęzi `allOf`.
- Że `format` jest adnotacją i zależy od konfiguracji walidatora.
- Dialekt regex ECMA-262 i podwajanie `\` w JSON-ie.
- Że generator ze schematu z przykładów opisuje przykłady, a nie wymagania.

**Co będzie robił po kursie. [założenie]**
- Pisał schematy od zera dla konfiguracji, komunikatów i kontraktów API.
- Dzielił większe schematy na wiele plików z `$ref`, utrzymywał je w repozytorium.
- Poprawiał schematy wygenerowane z kodu albo z przykładów przed ich wdrożeniem.
- Podpinał walidację do pipeline'u (walidacja plików konfiguracyjnych w CI). Kurs nie uczy konkretnych narzędzi CLI, ale ma dać wiedzę, co taki walidator robi.

**Czego potrzebuje z kursu.**
- Pewności w konstrukcjach średnio zaawansowanych: łączenie warunków, `if`/`then`, `$ref`, `$defs`, wiele plików.
- Jasnej mapy wersji i tego, jak rozpoznać stary schemat.
- Nawyku projektowania schematu przeciw typowym błędom (zamknięte obiekty, kotwice w regexach, `required`).
- Listy kontrolnej do przeglądu wygenerowanego schematu.

**Typowe obawy. [założenie]** „Znam to już z praktyki, będę się nudzić na podstawach.” Niecierpliwość w modułach 1 i 2. Dlatego ćwiczenia ★★★ i część „napraw dokument JSON” z pułapkami, które zaskoczą także osoby techniczne.

**Tempo.** Szybsze. Moduły 6, 7 i 8 są dla tego profilu najważniejsze. Moduł 1 w jego wypadku to głównie ćwiczenia z pułapkami składni, nie wykład.

## Konsekwencje dla kursu

- Oba profile nie znają JSON Schema, więc moduły 0–2 są dla wszystkich, ale krótkie.
- Każdy moduł ma ćwiczenia na dwóch poziomach: czytanie/poprawianie (A) i pisanie (B). Kolejność ćwiczeń w module: najpierw te wspólne dla obu profili.
- Pojęcia, które trzeba objaśnić, bo profil A ich nie zna: request/response, endpoint, walidator, wyrażenie regularne, `null`, odwołanie (`$ref`), identyfikator, adres URI.
- Pojęcia, które trzeba objaśnić dla obu profili: instancja, adnotacja kontra asercja, słownik, dialekt, metaschemat, adres bazowy.
