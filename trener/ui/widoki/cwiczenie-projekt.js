// Tymczasowa zaślepka (zadanie 10 planu zastępuje ją pełnym wariantem).
export function cwiczenieProjekt({ srodek, prawa }) {
  srodek.innerHTML = '<p>Wkrótce: projekt z wieloma plikami.</p>';
  prawa.innerHTML = '';
  return { zniszcz() {} };
}
