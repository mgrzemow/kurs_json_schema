# Trener JSON Schema

Materiały do jednodniowego kursu JSON Schema: interaktywny trener (GitHub Pages) i statyczne materiały po kursie, generowane z jednego źródła treści.

Wszystkie ustalenia projektu są w [CLAUDE.md](CLAUDE.md).

## Co już jest

- `CLAUDE.md` — instrukcje i decyzje dla Claude Code.
- `.claude/agents/weryfikator-specyfikacji.md` — agent sprawdzający twierdzenia o JSON Schema wyłącznie na podstawie specyfikacji w `spec/`.
- `.claude/agents/uczestnik.md` — agent symulujący uczestnika o wskazanym profilu.
- `prototyp/trener.html` — jednoplikowy prototyp trenera (CodeMirror 5 + Ajv), źródło parsera JSON z polskimi komunikatami.

## Pierwsze uruchomienie Claude Code

1. Sprawdź wersję: `claude --version`. Agent `uczestnik` korzysta z pola `omitClaudeMd`, które wymaga Claude Code v2.1.271 lub nowszego (`claude update`).
2. W tym folderze uruchom `claude`.
3. Pierwsze polecenie (do skopiowania):

> Przeczytaj CLAUDE.md. Zanim zaczniesz cokolwiek pisać: zainicjuj repozytorium git (z .gitignore), pobierz do spec/ specyfikację JSON Schema 2020-12 (Core i Validation), oficjalne metaschematy 2020-12 i katalog tests/draft2020-12 z JSON-Schema-Test-Suite. Potem zacznij od kroków z sekcji „Na początku pracy”: zadaj mi pytania o profile uczestników.
