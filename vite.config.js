import { defineConfig } from 'vite';

export default defineConfig({
  root: 'trener',
  publicDir: '../public',
  base: '/kurs_json_schema/',
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022' },
  worker: { format: 'es' },
});
