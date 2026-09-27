import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { MovieDetail } from '../../core/models/movie-detail.model';

/**
 * Fetches the movie before the route activates, so the detail
 * component renders with data ready (no loading flicker on entry).
 */
export const movieDetailResolver: ResolveFn<MovieDetail | null> = (route) => {
  const movieService = inject(MovieService);
  const id = route.paramMap.get('id')!;

  return movieService.getMovieById(id).pipe(
    catchError(() => of(null))
  );
};
