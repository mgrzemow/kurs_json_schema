# Specyfikacja JSON Schema 2020-12 (tylko do odczytu)

Pliki w tym katalogu są pobrane z oficjalnych źródeł i **nie wolno ich edytować**. Są jedynym źródłem prawdy dla agenta `weryfikator-specyfikacji` i dla twierdzeń w treści kursu.

Pobrano 2026-10-08.

| Katalog / plik | Źródło |
|---|---|
| `tekst/json-schema-core.txt` | https://www.ietf.org/archive/id/draft-bhutton-json-schema-01.txt (JSON Schema Core 2020-12, czerwiec 2022) |
| `tekst/json-schema-validation.txt` | https://www.ietf.org/archive/id/draft-bhutton-json-schema-validation-01.txt (JSON Schema Validation 2020-12) |
| `tekst/rfc8259.txt` | https://www.rfc-editor.org/rfc/rfc8259.txt (RFC 8259, składnia JSON; źródło twierdzeń modułu 1) |
| `tekst/relative-json-pointer.txt` | https://www.ietf.org/archive/id/draft-bhutton-relative-json-pointer-00.txt |
| `metaschematy/schema.json` | https://json-schema.org/draft/2020-12/schema |
| `metaschematy/meta/*.json` | https://json-schema.org/draft/2020-12/meta/{core,applicator,validation,meta-data,format-annotation,format-assertion,content,unevaluated} |
| `metaschematy/output.json` | https://json-schema.org/draft/2020-12/output/schema |
| `tests/draft2020-12/` | https://github.com/json-schema-org/JSON-Schema-Test-Suite, katalog `tests/draft2020-12`, commit `5b0ee1613e45fcc2bddac00e07c19cd49b00d8a8` (2026-09-21) |
| `tests/remotes/` | ten sam commit, katalog `remotes` (schematy zdalne wymagane przez testy `$ref`; w testach serwowane pod `http://localhost:1234/`) |
| `tests/LICENSE-JSON-Schema-Test-Suite` | licencja zestawu testów (MIT) |

Testy w `tests/draft2020-12/optional/` dotyczą zachowań opcjonalnych (m.in. `format` jako asercja, regex ECMA-262, duże liczby).
