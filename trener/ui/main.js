import Ajv2020 from 'ajv/dist/2020';
import { utworzEdytor } from './edytor.js';

const SCHEMAT = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Zamówienie",
  "type": "object",
  "properties": {
    "numer": { "type": "string", "pattern": "^ZAM-[0-9]{4}-[0-9]{6}$" },
    "pozycje": { "type": "array", "minItems": 1 }
  },
  "required": ["numer", "pozycje"]
}
`;

const app = document.getElementById('app');
app.innerHTML = `
  <header class="pasek"><h1>Kurs JSON Schema <small>prototyp</small></h1></header>
  <main class="szkielet">
    <div id="edytor" class="edytor"></div>
    <p id="status"></p>
  </main>`;

utworzEdytor(document.getElementById('edytor'), { wartosc: SCHEMAT });

try {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const sprawdz = ajv.compile(JSON.parse(SCHEMAT));
  const ok = sprawdz({ numer: 'ZAM-2026-000123', pozycje: [{}] }) && !sprawdz({ numer: 'x' });
  document.getElementById('status').textContent = `Ajv działa: ${ok}`;
} catch (e) {
  document.getElementById('status').textContent = `Ajv nie działa: ${e.message}`;
}
