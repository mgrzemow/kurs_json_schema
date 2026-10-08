# SDD ledger — plan: docs/superpowers/plans/2026-10-08-prototyp-trenera.md
Setup: Ruling: praca bezpośrednio na main bez worktree — prowadzący wprost zażądał prototypu publikowanego z main na GitHub Pages, projekt jednoosobowy; koszt jeśli źle: zepsuty build na Pages między commitami (akceptowalne w fazie prototypu).
Pre-flight: Task 2 produces parsujJSON {wartosc,klucze,duplikaty:[{klucz,pos}]} ↔ Task 3 analizujSchemat(schemat, klucze) i Task 6 — zgodne.
Pre-flight: Task 3 komunikaty(bledy,dane,limit) ↔ Task 6 sprawdzCwiczenie — zgodne. Task 4 kompilujProjekt(pliki{nazwa:{wartosc}}) ↔ Task 6 (parsuje teksty do wartosc) — zgodne. Task 6 sprawdzCwiczenie ↔ Task 8-10 UI — zgodne. Task 10 diagram consumes Task 4 odwolania — zgodne.
Task 2: Ruling: offsety w teście (klucze /a/b = 7, pos błędu = 19) poprawione w teście, bo implementacja zgadza się z definicją „offset = pozycja otwierającego cudzysłowu / początek błędnego tokenu”; koszt jeśli źle: żaden, to tylko liczby w teście.
Task 1: complete (commits dab3889..9425b7c, tests: npm test → ℹ duration_ms 113.267)
Task 2: complete (commits 2b9625a..9425b7c, tests: npm test → ℹ duration_ms 104.8458)
Task 3: complete (commits 9425b7c..6b642a4, tests: npm test → ℹ duration_ms 232.8308)
Task 4: complete (commits 6b642a4..511dd43, tests: npm test → ℹ duration_ms 516.0803)
Task 5: complete (commits 511dd43..c781fa6, tests: npm test → ℹ duration_ms 506.1726)
Task 5/6: Ruling: hook PostToolUse uruchamia testy tylko po edycji tresc/ (nie po tests/ i rdzeniu), bo w cyklu TDD każda faza RED generowała fałszywy alarm; hook Stop nadal obejmuje tresc/, trener/, scripts/, tests/ — koszt jeśli źle: błąd w rdzeniu wychodzi dopiero przy Stop, nie natychmiast.
Task 6: complete (commits c781fa6..f7ec285, tests: npm test → ℹ duration_ms 523.7444)
Task 7: complete (commits f7ec285..a19474a, tests: npm test → ℹ duration_ms 522.9108)
Task 8: complete (commits a19474a..8df403b, tests: npm test → ℹ duration_ms 554.5935)
Task 9: complete (commits 8df403b..8451727, tests: npm test → ℹ duration_ms 557.3459)
Task 10: complete (commits 54e125e..8451727, tests: npm test → ℹ duration_ms 554.9178)
Task 11: complete (commits 8451727..129519e, tests: npm test → ℹ duration_ms 582.1925)
Task 12: complete (commits 129519e..bf27381, tests: npm test → ℹ duration_ms 574.0555)
Task 13: complete (commits bf27381..91ba6c5, tests: npm test → ℹ duration_ms 580.0594)
Task 14: complete (commits 91ba6c5..2feae90, tests: npm test → ℹ duration_ms 4247.6716)
Final: fixed materiały zdradzały werdykt kolorem w ćwiczeniu rodzaju 3 (znalezione przy oglądaniu PDF z CI) — bez osobnego testu (styl), suite 113/113
Final review: recenzent (subagent, model fable) → request changes: C1, I1–I5, M1–M14.
Final: fixed C1 piaskownica wywalała się przy błędnym schemacie (przesłonięta funkcja diagnozaSchematu) — test piaskownica C1 RED→GREEN
Final: fixed I1 wyjątki spoza BladSchematu (zły $schema, $dynamicRef, pusty enum, przepełnienie stosu w czasie walidacji) → polska diagnoza — testy I1 (piaskownica + ćwiczenie) RED→GREEN
Final: fixed I2 plik reguły liczony dla każdego komunikatu osobno — test I2 RED→GREEN
Final: fixed I3 informacja o format zależna od przełącznika — test I3 RED→GREEN
Final: fixed I4 skrypt budowania odrzuca duplikaty kluczy w treści — test tresc-duplikaty RED→GREEN
Final: fixed I5 informacja o obcym $schema trafia do diagnozy (także w projekcie) — test I5 RED→GREEN
Final: fixed M1 (przeklasyfikowane na Important: wymaganie CLAUDE.md o Ctrl+Z) zamiana treści nieaktywnych modeli przez pushEditOperations — sprawdzenie interakcji 3-4 Ctrl+Z
Final: fixed M11c (przeklasyfikowane na Important: pusty ekran) router nie rzuca przy zepsutym % — test router RED→GREEN
Final: fixed przy okazji M3 (hasOwnProperty w required) i M5 częściowo (regex V8 i pusty enum po polsku); suite 122/122, interakcje 44/44
Final: Ruling: „Wstaw do edytora” zalicza ćwiczenie — zostaje: rozwiązanie to ostatni stopień pomocy wg CLAUDE.md, a uczestnik wie, że je wstawił — koszt: „zrobione” nie odróżnia samodzielnych rozwiązań; do decyzji prowadzącego
Final: Ruling: rozwiązania i źródła w public/tresc/*.json — zostaje: strona jest publiczna tylko na czas kursu, rozwiązanie i tak jest pod przyciskiem — koszt: ciekawski uczestnik zobaczy źródła twierdzeń, które miały być ukryte
Final: Ruling: rodzaj 2 pokazuje tylko pierwszy błąd składni — zostaje: natura parsera i polecenie ćwiczenia — koszt: brak
Final: Ruling: ReDoS z wzorców uczestnika — zostaje: trener działa lokalnie w przeglądarce uczestnika — koszt: zawieszona karta przy złośliwym wzorcu
Final: Ruling: file:// na Windows w zbudujPdf — zostaje: lokalnie zweryfikowane, PDF powstaje — koszt: brak
Final: minor (deferred): M2 podpowiedzi schematu także w edytorach dokumentu (fileMatch *)
Final: minor (deferred): M4 słowa z draft-07 (additionalItems, definitions, dependencies) bez uwagi „to stare słowo”
Final: minor (deferred): M6 parser: BOM, „1e”, zepsuty \u, podwójny przecinek dają mylące komunikaty
Final: minor (deferred): M7 nieznany format przy włączonych formatach przechodzi po cichu
Final: minor (deferred): M8 „Tekst nie ma formatu” dla formatów liczbowych
Final: minor (deferred): M9 ramka draft-07 w wykładzie próbnym mówi „ignorowany”, a trener odrzuca boolean w exclusiveMinimum — do decyzji prowadzącego przy pisaniu modułu 3
Final: minor (deferred): M10 nazwa testu materiałów obiecuje werdykty z walidatora, liczy data-werdykt z treści
Final: minor (deferred): M11a/b „Przywróć domyślne” w piaskownicy z wykładu; tooltip Ctrl+Z w rodzaju 3
Final: minor (deferred): M12 przykład 36.0 z planu zastąpiony 37.5 (JSON.parse nie odróżnia 36.0 od 36) — punkt dydaktyczny do wykładu
Final: minor (deferred): M13 sprawdz-rozwiazanie: surowy stack przy złym JSON na stdin dla rodzaju 3/4
Final: minor (deferred): M14 CLAUDE.md zawiera nieaktualne polecenia badawcze o Monaco
Final: minor (deferred): podwójne dispose modelu w cwiczenie-projekt.js; wyścig przy szybkich zmianach #
