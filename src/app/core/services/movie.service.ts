import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre, Movie, MovieResponse } from '../models/movie.model';
import { MovieDetail } from '../models/movie-detail.model';
import { CastMember } from '../models/cast-member.model';
import { hasDevanagari, movieMatches } from '../utils/search-text';

/** TMDB list endpoints return genre ids only; these are the extra fields we read. */
type TmdbMovie = Movie & { genre_ids?: number[] };
type TmdbResponse = { results: TmdbMovie[] };
type TmdbDetail = Omit<MovieDetail, 'cast'> & { credits?: { cast: CastMember[] } };

const HERO_COUNT = 6;
const CAST_COUNT = 12;

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  /** TMDB genre id -> name, fetched once. */
  private genres$ = this.http
    .get<{ genres: Genre[] }>(`${this.base}/genre/movie/list`, { params: this.apiParams })
    .pipe(map((res) => new Map(res.genres.map((g) => [g.id, g.name]))), shareReplay(1));

  /** Every movie the mock API knows, without duplicates (the home lists plus extra search-only Hindi films). */
  private mockCatalog$ = forkJoin([
    this.getHeroMovies(),
    this.getPopular(),
    this.getUpcoming(),
    this.getLatest(),
    this.http.get<MovieResponse>(`${this.base}/search/movie`)
  ]).pipe(
    map((lists) => [...new Map(lists.flatMap((l) => l.results).map((m) => [m.id, m])).values()]),
    shareReplay(1)
  );

  /** api_key is only appended when hitting the real TMDB API */
  private get apiParams(): Record<string, string> {
    return environment.useMock ? {} : { api_key: environment.tmdbApiKey };
  }

  getUpcoming(): Observable<MovieResponse> {
    return this.list('/movie/upcoming');
  }

  getLatest(): Observable<MovieResponse> {
    return this.list('/movie/now_playing');
  }

  getPopular(): Observable<MovieResponse> {
    return this.list('/movie/popular');
  }

  /** Mock API has a dedicated /movie/hero list; on TMDB the hero is this week's trending movies. */
  getHeroMovies(): Observable<MovieResponse> {
    return environment.useMock
      ? this.http.get<MovieResponse>(`${this.base}/movie/hero`)
      : this.list('/trending/movie/week', (movies) =>
          movies.filter((m) => m.backdrop_path && m.overview).slice(0, HERO_COUNT)
        );
  }

  getMovieById(id: string | number): Observable<MovieDetail> {
    if (environment.useMock) {
      return this.http.get<MovieDetail>(`${this.base}/movie/${id}`);
    }
    return this.http
      .get<TmdbDetail>(`${this.base}/movie/${id}`, {
        params: { ...this.apiParams, append_to_response: 'credits' }
      })
      .pipe(
        map(({ credits, ...movie }) => ({
          ...movie,
          cast: (credits?.cast ?? []).slice(0, CAST_COUNT)
        }))
      );
  }

  /**
   * Works in Hindi and English. TMDB is asked twice, in English and in Hindi, so "Sholay" and "शोले" (or
   * "इंसेप्शन" for Inception) all match; the language you typed in decides which list leads and which
   * titles you see. The mock API matches titles, original titles and alternative (Hindi/English) titles.
   */
  searchMovies(query: string): Observable<MovieResponse> {
    if (!environment.useMock) {
      const languages = hasDevanagari(query) ? ['hi-IN', 'en-US'] : ['en-US', 'hi-IN'];
      return forkJoin(
        languages.map((language, i) => {
          const request = this.list('/search/movie', undefined, { query, language });
          // The second language only adds extra matches; if it fails, the first one's results still show.
          return i === 0 ? request : request.pipe(catchError(() => of({ results: [] as Movie[] })));
        })
      ).pipe(
        map((lists) => {
          // First language's order and titles win; the other language only appends movies not found yet.
          const merged = new Map<number, Movie>();
          for (const movie of lists.flatMap((l) => l.results)) if (!merged.has(movie.id)) merged.set(movie.id, movie);
          return { results: [...merged.values()] };
        })
      );
    }

    return this.mockCatalog$.pipe(map((movies) => ({ results: movies.filter((m) => movieMatches(m, query)) })));
  }

  /** Builds a full poster/backdrop URL. In mock mode, picsum URLs are already absolute. */
  getPosterUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${environment.imageBaseUrl}${path}`;
  }

  getBackdropUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${environment.backdropBaseUrl}${path}`;
  }

  /** Fetches a movie list; on TMDB it also turns genre ids into names so cards can show genres. */
  private list(
    path: string,
    pick: (movies: TmdbMovie[]) => TmdbMovie[] = (m) => m,
    extra: Record<string, string> = {}
  ): Observable<MovieResponse> {
    const request = this.http.get<TmdbResponse>(`${this.base}${path}`, {
      params: { ...this.apiParams, ...extra }
    });
    if (environment.useMock) return request;

    return request.pipe(
      switchMap((res) =>
        this.genres$.pipe(
          map((names) => ({
            results: pick(res.results).map(({ genre_ids, ...movie }) => ({
              ...movie,
              genres: (genre_ids ?? []).flatMap((id) => (names.has(id) ? [{ id, name: names.get(id)! }] : []))
            }))
          }))
        )
      )
    );
  }
}
