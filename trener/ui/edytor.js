// Opakowanie Monaco: tylko rdzeń edytora i język JSON, workery z tej samej domeny.
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/language/json/monaco.contribution';
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching';
import 'monaco-editor/editor/contrib/folding/browser/folding';
import 'monaco-editor/editor/contrib/find/browser/findController';
import 'monaco-editor/editor/contrib/links/browser/links';

import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/language/json/json.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    return label === 'json' ? new JsonWorker() : new EditorWorker();
  },
};

export { monaco };

export function utworzEdytor(kontener, { wartosc = '', tylkoDoOdczytu = false } = {}) {
  return monaco.editor.create(kontener, {
    value: wartosc,
    language: 'json',
    readOnly: tylkoDoOdczytu,
    automaticLayout: true,
    minimap: { enabled: false },
    tabSize: 2,
    insertSpaces: true,
    fontFamily: 'ui-monospace, Consolas, "Cascadia Mono", monospace',
    fontSize: 14,
    scrollBeyondLastLine: false,
    wordWrap: 'off',
    fixedOverflowWidgets: true,
  });
}
