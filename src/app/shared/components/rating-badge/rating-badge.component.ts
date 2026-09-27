import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-badge.component.html',
  styleUrl: './rating-badge.component.scss'
})
export class RatingBadgeComponent {
  private ratingSignal = signal(0);

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
