import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map, switchMap } from 'rxjs';
import { MovieDetail } from '../../core/models/movie-detail.model';
import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { DetailHeaderComponent } from './components/detail-header/detail-header.component';
import { RatingInfoComponent } from './components/rating-info/rating-info.component';
import { CastListComponent } from './components/cast-list/cast-list.component';
import { MovieGridComponent } from '../../shared/components/movie-grid/movie-grid.component';

const SIMILAR_COUNT = 12;

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, DetailHeaderComponent, RatingInfoComponent, CastListComponent, MovieGridComponent],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
})
export class MovieDetailComponent {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);

  movie = signal<MovieDetail | null>(this.route.snapshot.data['movie']);
  similar = signal<Movie[]>([]);
  similarLoading = signal(true);

  constructor() {
    // Angular reuses this component instance across /movie/:id navigations, so the resolved
    // movie (and the "more like this" list) has to come from route.data, not just the snapshot.
    this.route.data
      .pipe(
        map((data) => data['movie'] as MovieDetail | null),
        switchMap((movie) => {
          this.movie.set(movie);
          this.similarLoading.set(true);
          if (!movie) return [];
          const genreIds = new Set((movie.genres ?? []).map((g) => g.id));

          return forkJoin([
            this.movieService.getPopular(),
            this.movieService.getUpcoming(),
            this.movieService.getLatest()
          ]).pipe(
            map(([popular, upcoming, latest]) => {
              const pool = new Map(
                [...popular.results, ...upcoming.results, ...latest.results].map((m) => [m.id, m])
              );
              pool.delete(movie.id);
              return [...pool.values()]
                .filter((m) => (m.genres ?? []).some((g) => genreIds.has(g.id)))
                .slice(0, SIMILAR_COUNT);
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (movies) => {
          this.similar.set(movies);
          this.similarLoading.set(false);
        },
        error: () => this.similarLoading.set(false)
      });
  }
}
