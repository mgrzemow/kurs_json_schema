# Generowanie treści kursu — plan wykonania

Źródło wymagań: zaakceptowane konspekty w `docs/konspekty/00…09` (wszystkie zaakceptowane 2026-10-08) plus CLAUDE.md. Wykonanie inline, zadanie po zadaniu, commit po każdym. Stan zaznaczany tu checkboxami.

## A. Rozszerzenia trenera (najpierw test, potem kod)

- [x] A1. `formaty: true|false` w `cwiczenie.json` wymusza tryb walidacji `format` dla ćwiczenia (schemat ćwiczenia, `sprawdzCwiczenie` bierze `cw.formaty ?? stan.formaty`, UI pokazuje informację „to ćwiczenie ma włączoną walidację `format`”, skrypt `sprawdz-rozwiazanie` respektuje).
- [x] A2. Rodzaj 3: opcjonalne `wyjasnienieZFormatami` (gdy tryb formatów włączony, zastępuje `wyjasnienie`).
- [x] A3. Ostrzeżenie o nieznanym `format` w `analizujSchemat` (lista znanych formatów z `schemat-podpowiedzi.json`; poziom `ostrz`).
- [x] A4. Rodzaj 5: `listaKontrolna: [string]` w `cwiczenie.json`, prawa kolumna z checkboxami zapamiętywanymi w `stan.odpowiedzi[cw.id].lista`.
- [x] A5. Renderer wykładu: blok „lustro” (dwa bloki json obok siebie z tłem w kolorze poziomu zagnieżdżenia): fence ```` ```json lustro=nazwa strona=dokument|schemat ````; para renderowana jako `<div class="lustro">` gdy sąsiadują.
- [ ] A6. Kolejność ćwiczeń po `kolejnosc`, a numer wyświetlany = pozycja; identyfikatory wg konspektów (np. 4-10).
- [ ] A7. Ćwiczenie końcowe: `start.json` = wynik genson; test porównuje z `python -m genson` (pomijany, gdy genson niedostępny); workflowy instalują genson.
- [x] A8 (słowniczek). Słowniczek `docs/slowniczek.md` (założenie, uzupełniany przy pisaniu) i tabela `docs/tematy-x-moduly.md`.

## B. Treść (każdy moduł: modul.json, wyklad.md, cwiczenia/; `npm test` zielone; commit)

- [x] B0. Moduł 0 (10 min, 1 ćw.)
- [x] B1. Moduł 1 (25 min, 3 ćw. rodzaju 2; diagramy składni SVG; RFC 8259 jako źródło)
- [ ] B2. Moduł 2 (15 min, 2 ćw.; wersje bez liczb)
- [ ] B3. Moduł 3 (40 min, 9 ćw.; zastępuje treść próbną)
- [ ] B4. Moduł 4 (45 min, 10 ćw.; lustro, drzewo SVG)
- [ ] B5. Moduł 5 (25 min, 5 ćw.; `formaty`)
- [ ] B6. Moduł 6 (30 min, 8 ćw.)
- [ ] B7. Moduł 7 (40 min, 7 ćw., w tym 3 rodzaju 4)
- [ ] B8. Moduł 8 (35 min, 1 ćw. rodzaju 5 z listą kontrolną; genson)
- [ ] B9. Moduł 9 (15 min, 0 ćw.)
- [ ] B10. `tresc/kurs.json` z dziesięcioma modułami; start trenera pokazuje przerwy.

## C. Weryfikacja

- [ ] C1. Build, `sprawdz-interakcje` (zaktualizować identyfikatory ćwiczeń), zrzuty wybranych ekranów.
- [ ] C2. Agent `weryfikator-specyfikacji` na każdym module; rozbieżności do prowadzącego, oczywiste błędy poprawione.
- [ ] C3. Agent `uczestnik` dla profilu A i B; raporty w `docs/raporty-uczestnikow/`; podsumowanie dla prowadzącego.
- [ ] C4. Materiały (workflow), CLAUDE.md i README zaktualizowane, push, Pages.
