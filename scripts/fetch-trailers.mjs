/**
 * Fills `trailer_key` (a YouTube video id) into mock-server/db.json for every movie, so each card
 * plays that movie's own trailer in mock mode. Run once with:  node scripts/fetch-trailers.mjs
 *
 * For each movie it searches "<title> <year> official trailer", then checks the top hits with YouTube's
 * oEmbed endpoint. A hit is accepted only if it is public/embeddable and its title contains the
 * movie name and the word "trailer" (or "teaser"), and none of the words in REJECT.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DB = new URL('../mock-server/db.json', import.meta.url);
const REJECT = /reaction|review|explained|breakdown|fan|parody|recap|ending|scene|clip|interview|behind/i;
// The consent cookie stops YouTube redirecting scripted requests to its cookie-consent page.
const UA = { 'user-agent': 'Mozilla/5.0', 'accept-language': 'en', cookie: 'CONSENT=YES+1; SOCS=CAI' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Throttled fetch. YouTube answers bursts with redirect loops / 429, so requests are spaced out and
 * retried with a growing pause. Returns null (instead of throwing) if it still fails.
 */
async function get(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(400);
    try {
      const res = await fetch(url, { headers: UA });
      if (res.status !== 429 && res.status < 500) return res;
    } catch {
      /* network error or redirect loop: fall through to the retry pause */
    }
    await sleep(attempt * 4000);
  }
  return null;
}

const norm = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

async function candidates(query) {
  const res = await get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`);
  const html = res ? await res.text() : '';
  return [...new Set([...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]))].slice(0, 8);
}

async function oembed(id) {
  const res = await get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
  return res?.ok ? res.json() : null; // 401/404 = private or embedding disabled
}

async function findTrailer({ title, year }) {
  const name = norm(title.replace(/[^\x20-\x7e]+/g, ' '));
  for (const query of [`${title} ${year} official trailer`, `${title} official trailer`]) {
    for (const id of await candidates(query)) {
      const info = await oembed(id);
      if (!info) continue;
      const t = norm(info.title);
      if (t.includes(name) && /trailer|teaser/.test(t) && !REJECT.test(info.title)) return { id, title: info.title };
    }
  }
  return null;
}

const raw = readFileSync(DB, 'utf8');
const indent = /\n( +)"/.exec(raw)?.[1].length ?? 2;
const db = JSON.parse(raw);

// Collect every movie object once per id.
const movies = new Map();
(function walk(o) {
  if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === 'object') {
    if (typeof o.id === 'number' && o.title && o.release_date) movies.set(o.id, { title: o.title, year: o.release_date.slice(0, 4) });
    Object.values(o).forEach(walk);
  }
})(db);

const keys = new Map();
for (const [id, movie] of movies) {
  const hit = await findTrailer(movie);
  console.log(hit ? 'OK  ' : 'MISS', id, movie.title, hit ? `-> ${hit.id}  (${hit.title})` : '');
  if (hit) keys.set(id, hit.id);
}

(function apply(o) {
  if (Array.isArray(o)) o.forEach(apply);
  else if (o && typeof o === 'object') {
    if (typeof o.id === 'number' && movies.has(o.id)) {
      delete o.trailer_url; // demo sample clips are replaced by each movie's real trailer
      if (keys.has(o.id)) o.trailer_key = keys.get(o.id); // a movie with no hit keeps its old key, if any
    }
    Object.values(o).forEach(apply);
  }
})(db);

writeFileSync(DB, JSON.stringify(db, null, indent) + '\n');
console.log(`\n${keys.size}/${movies.size} movies now have a trailer.`);
