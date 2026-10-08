// Opakowanie Monaco: tylko rdzeń edytora i język JSON, workery z tej samej domeny,
// własne znaczniki błędów (polskie) i podpowiedzi z własnego schematu 2020-12.
import * as monaco from 'monaco-editor/editor/editor.api';
import { jsonDefaults } from 'monaco-editor/languages/features/json/register';
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching';
import 'monaco-editor/editor/contrib/folding/browser/folding';
import 'monaco-editor/editor/contrib/find/browser/findController';
import 'monaco-editor/editor/contrib/links/browser/links';
// Usługi, których wymagają kontrybucje dociągane leniwie przez tryb JSON (inaczej „UNKNOWN service”).
import 'monaco-editor/editor/contrib/codelens/browser/codeLensCache';
import 'monaco-editor/editor/common/services/treeViewsDndService';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';
import schematPodpowiedzi from './schemat-podpowiedzi.json';

self.MonacoEnvironment = {
  getWorker(_, label) {
    return label === 'json' ? new JsonWorker() : new EditorWorker();
  },
};

export { monaco };
// Do narzędzi deweloperskich i skryptów sprawdzających (scripts/sprawdz-interakcje.mjs).
globalThis.__monaco = monaco;

const WLASCICIEL = 'trener';
let rozmiarCzcionki = 14;

// Podpowiedzi i opisy po najechaniu z własnego schematu; żadnych pobrań z sieci.
// Adres metaschematu 2020-12 mapujemy na nasz schemat, więc `$schema` w dokumencie nic nie ściąga.
// Wbudowaną diagnostykę JSON (angielskie komunikaty) wyłączamy: źródłem prawdy są nasze markery.
jsonDefaults.setDiagnosticsOptions({
  validate: false,
  enableSchemaRequest: false,
  allowComments: false,
  schemas: [
    { uri: 'https://json-schema.org/draft/2020-12/schema', fileMatch: ['*'], schema: schematPodpowiedzi },
  ],
});

export function utworzEdytor(kontener, { wartosc = '', tylkoDoOdczytu = false } = {}) {
  const model = monaco.editor.createModel(wartosc, 'json');
  const edytor = monaco.editor.create(kontener, {
    model,
    readOnly: tylkoDoOdczytu,
    automaticLayout: true,
    minimap: { enabled: false },
    tabSize: 2,
    insertSpaces: true,
    fontFamily: 'ui-monospace, Consolas, "Cascadia Mono", monospace',
    fontSize: rozmiarCzcionki,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    wordWrap: 'off',
    fixedOverflowWidgets: true,
    renderLineHighlight: 'line',
  });
  edytor.onDidDispose(() => model.dispose());
  return edytor;
}

export function utworzModel(wartosc) {
  return monaco.editor.createModel(wartosc, 'json');
}

// Zamiana całej treści przez executeEdits, żeby Ctrl+Z przywracał poprzednią wersję.
export function zamienTresc(edytor, tekst) {
  const model = edytor.getModel();
  if (model.getValue() === tekst) return;
  edytor.pushUndoStop();
  edytor.executeEdits(WLASCICIEL, [{ range: model.getFullModelRange(), text: tekst }]);
  edytor.pushUndoStop();
}

// To samo dla modelu bez edytora (nieaktywna zakładka pliku): historia cofania zostaje zachowana.
export function zamienTrescModelu(model, tekst) {
  if (model.getValue() === tekst) return;
  model.pushStackElement();
  model.pushEditOperations([], [{ range: model.getFullModelRange(), text: tekst }], () => null);
  model.pushStackElement();
}

// lista: [{ pos, dlugosc?, komunikat, poziom: 'blad'|'ostrz'|'info' }], pos = offset w tekście.
export function ustawMarkery(model, lista) {
  const POZIOM = { blad: monaco.MarkerSeverity.Error, ostrz: monaco.MarkerSeverity.Warning, info: monaco.MarkerSeverity.Info };
  const markery = lista.filter(m => typeof m.pos === 'number').map(m => {
    const od = model.getPositionAt(m.pos);
    const reszta = model.getLineContent(od.lineNumber).slice(od.column - 1);
    const mm = /^("(?:\\.|[^"\\])*"|[^\s,:{}[\]]+)/.exec(reszta);
    const dlugosc = m.dlugosc || (mm ? mm[0].length : Math.max(1, reszta.length));
    const koniec = model.getPositionAt(m.pos + Math.max(1, dlugosc));
    return {
      severity: POZIOM[m.poziom] || POZIOM.info,
      message: m.komunikat,
      startLineNumber: od.lineNumber,
      startColumn: od.column,
      endLineNumber: koniec.lineNumber,
      endColumn: koniec.lineNumber === od.lineNumber ? Math.max(koniec.column, od.column + 1) : koniec.column,
    };
  });
  monaco.editor.setModelMarkers(model, WLASCICIEL, markery);
}

export function ustawMotyw(ciemny) {
  monaco.editor.setTheme(ciemny ? 'vs-dark' : 'vs');
}

export function ustawRozmiarCzcionki(px) {
  rozmiarCzcionki = px;
  for (const e of monaco.editor.getEditors()) e.updateOptions({ fontSize: px });
}
