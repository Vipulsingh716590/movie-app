# Data sources: what comes from which API

The app has two modes. **Mock** (default) uses a local json-server. **TMDB** uses the public
[TMDB API](https://developer.themoviedb.org/) once a free API key is pasted into
`src/environments/environment.ts` (dev) or `environment.prod.ts` (production).

| What the user sees | Mock mode source | TMDB mode endpoint | Code |
|---|---|---|---|
| Popular Movies row | `GET /movie/popular` (json-server, `db.json` -> `popular`) | `GET /movie/popular` | `MovieService.getPopular` |
| Upcoming Movies row | `GET /movie/upcoming` | `GET /movie/upcoming` | `MovieService.getUpcoming` |
| Now Playing row | `GET /movie/now_playing` | `GET /movie/now_playing` | `MovieService.getLatest` |
| Hero slides | `GET /movie/hero` | `GET /trending/movie/week` (first 6 with backdrop) | `MovieService.getHeroMovies` |
| Genre names on cards | inside `db.json` | `GET /genre/movie/list` (list endpoints only return genre ids) | `MovieService.list` |
| Movie detail page + cast | `GET /movie/:id` | `GET /movie/{id}?append_to_response=credits` | `MovieService.getMovieById` |
| Search box (`/search?q=`) | filters the mock lists by title in the browser | `GET /search/movie?query=` | `MovieService.searchMovies` |
| Posters / backdrops | absolute URLs in `db.json` | `https://image.tmdb.org/t/p/w500` and `/original` | `PosterUrlPipe` |
| **Trailer of each movie** (hero background, card hover preview, trailer modal) | `trailer_key` in `db.json`: that movie's own official trailer (YouTube id), filled by `scripts/fetch-trailers.mjs` | `GET /movie/{id}/videos` -> that movie's own official trailer | `TrailerLookupService` |

## Mock-mode trailers
Per-movie table with the source channel and link: [TRAILER_SOURCES.md](TRAILER_SOURCES.md).

Every movie in `db.json` has its own `trailer_key`. `node scripts/fetch-trailers.mjs` finds them: it
searches "<title> <year> official trailer" and accepts a result only if YouTube's oEmbed says it is
public/embeddable and its title contains the movie name plus "trailer"/"teaser". Re-run it after adding
movies to `db.json`. A movie can instead carry `trailer_url` (a direct mp4) to play a self-hosted file.

## Notes
- Real per-movie trailers need a TMDB key. TMDB hosts its trailers on YouTube, so they play in a
  controls-free embed (no YouTube button or link is shown).
- Only trailers are available from public APIs. Full-length movies are not (they are copyrighted).
- `TrailerLookupService` caches each movie's lookup, so hovering the same card again makes no new request.
