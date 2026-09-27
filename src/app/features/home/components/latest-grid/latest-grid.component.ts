import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { MovieGridComponent } from '../../../../shared/components/movie-grid/movie-grid.component';

@Component({
  selector: 'app-latest-grid',
  standalone: true,
  imports: [CommonModule, MovieGridComponent],
  templateUrl: './latest-grid.component.html',
  styleUrl: './latest-grid.component.scss'
})
export class LatestGridComponent implements OnInit {
  private movieService = inject(MovieService);
  movies = signal<Movie[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.movieService.getLatest().subscribe({
      next: (res) => {
        this.movies.set(res.results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
