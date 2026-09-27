import { Component, Input, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { PlayableTrailer } from '../../../core/models/trailer.model';
import { TrailerService } from '../../../core/services/trailer.service';
import { TrailerLookupService } from '../../../core/services/trailer-lookup.service';
import { PreviewGateService } from '../../../core/services/preview-gate.service';
import { PosterUrlPipe } from '../../pipes/poster-url.pipe';
import { VideoPreviewComponent } from '../video-preview/video-preview.component';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';

const PLACEHOLDER = 'assets/images/placeholder-poster.svg';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink, PosterUrlPipe, RatingBadgeComponent, VideoPreviewComponent],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  host: {
    '(mouseenter)': 'startPreview()',
    '(mouseleave)': 'stopPreview()',
    '(focusin)': 'startPreview()',
    '(focusout)': 'stopPreview()'
  }
})
export class MovieCardComponent implements OnDestroy {
  @Input({ required: true }) movie!: Movie;

  private trailer = inject(TrailerService);
  private lookup = inject(TrailerLookupService);
  private gate = inject(PreviewGateService);
  /** This card's identity in the preview gate: only one card in the whole app may hold it. */
  private gateId = Symbol('movie-card-preview');
  private previewTimer?: ReturnType<typeof setTimeout>;
  private hovering = false;
  private canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** The trailer while the hover preview is playing, null otherwise. */
  preview = signal<PlayableTrailer | null>(null);

  /** Like Netflix: a short pause on the card, then that movie's trailer plays silently over the poster. */
  startPreview(): void {
    if (!this.canHover || this.reduceMotion) return;
    this.hovering = true;
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => {
      // Only one card previews at a time app-wide, so quickly sweeping the mouse across a row
      // never leaves several trailer players loaded at once.
      if (!this.hovering || !this.gate.claim(this.gateId)) return;
      this.lookup.resolve(this.movie).subscribe((t) => {
        if (this.hovering && t && !this.trailer.current()) this.preview.set(t);
        else this.gate.release(this.gateId);
      });
    }, 700);
  }

  stopPreview(): void {
    this.hovering = false;
    clearTimeout(this.previewTimer);
    this.preview.set(null);
    this.gate.release(this.gateId);
  }

  ngOnDestroy(): void {
    clearTimeout(this.previewTimer);
    this.gate.release(this.gateId);
  }

  /** Falls back to the local placeholder once if the poster URL fails to load. */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallback']) return;
    img.dataset['fallback'] = 'true';
    img.src = PLACEHOLDER;
  }
}
