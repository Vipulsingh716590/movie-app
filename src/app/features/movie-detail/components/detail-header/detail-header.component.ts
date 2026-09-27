import { Component, Input, OnChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MovieDetail } from '../../../../core/models/movie-detail.model';
import { PlayableTrailer } from '../../../../core/models/trailer.model';
import { TrailerService } from '../../../../core/services/trailer.service';
import { TrailerLookupService } from '../../../../core/services/trailer-lookup.service';
import { PosterUrlPipe } from '../../../../shared/pipes/poster-url.pipe';
import { VideoPreviewComponent } from '../../../../shared/components/video-preview/video-preview.component';

/** Poster shows first; the trailer fades in over it after this delay (same pacing as the home hero). */
const VIDEO_DELAY_MS = 1200;

const PLACEHOLDER = 'assets/images/placeholder-poster.svg';

@Component({
  selector: 'app-detail-header',
  standalone: true,
  imports: [CommonModule, PosterUrlPipe, VideoPreviewComponent],
  templateUrl: './detail-header.component.html',
  styleUrl: './detail-header.component.scss'
})
export class DetailHeaderComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) movie!: MovieDetail;

  private trailer = inject(TrailerService);
  private lookup = inject(TrailerLookupService);
  private location = inject(Location);
  private videoTimer?: ReturnType<typeof setTimeout>;
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Set when the movie has no trailer, so the button says so instead of doing nothing. */
  unavailable = signal(false);
  /** The movie's trailer, once found and the fade-in delay has passed; null while the modal is open. */
  video = signal<PlayableTrailer | null>(null);

  /** Template-accessible fallback for a movie with no poster at all. */
  readonly placeholder = PLACEHOLDER;

  ngOnChanges(): void {
    clearTimeout(this.videoTimer);
    this.video.set(null);
    if (this.reduceMotion || !this.movie) return;
    this.videoTimer = setTimeout(() => {
      this.lookup.resolve(this.movie).subscribe((t) => {
        if (t && !this.trailer.current()) this.video.set(t);
      });
    }, VIDEO_DELAY_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.videoTimer);
  }

  onVideoFailed(): void {
    this.video.set(null);
  }

  /** Falls back to the local placeholder once if the poster URL is missing or fails to load. */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallback']) return;
    img.dataset['fallback'] = 'true';
    img.src = PLACEHOLDER;
  }

  goBack(): void {
    this.location.back();
  }

  async playTrailer(): Promise<void> {
    this.video.set(null);
    if (!(await this.trailer.open(this.movie))) this.unavailable.set(true);
  }
}
