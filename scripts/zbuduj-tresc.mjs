// Zaślepka: docelowa wersja (zadanie 5 planu) kompiluje tresc/ do public/tresc/.
import { mkdirSync } from 'node:fs';
mkdirSync(new URL('../public/tresc/', import.meta.url), { recursive: true });
