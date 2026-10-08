// Narzędzie deweloperskie: otwiera trener w Chromium bez okna i raportuje błędy konsoli.
// Użycie: node scripts/sprawdz-strone.mjs [adres] [--zrzut plik.png]
import { chromium } from 'playwright';

const adres = process.argv[2] || 'http://localhost:4173/kurs_json_schema/';
const zrzutIdx = process.argv.indexOf('--zrzut');
const zrzut = zrzutIdx > 0 ? process.argv[zrzutIdx + 1] : null;

const przegladarka = await chromium.launch();
const strona = await przegladarka.newPage({ viewport: { width: 1400, height: 900 } });
const bledy = [];
strona.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') bledy.push(`${m.type()}: ${m.text()}`); });
strona.on('pageerror', e => bledy.push(`pageerror: ${e.message}`));
strona.on('requestfailed', r => bledy.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
await strona.goto(adres, { waitUntil: 'networkidle' });
await strona.waitForTimeout(1500);
const status = await strona.locator('#status').textContent().catch(() => '(brak #status)');
const monaco = await strona.locator('.monaco-editor').count();
console.log('Status:', status);
console.log('Edytory Monaco:', monaco);
if (zrzut) await strona.screenshot({ path: zrzut, fullPage: true });
console.log(bledy.length ? 'Błędy konsoli:\n' + bledy.join('\n') : 'Konsola czysta.');
await przegladarka.close();
process.exit(bledy.length ? 1 : 0);
