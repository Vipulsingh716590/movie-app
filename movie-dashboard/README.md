# MovieFlix Dashboard (Angular)

The admin dashboard for the [MovieFlix app](../README.md). It reads and edits the same data the app shows, and
controls what visitors see, for example turning ratings off.

## Run
```
cd movie-dashboard
npm install
npm start          # starts the shared mock API (port 3000) and the dashboard: http://localhost:4300
```
The movie app (`npm start` in the repo root, port 4200) and the dashboard share one `mock-server/db.json`. If the
API is already running, start only the dashboard with `npx ng serve`. `npm test` runs the unit tests, `npm run build:prod` builds it.

## What it does
| Page | What you can do |
|------|-----------------|
| **Overview** | KPIs (movies, average rating, average runtime, genres), rating distribution, genre donut, movies per decade, movies per site section, top rated, and a quick "Show ratings" switch. |
| **Movies** | Search (English or Hindi title), filter by genre or section, sort, edit title / overview / release date / rating, and hide the rating of a single movie. |
| **Display settings** | Master switch for all ratings, clear per-movie overrides, show or hide the hero banner and the Popular / Upcoming / Now playing sections, reset to defaults, live preview. |

Every switch is saved straight away (and rolled back with an error toast if the API is down). The movie app loads the
settings on start-up and applies them.

## How the two apps connect
```
dashboard (4300) ──PUT /settings──▶ json-server (3000, mock-server/db.json) ◀──GET /settings── movie app (4200)
```
- `settings` is a new object in `mock-server/db.json` (`showRatings`, `hiddenRatingIds`, `showHeroBanner`, `showPopular`, `showUpcoming`, `showLatest`).
- Movie app side: `SiteSettingsService` (`src/app/core/services/site-settings.service.ts`) loads it; `RatingBadgeComponent` and `HomeComponent` honour it.
  If the settings can't be loaded (or in TMDB mode) everything stays visible, so the dashboard being down never hides content.
- Editing a movie patches `movieDetails/:id` **and** the copies in the `hero` / `popular` / `upcoming` / `latest` lists, so both apps agree.

## Structure (same layout as the movie app)
```
src/app
├── core
│   ├── interceptors/   error.interceptor (API errors -> toast)
│   ├── models/         movie, site-settings
│   ├── services/       movie-api (HTTP), movie-store (signals + derived stats), toast
│   └── utils/          analytics (pure stat functions, unit tested)
├── features
│   ├── overview/       lazy route + page
│   ├── movies/         lazy route + page + components/movie-editor
│   └── settings/       lazy route + page
└── shared
    ├── components/     sidebar, stat-card, bar-chart, donut-chart, toggle-switch, rating-badge, toast-container, loading-state
    └── pipes/          runtime
```
Design choices: standalone components, lazy-loaded routes with default-exported route files, signals for state
(one `MovieStore` for every page), optimistic updates with rollback, charts drawn with plain HTML/SVG (no chart library, so
the bundle stays small and the charts are accessible), keyboard-accessible `role="switch"` toggles, responsive layout.

## Ideas for next steps
1. **Login / roles.** Today anyone who can reach the dashboard can change the site. Add auth (JWT or an identity provider) and an `admin`/`editor` role guard on the routes before deploying it.
2. **Real backend.** Replace json-server with a real API/database; keep `MovieApiService` as the only file that changes.
3. **Add and delete movies**, with a TMDB search-and-import so an admin does not type everything by hand.
4. **Hide or feature a movie** (not just its rating), and reorder the hero banner and sections by drag and drop.
5. **Real analytics.** Views, trailer plays, searches (including searches with no result) and watch-time per movie, from tracking events, with date-range filters. These are what dashboards are normally used for.
6. **Audit log and undo** of every change (who changed what, when).
7. **Scheduling**: show a section or flip a switch at a set date (for example a release day).
8. **Bulk actions** in the table (select many, hide ratings, assign sections) and CSV export.
9. **Dark/light theme and Hindi labels**, since the site already supports Hindi search.
10. **E2E tests** (Playwright) for the switch -> site flow, and a Netlify deploy of the dashboard behind authentication.
