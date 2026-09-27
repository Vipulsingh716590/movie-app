# Netlify Deployment Plan

This file is the deployment plan for MovieFlix on Netlify. Nothing here has been
executed yet — it lists what's needed, the steps in order, and which files this
process will add or change. Update the **Status** column as each step is done.

## 1. Prerequisites

| # | Requirement | Why | Status |
|---|---|---|---|
| 1 | TMDB API key (free, from themoviedb.org) | Netlify only serves static files — it cannot run `mock-server`'s `json-server`. The live site must use the real TMDB API, not mock mode. | Not done |
| 2 | Git repository for this project, pushed to GitHub | Netlify's normal flow builds from a connected git repo, so every push auto-deploys. GitHub account: `Vipulsingh716590`. No `movie-app` repo exists there yet — a new one is created as part of this (§2, step 4). This machine has no `gh` CLI, so the repo itself is created on GitHub's website, not from the terminal. | Not done |
| 3 | Netlify account | To create the site and connect the repo | Not done |
| 4 | TMDB key strategy: **env-var + build script** (decided) | Keeps the key out of the git repo and out of git history; change or revoke the key from Netlify's dashboard alone, no commit needed. Note: the key still ends up in the shipped JS bundle either way (no backend proxy in this app) — the env-var route only keeps it out of the repo, not out of the browser. Hardcoding was the other option, not chosen. | Decided |

## 2. Steps to follow, in order

| Step | Action | Details |
|---|---|---|
| 1 | Get a TMDB API key | themoviedb.org → create account → Settings → API → request a key |
| 2 | Add `netlify.toml` | Holds the SPA redirect rule, build command and publish directory together, tracked in git (see §3) |
| 3 | Set the TMDB key | Set it as a Netlify environment variable (`TMDB_API_KEY`) and add a small build step that writes it into `environment.prod.ts` before `ng build` runs |
| 4 | Create the repo and push | See §3a for the exact commands — a repo scoped only to this project folder, kept separate from the unrelated git repo that already covers your whole `C:\Users\vipul` home folder |
| 5 | Create the Netlify site | Netlify dashboard → **Add new site** → **Import an existing project** → pick the GitHub repo |
| 6 | Confirm build settings | Netlify reads them from `netlify.toml` automatically — build command `npm run build:prod`, publish directory `dist/movie-app/browser`, Node version 18 or 20. Just confirm they show up right; no manual typing needed. |
| 7 | Add `TMDB_API_KEY` in Netlify → Site settings → Environment variables | Keeps the key out of the git repo |
| 8 | Trigger the first deploy | Click **Deploy site**; watch the build log for `ng build --configuration production` succeeding |
| 9 | Verify the live site | Home page loads real TMDB movies and trailers; open `/movie/<id>` directly and refresh it (should not 404); test search, hover previews, and mobile width |
| 10 | (Optional) Add a custom domain | Netlify → Site settings → Domain management |

## 3. Files this process adds or changes

| File | Status | Purpose |
|---|---|---|
| `netlify.toml` | **Created** | Holds the redirect rule (`/* /index.html 200`), the build command (`npm run build:prod`) and the publish directory (`dist/movie-app/browser`) together, tracked in git |
| `scripts/inject-tmdb-key.mjs` | **Created** | Reads `process.env.TMDB_API_KEY` and writes it into `environment.prod.ts`; exits with an error (fails the build) if the variable isn't set, so a missing key can't silently ship a broken site |
| `src/environments/environment.prod.ts` | Untouched in the repo | Keeps its `YOUR_TMDB_API_KEY` placeholder in git; the build script overwrites it locally during the Netlify build only, never committed |
| `package.json` | **Edited** | `build:prod` is now `node scripts/inject-tmdb-key.mjs && ng build --configuration production` |
| `.gitignore` | Already covers it | `dist/`, `.angular/`, and `.env` are already ignored — no change needed there |

## 3a. Creating and pushing the GitHub repo (step 4, in detail)

This machine doesn't have the `gh` CLI, so the repo itself is created on GitHub's
website; the push happens from the terminal as usual.

| # | Action | Notes |
|---|---|---|
| 1 | On github.com, sign in as `Vipulsingh716590` → **+** → **New repository** | Name: **`movie-app`** (decided). Keep it **empty** — no README/.gitignore/license from GitHub's side, since this project already has its own. |
| 2 | Copy the repo URL it gives you | `https://github.com/Vipulsingh716590/movie-app.git` |
| 3 | In this project folder (`movie-app/movie-app`), run `git init` | Must be run **inside** the project folder specifically, not at `C:\Users\vipul`, which already has an unrelated git repo covering the whole home folder. The two stay independent. |
| 4 | `git add .` then `git commit -m "Initial commit"` | `node_modules/`, `dist/`, `.angular/` are already in `.gitignore`, so they're skipped automatically |
| 5 | `git branch -M main` | Matches GitHub's default branch name |
| 6 | `git remote add origin https://github.com/Vipulsingh716590/movie-app.git` | |
| 7 | `git push -u origin main` | First push — GitHub will likely ask you to sign in (browser popup or a personal access token) |

## 4. What Netlify will NOT run

| Thing | Why it's excluded |
|---|---|
| `mock-server/` (`json-server`, `db.json`, `routes.json`) | Netlify hosts static files only — no long-running Node process. The mock API only ever runs on `localhost` during local development. |
| `npm start` (the dev script that runs both servers together) | Same reason — that script is for local development only. Netlify runs `npm run build:prod` once per deploy, not a server. |

## 5. Open decisions

1. ~~Hardcoded key vs. env-var + build script~~ — **decided: env-var + build script** (§1, item 4).
2. ~~`_redirects` vs. `netlify.toml`~~ — **decided: `netlify.toml`** (settings tracked in git, nothing to type into the Netlify dashboard).
3. ~~GitHub repo~~ — **decided: `github.com/Vipulsingh716590/movie-app`** (§3a). Repo doesn't exist on GitHub yet — create it there first (§3a, step 1), then run the commands in §3a, steps 3-7.

All three decisions are made. `netlify.toml`, `scripts/inject-tmdb-key.mjs` and the `package.json` change are done and build-tested locally (`npm run build:prod` with a test key completed successfully, output confirmed at `dist/movie-app/browser`). What's left is entirely on you: get a TMDB key, create the empty repo on GitHub, then run the git commands in §3a and continue with §2 steps 5 onward.
