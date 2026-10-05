// Packs the demo build (dist/demo-build/browser) into ONE self-contained file, dist/demo/index.html, so it can be
// hosted anywhere that serves a single page (no extra files, no API). Lazy route chunks are merged into the script.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = 'dist/demo-build/browser';
const { outputFiles } = await build({
  entryPoints: [`${src}/main.js`],
  bundle: true,
  splitting: false,
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'error'
});

const js = outputFiles[0].text.replaceAll('</script', '<\\/script');
const css = readFileSync(`${src}/styles.css`, 'utf8');
const polyfills = readFileSync(`${src}/polyfills.js`, 'utf8').replaceAll('</script', '<\\/script');

const html = `<title>MovieFlix Dashboard</title>
<style>:root{color-scheme:dark}${css}</style>
<app-root></app-root>
<script>${polyfills}</script>
<script>${js}</script>
`;

mkdirSync('dist/demo', { recursive: true });
writeFileSync('dist/demo/index.html', html);
console.log(`dist/demo/index.html  ${(html.length / 1024).toFixed(0)} kB`);
