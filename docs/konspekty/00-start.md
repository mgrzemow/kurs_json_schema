# Moduł 0: Start (10 min) — opis sekcji

Status: propozycja do akceptacji. Cel modułu: uczestnik wie, po co istnieje JSON Schema, i umie obsłużyć trenera. Wyłącznie wykład plus jedno dwuminutowe ćwiczenie-rozgrzewka.

## Sekcja 0.1: Zamówienie, które magazyn odrzucił (3 min)

- Scenariusz z domeny: sklep internetowy wysyła zamówienia do magazynu. W piątek magazyn odrzucił 40 zamówień, bo w połowie z nich `ilosc` była tekstem `"2"`, w kilku brakowało adresu, a jedno miało `status: "Wysłane"` z wielkiej litery. Nikt nie wiedział, kto ma rację: sklep czy magazyn. (Wymyślony przykład, oznaczony jako taki.)
- Pokazane na żywo w piaskownicy: minimalne zamówienie (numer, klient, pozycje) i trzyliniowy schemat. Usunięcie pola `klient` → werdykt „odrzucony” z komunikatem po polsku. Zmiana `"ilosc": 2` na `"2"` → odrzucony.
- Wniosek: schemat to spisana umowa, którą obie strony mogą sprawdzić maszynowo.

## Sekcja 0.2: Po co JSON Schema (4 min)

Trzy zastosowania, każde jednym akapitem i jednym zdaniem z domeny:
1. **Umowa między zespołami**: sklep i magazyn podpisują się pod jednym plikiem zamiast pod opisem w Confluence.
2. **Walidacja**: magazyn sprawdza każde zamówienie na wejściu i odrzuca z czytelnym powodem; sklep sprawdza przed wysłaniem.
3. **Dokumentacja**: z tego samego pliku powstaje opis pól (tytuły, opisy, przykłady), podpowiedzi w edytorze, formularze.

Krótka uwaga, czego JSON Schema nie robi: nie zmienia danych, nie wpisuje domyślnych wartości, nie tłumaczy formatów. To tylko sprawdzanie i opis. (Odwołanie do przodu, oznaczone: „do `default` wrócimy w module 5”.)

Pytanie do sali (na czacie): „Kto u was dziś pilnuje, że dane między systemami mają właściwy kształt?” — bez odsłonięcia, to otwarcie rozmowy.

## Sekcja 0.3: Jak działa trener (3 min)

Prowadzący pokazuje na ekranie, uczestnicy klikają u siebie:
- start → moduł → zakładki Wykład i Ćwiczenia; link do każdego miejsca da się wkleić na czat;
- ćwiczenie: lewa kolumna zadanie, środek edytor, prawa przykłady z werdyktami liczonymi przy każdej zmianie;
- stopniowana pomoc: czerwona karta mówi, co jest nie tak → „Podpowiedź” → „Rozwiązanie” z „Wstaw do edytora”, Ctrl+Z przywraca własną wersję; „Zacznij od nowa”;
- „Ćwiczeń jest więcej, niż zmieści się w czasie. Róbcie po kolei, pierwsze są najważniejsze”;
- pasek: „Duży tekst” (prowadzący ma włączony), motyw, przełącznik „walidacja `format`” (na razie wyłączony, wrócimy w module 5);
- postęp zapisuje się w przeglądarce; po kursie strona znika, zostają materiały PDF/HTML ze wszystkimi ćwiczeniami i rozwiązaniami.

## Ćwiczenie 0-1 ★ (2 min, rodzaj 1): Rozgrzewka

- Kontekst: schemat minimalnego zamówienia wymaga numeru i klienta, ale nie wymaga pozycji. Magazyn nie przyjmie zamówienia bez pozycji.
- Polecenie: dopisz `pozycje` do listy pól wymaganych. Cel ćwiczenia to obsługa trenera, nie JSON Schema; w poleceniu podajemy wprost, co dopisać.
- Przykłady: zamówienie kompletne (musi przejść), zamówienie bez pozycji (musi zostać odrzucone), zamówienie bez klienta (odrzucone, już na starcie).
- Podpowiedź: „Lista wymaganych pól to `required`. Dopisz nazwę pola w cudzysłowie, po przecinku.”
- Źródło: validation §6.5.3 (required).

## Uwagi

- Brak ramki „w draft-07” i brak twierdzeń wymagających źródeł poza ćwiczeniem.
- Dla profilu B moduł jest oczywisty; sekcja 0.3 i tak jest potrzebna, bo narzędzie jest nowe dla wszystkich.
