import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteSettingsService } from '../../../core/services/site-settings.service';

@Component({
  selector: 'app-rating-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-badge.component.html',
  styleUrl: './rating-badge.component.scss'
})
export class RatingBadgeComponent {
  private settings = inject(SiteSettingsService);
  private ratingSignal = signal(0);
  private movieIdSignal = signal<number | undefined>(undefined);

  /** Lets the dashboard hide this one movie's rating; without it only the global switch applies. */
  @Input() set movieId(value: number | undefined) {
    this.movieIdSignal.set(value);
  }

  /** Hidden from the movie-dashboard (global switch or per-movie). */
  visible = computed(() => {
    this.settings.settings();
    return this.settings.ratingVisible(this.movieIdSignal());
  });

  @Input() set rating(value: number) {
    this.ratingSignal.set(value ?? 0);
  }

  /** TMDB vote_average is out of 10; displayed as an IMDb-style percentage */
  percentage = computed(() => Math.round(this.ratingSignal() * 10));

  ratingClass = computed(() => {
    const pct = this.percentage();
    if (pct >= 70) return 'rating-badge--good';
    if (pct >= 40) return 'rating-badge--mid';
    return 'rating-badge--low';
  });
}
