/**
 * Writes the real TMDB API key into environment.prod.ts right before the production
 * build runs, reading it from the TMDB_API_KEY environment variable (set in Netlify's
 * Site settings -> Environment variables, never committed to git).
 *
 * Run locally to test the production build with your own key:
 *   TMDB_API_KEY=your_key node scripts/inject-tmdb-key.mjs && npx ng build --configuration production
 * (PowerShell: $env:TMDB_API_KEY="your_key"; node scripts/inject-tmdb-key.mjs)
 *
 * The file on disk is left with its placeholder afterwards untouched in git — this
 * script only ever edits the working copy that the build then reads and bundles.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/environments/environment.prod.ts', import.meta.url);
const key = process.env.TMDB_API_KEY;

if (!key) {
  console.error(
    '\nTMDB_API_KEY is not set.\n' +
    'Add it in Netlify: Site settings -> Environment variables -> TMDB_API_KEY.\n' +
    'Locally: set the TMDB_API_KEY environment variable before running this script.\n'
  );
  process.exit(1);
}

const original = readFileSync(PATH, 'utf8');
const updated = original.replace(/tmdbApiKey:\s*'[^']*'/, `tmdbApiKey: '${key}'`);

if (updated === original) {
  console.error('Could not find `tmdbApiKey: \'...\'` in environment.prod.ts — nothing was changed.');
  process.exit(1);
}

writeFileSync(PATH, updated);
console.log('TMDB_API_KEY injected into environment.prod.ts for this build.');
