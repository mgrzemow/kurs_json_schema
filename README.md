# Trener JSON Schema

Materiały do jednodniowego kursu JSON Schema 2020-12: interaktywny trener (GitHub Pages) i statyczne materiały po kursie, generowane z jednego źródła treści.

- Trener: https://mgrzemow.github.io/kurs_json_schema/
- Wszystkie ustalenia projektu: [CLAUDE.md](CLAUDE.md)
- Projekt prototypu: `docs/superpowers/specs/2026-10-08-prototyp-trenera-design.md`

## Jak to działa

- `tresc/` — jedyne źródło treści: wykłady w Markdownie, ćwiczenia jako katalogi z `cwiczenie.json` i plikami JSON.
- `scripts/zbuduj-tresc.mjs` kompiluje treść do `public/tresc/*.json`, licząc werdykty przykładów prawdziwym walidatorem (Ajv 2020-12).
- `trener/` — aplikacja (Vite, Monaco, Ajv), `trener/rdzen/` to logika bez zależności od przeglądarki, współdzielona z testami i skryptami.
- `materialy/` — szablon materiałów po kursie; `scripts/zbuduj-materialy.mjs` daje HTML i PDF.
- `spec/` — specyfikacja 2020-12, metaschematy i oficjalny zestaw testów (tylko do odczytu).

## Polecenia

```
npm ci                 # instalacja (raz)
npm run dev            # podgląd lokalny z odświeżaniem
npm test               # wszystkie testy treści, parsera, komunikatów, walidatora, materiałów
npm run build          # treść + trener do dist/
npm run preview        # serwuje dist/ pod http://localhost:4173/kurs_json_schema/
npm run materialy      # materialy/wynik/kurs.html i kurs.pdf (wymaga: npx playwright install chromium)
node scripts/sprawdz-rozwiazanie.mjs 3-1-kod-pocztowy < schemat.json   # werdykty jak w trenerze
node scripts/sprawdz-interakcje.mjs   # klika po zbudowanej stronie (preview musi działać)
node scripts/testuj-ajv-spec.mjs      # Ajv kontra oficjalny zestaw testów
```

## Publikacja

- Push na `main` uruchamia workflow „Publikuj trener”: testy, build, GitHub Pages.
- Workflow „Materiały” (uruchamiany ręcznie w zakładce Actions) buduje HTML i PDF i zostawia je jako artefakt do pobrania.
- Po kursie: wyłączyć Pages w ustawieniach repozytorium, uruchomić „Materiały”, rozesłać PDF/HTML.

## Praca z Claude Code

W tym folderze uruchom `claude`. Agenci: `.claude/agents/weryfikator-specyfikacji.md` (sprawdza twierdzenia o JSON Schema wyłącznie na podstawie `spec/`) i `.claude/agents/uczestnik.md` (symuluje uczestnika o wskazanym profilu). Hooki w `.claude/settings.json` uruchamiają testy po zmianach w `tresc/` i przed zakończeniem pracy.

## Docelowy układ repozytoriów

Na razie wszystko jest w jednym publicznym repozytorium. Docelowo kod i treść kursu (z rozwiązaniami) trafią do repozytorium prywatnego, a do publicznego tylko zbudowana strona konkretnego kursu (`dist/`) publikowana na GitHub Pages.
