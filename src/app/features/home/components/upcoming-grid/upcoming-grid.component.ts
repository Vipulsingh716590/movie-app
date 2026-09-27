import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { MovieGridComponent } from '../../../../shared/components/movie-grid/movie-grid.component';

@Component({
  selector: 'app-upcoming-grid',
  standalone: true,
  imports: [CommonModule, MovieGridComponent],
  templateUrl: './upcoming-grid.component.html',
  styleUrl: './upcoming-grid.component.scss'
})
export class UpcomingGridComponent implements OnInit {
  private movieService = inject(MovieService);
  movies = signal<Movie[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.movieService.getUpcoming().subscribe({
      next: (res) => {
        this.movies.set(res.results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
