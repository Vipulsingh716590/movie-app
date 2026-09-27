import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

const RECENT_KEY = 'movieflix.recentSearches';
const RECENT_MAX = 6;

/** Search results for `/search?q=...`: a card grid, filterable by genre, where every card previews its own trailer. */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, SkeletonLoaderComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  query = signal('');
  results = signal<Movie[]>([]);
  loading = signal(false);
  activeGenre = signal<string | null>(null);
  recent = signal<string[]>(this.loadRecent());
  readonly skeletons = Array.from({ length: 12 });

  /** Genres present in the current results, so the chip row only ever offers filters that do something. */
  genres = computed(() => {
    const names = new Set<string>();
    for (const movie of this.results()) for (const g of movie.genres ?? []) names.add(g.name);
    return [...names].sort();
  });

  filtered = computed(() => {
    const genre = this.activeGenre();
    return genre ? this.results().filter((m) => (m.genres ?? []).some((g) => g.name === genre)) : this.results();
  });

  constructor() {
    this.route.queryParamMap
      .pipe(
        map((params) => (params.get('q') ?? '').trim()),
        tap((q) => {
          this.query.set(q);
          this.activeGenre.set(null);
          this.loading.set(!!q);
          if (q) this.saveRecent(q);
        }),
        switchMap((q) =>
          q
            ? this.movieService.searchMovies(q).pipe(catchError(() => of({ results: [] as Movie[] })))
            : of({ results: [] as Movie[] })
        ),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.results.set(res.results);
        this.loading.set(false);
      });
  }

  setGenre(genre: string | null): void {
    this.activeGenre.update((current) => (current === genre ? null : genre));
  }

  searchAgain(term: string): void {
    this.router.navigate(['/search'], { queryParams: { q: term } });
  }

  private loadRecent(): string[] {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private saveRecent(term: string): void {
    const next = [term, ...this.recent().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_MAX);
    this.recent.set(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* private browsing / storage disabled: recent searches just won't persist */
    }
  }
}
