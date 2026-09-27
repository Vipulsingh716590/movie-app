import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie } from '../models/movie.model';
import { PlayableTrailer } from '../models/trailer.model';
import { BACKGROUND_REQUEST } from '../interceptors/background-request';

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

const VIDEO_ID = /^[\w-]{11}$/;
/** Only https or bundled assets are playable; anything else (javascript:, data:) is refused. */
const PLAYABLE_FILE = /^(https:\/\/|assets\/)/;

/**
 * Finds the trailer for a movie. A movie can carry its own `trailer_key` (YouTube id) or `trailer_url`
 * (direct video file); otherwise, with TMDB, it comes from the movie's own /videos endpoint.
 * Results are cached per movie, so hovering the same card again costs nothing.
 */
@Injectable({ providedIn: 'root' })
export class TrailerLookupService {
  private http = inject(HttpClient);
  private cache = new Map<number, Observable<PlayableTrailer | null>>();

  resolve(movie: Pick<Movie, 'id' | 'trailer_key' | 'trailer_url'>): Observable<PlayableTrailer | null> {
    if (movie.trailer_key && VIDEO_ID.test(movie.trailer_key)) {
      return of({ kind: 'youtube', key: movie.trailer_key });
    }
    if (movie.trailer_url) {
      return of(PLAYABLE_FILE.test(movie.trailer_url) ? { kind: 'file', url: movie.trailer_url } : null);
    }
    if (environment.useMock) return of(null);

    let lookup = this.cache.get(movie.id);
    if (!lookup) {
      lookup = this.http
        .get<{ results: TmdbVideo[] }>(`${environment.apiBaseUrl}/movie/${movie.id}/videos`, {
          params: { api_key: environment.tmdbApiKey },
          context: new HttpContext().set(BACKGROUND_REQUEST, true)
        })
        .pipe(
          map((res) => this.pickTrailer(res.results)),
          catchError(() => of(null)),
          shareReplay(1)
        );
      this.cache.set(movie.id, lookup);
    }
    return lookup;
  }

  /** Prefers an official trailer, then any trailer, then a teaser. */
  private pickTrailer(videos: TmdbVideo[] = []): PlayableTrailer | null {
    const usable = videos.filter((v) => v.site === 'YouTube' && VIDEO_ID.test(v.key));
    const best =
      usable.find((v) => v.type === 'Trailer' && v.official) ??
      usable.find((v) => v.type === 'Trailer') ??
      usable.find((v) => v.type === 'Teaser');
    return best ? { kind: 'youtube', key: best.key } : null;
  }
}
