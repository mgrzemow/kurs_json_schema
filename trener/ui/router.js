// Trasy po „#”, żeby każdy widok miał link do wklejenia na czat.
//   #/                      start
//   #/m/3                   moduł 3, zakładka wykład
//   #/m/3/wyklad/kotwica    moduł 3, wykład przewinięty do sekcji
//   #/m/3/cwiczenia         moduł 3, lista ćwiczeń
//   #/m/3/cw/3-1-kod        ćwiczenie
//   #/piaskownica           wolny edytor
//   #/piaskownica/3/s/d/k   piaskownica z przykładem z wykładu (moduł, schemat, dokument lub „-”, kotwica)
//   #/generator             generator schematu

export function parsujTrase(hash) {
  let czesci;
  try {
    czesci = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  } catch (_) {
    return { widok: 'start' }; // zepsuty adres (np. ucięty znak %) prowadzi na start zamiast rzucać
  }
  if (!czesci.length) return { widok: 'start' };
  if (czesci[0] === 'm' && /^\d+$/.test(czesci[1] || '')) {
    const nr = +czesci[1];
    if (czesci[2] === 'cw' && czesci[3]) return { widok: 'cwiczenie', nr, id: czesci[3] };
    if (czesci[2] === 'cwiczenia') return { widok: 'modul', nr, zakladka: 'cwiczenia' };
    return { widok: 'modul', nr, zakladka: 'wyklad', kotwica: czesci[3] || null };
  }
  if (czesci[0] === 'piaskownica') {
    if (czesci[1]) return { widok: 'piaskownica', z: { nr: +czesci[1], schemat: czesci[2], dokument: czesci[3] === '-' ? null : czesci[3] || null, kotwica: czesci[4] || null } };
    return { widok: 'piaskownica' };
  }
  if (czesci[0] === 'generator') return { widok: 'generator' };
  return { widok: 'start' };
}

export function hashTrasy(t) {
  const e = encodeURIComponent;
  switch (t.widok) {
    case 'modul': return `#/m/${t.nr}` + (t.zakladka === 'cwiczenia' ? '/cwiczenia' : t.kotwica ? `/wyklad/${e(t.kotwica)}` : '');
    case 'cwiczenie': return `#/m/${t.nr}/cw/${e(t.id)}`;
    case 'piaskownica': return t.z ? `#/piaskownica/${t.z.nr}/${e(t.z.schemat)}/${t.z.dokument ? e(t.z.dokument) : '-'}${t.z.kotwica ? '/' + e(t.z.kotwica) : ''}` : '#/piaskownica';
    case 'generator': return '#/generator';
    default: return '#/';
  }
}

export function idz(trasa) {
  location.hash = typeof trasa === 'string' ? trasa : hashTrasy(trasa);
}

export function naTrase(fn) {
  const obsluz = () => fn(parsujTrase(location.hash));
  addEventListener('hashchange', obsluz);
  obsluz();
}
