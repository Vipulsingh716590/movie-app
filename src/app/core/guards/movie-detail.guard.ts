import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { MovieService } from '../services/movie.service';
import { MovieDetail } from '../models/movie-detail.model';

/**
 * Pre-fetches the movie detail before the route activates, so the
 * detail component renders with data already available (no flicker).
 */
export const movieDetailResolver: ResolveFn<MovieDetail | null> = (route) => {
  const movieService = inject(MovieService);
  const id = route.paramMap.get('id')!;

  return movieService.getMovieById(id).pipe(
    catchError(() => of(null))
  );
};
