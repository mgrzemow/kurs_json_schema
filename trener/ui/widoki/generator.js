// Tymczasowa wersja (zadanie 11 planu zastępuje ją generatorem).
export function renderujGenerator(kontener) {
  kontener.innerHTML = '<section class="generator"><h1>Generator</h1><p>Wkrótce: wklej JSON i zobacz wygenerowany schemat.</p></section>';
  return () => {};
}
