# Movie App (Angular)

A Netflix-style movie showcase built with Angular standalone components.

## Setup
npm install

## Run (local mock API via json-server)
npm start
# App: http://localhost:4200
# Mock API: http://localhost:3000

## Build for production (real TMDB API)
The production TMDB key is never committed. `npm run build:prod` runs `scripts/inject-tmdb-key.mjs`, which
reads the `TMDB_API_KEY` environment variable and writes it into `src/environments/environment.prod.ts`
just before `ng build`. The file keeps its `YOUR_TMDB_API_KEY` placeholder in git, so don't edit it by hand.

- Netlify: set `TMDB_API_KEY` under Site settings -> Environment variables. The build fails if it's missing.
- Locally (bash): `TMDB_API_KEY=your_key npm run build:prod`
- Locally (PowerShell): `$env:TMDB_API_KEY="your_key"; npm run build:prod`

A local run leaves your key in `environment.prod.ts`, so run `git checkout src/environments/environment.prod.ts`
afterwards instead of committing it.

## Switching environments
- ng serve -> uses environment.ts (useMock: true, local json-server)
- ng build --configuration production -> uses environment.prod.ts (useMock: false, real TMDB)

## Real data (TMDB)
Paste a free TMDB API key into `src/environments/environment.ts` and the app switches from the mock API
to real TMDB movies, search and per-movie trailers. See [DATA_SOURCES.md](DATA_SOURCES.md) for which API
provides what.

## Trailers
- Every movie plays its own trailer: as the hero background, as a hover preview on cards (after ~0.7 s),
  and full-size in the trailer modal.
- Mock mode: each movie in `mock-server/db.json` has its own `trailer_key` (found by
  `node scripts/fetch-trailers.mjs`). Use `trailer_url` instead to play a direct mp4 / self-hosted file.
- TMDB mode (`useMock: false`): the trailer is looked up per movie from TMDB's `/movie/{id}/videos`
  and cached. TMDB hosts its trailers on YouTube, so they play in a controls-free embed.

No authentication is implemented in this project.
