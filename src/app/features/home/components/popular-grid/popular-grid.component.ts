import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { MovieGridComponent } from '../../../../shared/components/movie-grid/movie-grid.component';

@Component({
  selector: 'app-popular-grid',
  standalone: true,
  imports: [CommonModule, MovieGridComponent],
  templateUrl: './popular-grid.component.html'
})
export class PopularGridComponent implements OnInit {
  private movieService = inject(MovieService);
  movies = signal<Movie[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.movieService.getPopular().subscribe({
      next: (res) => {
        this.movies.set(res.results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
