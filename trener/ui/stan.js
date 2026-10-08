// Stan uczestnika w localStorage. Każdy odczyt i zapis w try/catch: w trybie prywatnym
// albo przy zablokowanych danych strona ma działać, tylko bez zapamiętywania.
export const KLUCZ_STANU = 'kurs-json-schema/v1';

const DOMYSLNY = () => ({ edytory: {}, zaliczone: {}, odpowiedzi: {}, duzyTekst: false, motyw: 'auto', formaty: false });

function magazynDomyslny() {
  try { return globalThis.localStorage || null; } catch (_) { return null; }
}

export function wczytajStan(magazyn = magazynDomyslny()) {
  try {
    const z = JSON.parse((magazyn && magazyn.getItem(KLUCZ_STANU)) || 'null');
    if (z && typeof z === 'object') return { ...DOMYSLNY(), ...z };
  } catch (_) { /* brak dostępu albo uszkodzony zapis */ }
  return DOMYSLNY();
}

export function zapiszStan(stan, magazyn = magazynDomyslny()) {
  try { if (magazyn) magazyn.setItem(KLUCZ_STANU, JSON.stringify(stan)); } catch (_) { /* brak miejsca albo dostępu */ }
}

export function utworzStan(magazyn = magazynDomyslny(), opoznienieMs = 300) {
  const stan = wczytajStan(magazyn);
  let timer;
  const zapisz = () => { clearTimeout(timer); timer = setTimeout(() => zapiszStan(stan, magazyn), opoznienieMs); };
  const ustaw = fn => { fn(stan); zapisz(); };
  return { stan, zapisz, ustaw };
}
