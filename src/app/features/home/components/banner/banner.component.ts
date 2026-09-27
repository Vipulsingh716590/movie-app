import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';
import { PlayableTrailer, trailerId } from '../../../../core/models/trailer.model';
import { TrailerService } from '../../../../core/services/trailer.service';
import { TrailerLookupService } from '../../../../core/services/trailer-lookup.service';
import { PosterUrlPipe } from '../../../../shared/pipes/poster-url.pipe';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { VideoPreviewComponent } from '../../../../shared/components/video-preview/video-preview.component';
import { RatingBadgeComponent } from '../../../../shared/components/rating-badge/rating-badge.component';

const AUTOPLAY_MS = 7000;
/** Slides that play a trailer stay long enough to actually watch it. */
const AUTOPLAY_VIDEO_MS = 30000;
/** Poster shows first; the trailer fades in over it after this delay (Netflix behaviour). */
const VIDEO_DELAY_MS = 1500;

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, PosterUrlPipe, TruncatePipe, RatingBadgeComponent, VideoPreviewComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent implements OnInit, OnDestroy {
  private movieService = inject(MovieService);
  private trailer = inject(TrailerService);
  private lookup = inject(TrailerLookupService);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer?: ReturnType<typeof setInterval>;
  private videoTimer?: ReturnType<typeof setTimeout>;
  private observer?: IntersectionObserver;
  private reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  slides = signal<Movie[]>([]);
  /** True once the hero list has responded (even to an empty list), so the skeleton knows to stop. */
  loaded = signal(false);
  active = signal(0);
  muted = signal(true);
  /** Trailer found for the active slide, once the delay after a slide change has passed. */
  private activeTrailer = signal<PlayableTrailer | null>(null);
  /** Trailers that failed to load; the hero falls back to the poster for those. */
  private failed = signal<ReadonlySet<string>>(new Set());
  /** False while the hero is scrolled off-screen, so the trailer stops instead of playing unseen. */
  private inView = signal(true);

  /** Video plays only for the visible active slide, and never on top of the trailer modal. */
  video = computed(() => {
    const t = this.activeTrailer();
    if (!t || this.reduceMotion || !this.inView() || this.trailer.current()) return null;
    return this.failed().has(trailerId(t)) ? null : t;
  });

  constructor() {
    effect(() => {
      const movie = this.slides()[this.active()];
      clearTimeout(this.videoTimer);
      this.activeTrailer.set(null);
      if (!movie) return;
      this.videoTimer = setTimeout(() => {
        this.lookup.resolve(movie).subscribe((t) => {
          // The user may have moved to another slide while the lookup was running.
          if (this.slides()[this.active()] === movie) this.activeTrailer.set(t);
        });
      }, VIDEO_DELAY_MS);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.movieService.getHeroMovies().subscribe({
      next: (res) => {
        this.slides.set(res.results);
        this.resume();
      },
      complete: () => this.loaded.set(true)
    });
    this.observer = new IntersectionObserver(([entry]) => this.inView.set(entry.isIntersecting), { threshold: 0.35 });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.pause();
    clearTimeout(this.videoTimer);
    this.observer?.disconnect();
  }

  toggleMute(): void {
    this.muted.update((m) => !m);
  }

  go(index: number): void {
    this.active.set(index);
  }

  pause(): void {
    clearInterval(this.timer);
  }

  resume(): void {
    this.pause();
    if (this.reduceMotion || this.slides().length < 2) return;
    // Slides play a trailer in most cases, so give them the longer interval.
    this.timer = setInterval(
      () => this.active.update((i) => (i + 1) % this.slides().length),
      AUTOPLAY_VIDEO_MS
    );
  }

  /** "Watch Now" plays the trailer in the modal; without a trailer it opens the movie's detail page. */
  async watchNow(movie: Movie): Promise<void> {
    if (await this.trailer.open(movie)) return;
    this.router.navigate(['/movie', movie.id]);
  }

  onVideoFailed(t: PlayableTrailer): void {
    this.failed.update((set) => new Set(set).add(trailerId(t)));
  }

  isUpcoming(movie: Movie): boolean {
    return new Date(movie.release_date) > new Date();
  }
}
