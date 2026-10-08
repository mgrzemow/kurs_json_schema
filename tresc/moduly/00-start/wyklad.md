## Zamówienie, które magazyn odrzucił

Sklep internetowy hurtowni części rowerowych wysyła zamówienia do systemu magazynowego. W piątek magazyn odrzucił czterdzieści z nich. W połowie pole `ilosc` było tekstem `"2"`{d} zamiast liczby `2`{d}, w kilku brakowało adresu dostawy, a w jednym status miał postać `"Wysłane"`{d} z wielkiej litery, podczas gdy magazyn znał tylko `"wyslane"`{d}. Dwa zespoły spędziły popołudnie na ustalaniu, kto ma rację. (To wymyślony przykład, ale każdy, kto integrował dwa systemy, zna go z własnego życia.)

Spór był nierozstrzygalny, bo umowa między zespołami istniała tylko w głowach i w dokumencie na Confluence sprzed roku. JSON Schema zamienia taką umowę w plik, który obie strony mogą sprawdzić maszynowo. Oto minimalne zamówienie i krótki schemat, który je opisuje:

```json schemat=zamowienie-0
{
  "type": "object",
  "required": ["numer", "klient", "pozycje"]
}
```

```json dokument=zamowienie-0-ok schemat=zamowienie-0 oczekiwane=przechodzi
{
  "numer": "ZAM-2026-000123",
  "klient": "Serwis Rowerowy Dętka",
  "pozycje": [{ "ean": "5901234123457", "ilosc": 2 }]
}
```

```json dokument=zamowienie-0-bez-klienta schemat=zamowienie-0 oczekiwane=odrzucony
{
  "numer": "ZAM-2026-000123",
  "pozycje": [{ "ean": "5901234123457", "ilosc": 2 }]
}
```

Schemat mówi: zamówienie to obiekt (`type`), w którym muszą być trzy pola (`required`). Dokument bez klienta zostaje odrzucony, a program sprawdzający, czyli walidator, mówi dlaczego: „brakuje wymaganego pola „klient””. Nikt nie musi czytać Confluence. <!-- twierdzenie --> <!-- zrodlo: validation §6.5.3 -->

## Po co JSON Schema

### Umowa, walidacja, dokumentacja

Trzy zastosowania, wszystkie na tym samym pliku.

**Umowa między zespołami.** Sklep i magazyn podpisują się pod jednym schematem zamówienia. Gdy sklep chce dodać pole, zmienia schemat i obie strony widzą zmianę w tym samym miejscu. Spór „dane są złe” kontra „schemat jest zły” sprowadza się do uruchomienia walidatora.

**Walidacja.** Magazyn sprawdza każde zamówienie na wejściu i odrzuca niepoprawne z czytelnym powodem, zanim trafi do ludzi. Sklep może sprawdzić to samo przed wysłaniem. Ten sam schemat, dwa miejsca kontroli.

**Dokumentacja.** Z tego samego pliku powstaje opis pól (tytuły, opisy, przykłady), podpowiedzi w edytorze i formularze. Dokumentacja, która jest zarazem regułą, nie starzeje się osobno od kodu.

### Czego JSON Schema nie robi

JSON Schema nie zmienia danych, nie wpisuje wartości domyślnych, nie zamienia tekstu `"2"`{d} na liczbę. Tylko sprawdza i opisuje. Do wartości domyślnych wrócimy w module 5, gdzie ta cecha zaskakuje najbardziej.

**Pytanie:** a u ciebie kto odpowiada za kontrolę spójności danych pomiędzy systemami? Człowiek, kod, nikt?

## Jak korzystać z tej strony

Ta strona jest zarówno wykładem, jak i miejscem na ćwiczenia, które każdy robi samodzielnie u siebie.

- **Nawigacja.** Start → moduł → zakładki *Wykład* i *Ćwiczenia*. Każde miejsce ma własny link, który można komuś przesłać.
- **Kolory.** Schemat jest zawsze niebieski, dokument z danymi fioletowy: w ramkach z przykładami, w edytorach i w kodzie wplecionym w tekst, np. słowo kluczowe `required` i dane `{"uwagi": null}`{d}. Gdy schemat i dokument stoją obok siebie, schemat jest po lewej.
- **Przykłady w wykładzie.** Przy każdym schemacie i dokumencie jest przycisk „Otwórz w edytorze”. Otwiera piaskownicę ze schematem i dokumentem; „Przywróć przykład” cofa własne zmiany, a „Wróć do wykładu” wraca w to samo miejsce.
- **Ćwiczenie.** Po lewej zadanie, w środku edytor, po prawej przykłady. Przykłady dzielą się na te, które muszą przejść, i te, które muszą zostać odrzucone. Werdykty liczą się przy każdej zmianie w edytorze, nie ma przycisku „sprawdź”.
- **Pomoc stopniowana.** Czerwona karta mówi, co jest nie tak. Jeśli to nie wystarczy, jest *Podpowiedź*. Na końcu *Rozwiązanie* z przyciskiem „Wstaw do edytora”; Ctrl+Z przywraca własną wersję. *Zacznij od nowa* wraca do stanu początkowego.
- **Ćwiczeń jest więcej, niż zmieści się w czasie.** Są ułożone od najważniejszych: dwa pierwsze to minimum, reszta zostaje w materiałach.
- **Pasek u góry.** *Duży tekst* do pokazywania strony innym, motyw jasny lub ciemny i przełącznik „walidacja `format`”, który na razie zostaje wyłączony; wrócimy do niego w module 5.
- **Postęp** zapisuje się w tej przeglądarce. Strona działa tylko w czasie zajęć; potem zostają materiały PDF i HTML ze wszystkimi ćwiczeniami i rozwiązaniami.
