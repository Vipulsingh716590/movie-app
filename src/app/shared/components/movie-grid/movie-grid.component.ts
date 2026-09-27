import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

/** One Netflix-style row: a title above a horizontally scrolling strip of cards with arrow buttons. */
@Component({
  selector: 'app-movie-grid',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, SkeletonLoaderComponent],
  templateUrl: './movie-grid.component.html',
  styleUrl: './movie-grid.component.scss'
})
export class MovieGridComponent implements OnChanges, AfterViewInit {
  @Input() title = '';
  @Input() movies: Movie[] = [];
  @Input() loading = false;
  /** Element id, so the navbar can jump to this row. */
  @Input() anchor = '';
  /** Shows a big rank number (1, 2, 3…) beside each card, Netflix "Top 10" style. */
  @Input() ranked = false;
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  readonly skeletons = Array.from({ length: 10 });
  atStart = signal(true);
  atEnd = signal(false);

  ngAfterViewInit(): void {
    this.updateArrows();
  }

  ngOnChanges(): void {
    // Wait for the new cards to render before measuring.
    setTimeout(() => this.updateArrows());
  }

  /** Scrolls by roughly one screenful of cards. */
  scrollBy(direction: -1 | 1): void {
    const el = this.scroller?.nativeElement;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  updateArrows(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    this.atStart.set(el.scrollLeft < 8);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }
}
