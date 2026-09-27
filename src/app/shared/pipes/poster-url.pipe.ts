import { Pipe, PipeTransform, inject } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';

@Pipe({
  name: 'posterUrl',
  standalone: true
})
export class PosterUrlPipe implements PipeTransform {
  private movieService = inject(MovieService);

  transform(path: string, type: 'poster' | 'backdrop' = 'poster'): string {
    return type === 'poster'
      ? this.movieService.getPosterUrl(path)
      : this.movieService.getBackdropUrl(path);
  }
}
