import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Movie } from '../models/movie.model';
import { PlayableTrailer } from '../models/trailer.model';
import { TrailerLookupService } from './trailer-lookup.service';

export interface ActiveTrailer {
  title: string;
  trailer: PlayableTrailer;
}

@Injectable({ providedIn: 'root' })
export class TrailerService {
  private lookup = inject(TrailerLookupService);
  readonly current = signal<ActiveTrailer | null>(null);

  constructor() {
    // Lock page scroll while the trailer modal is open.
    effect(() => {
      document.body.style.overflow = this.current() ? 'hidden' : '';
    });
  }

  /** Resolves the movie's trailer and opens it. Returns false when the movie has none. */
  async open(movie: Pick<Movie, 'id' | 'title' | 'trailer_key' | 'trailer_url'>): Promise<boolean> {
    const trailer = await firstValueFrom(this.lookup.resolve(movie));
    if (!trailer) return false;
    this.current.set({ title: movie.title, trailer });
    return true;
  }

  close(): void {
    this.current.set(null);
  }
}
