import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlayableTrailer, trailerId } from '../../../core/models/trailer.model';

/**
 * Silent, chrome-less, looping trailer used as a Netflix-style hero background / card hover preview.
 * Direct files play in a <video>; hosted videos play in a controls-free embed. Both start muted
 * (browsers only allow muted autoplay) and `muted` can be flipped while playing.
 */
@Component({
  selector: 'app-video-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <video *ngIf="trailer.kind === 'file'" #video class="video-preview__media" [src]="trailer.url"
      autoplay loop playsinline preload="auto" disablepictureinpicture tabindex="-1" aria-hidden="true"
      [class.is-ready]="ready()" (playing)="ready.set(true)" (error)="failed.emit()"></video>

    <iframe *ngIf="embedSrc() as url" #frame class="video-preview__media video-preview__media--embed"
      [src]="url" title="Trailer preview" tabindex="-1" allow="autoplay; encrypted-media"
      referrerpolicy="strict-origin-when-cross-origin" [class.is-ready]="ready()"
      (load)="onFrameLoad()"></iframe>
  `,
  styles: [`
    :host { position: absolute; inset: 0; overflow: hidden; pointer-events: none; container-type: size; }
    .video-preview__media {
      width: 100%; height: 100%; object-fit: cover; display: block;
      opacity: 0; transition: opacity 0.6s ease;
      /* Slight zoom crops the black letterbox bars that many clips have baked into the frame */
      transform: scale(1.18);
    }
    .video-preview__media.is-ready { opacity: 1; }
    /* A 16:9 embed is scaled up so it always covers the box, like object-fit: cover */
    .video-preview__media--embed {
      position: absolute; top: 50%; left: 50%; border: 0;
      width: max(100cqw, 177.78cqh); height: max(100cqh, 56.25cqw);
      transform: translate(-50%, -50%) scale(1.3);
    }
  `]
})
export class VideoPreviewComponent implements OnChanges {
  @Input({ required: true }) trailer!: PlayableTrailer;
  @Input() muted = true;
  /** Emits when a video file cannot be loaded, so the parent can fall back to the poster. */
  @Output() failed = new EventEmitter<void>();
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;
  @ViewChild('frame') frame?: ElementRef<HTMLIFrameElement>;

  ready = signal(false);
  embedSrc = signal<SafeResourceUrl | null>(null);
  private currentId = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    const id = trailerId(this.trailer);
    if (id !== this.currentId) {
      this.currentId = id;
      this.ready.set(false);
      // Built once per trailer: a new SafeResourceUrl on every change detection would reload the iframe.
      this.embedSrc.set(
        this.trailer.kind === 'youtube'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube-nocookie.com/embed/${this.trailer.key}?autoplay=1&mute=1&controls=0` +
                `&modestbranding=1&playsinline=1&rel=0&disablekb=1` +
                `&iv_load_policy=3&fs=0&enablejsapi=1`
            )
          : null
      );
    }
    this.applyMute();
  }

  /** Asks the embedded player to report its state, so the frame is only shown once video is playing. */
  onFrameLoad(): void {
    this.frame?.nativeElement.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
      '*'
    );
    this.applyMute();
  }

  /**
   * Until the video really plays (state 1) the embed stays invisible. A blocked or slow autoplay would
   * otherwise show the player's own play / previous / next buttons over the hero or the card.
   */
  @HostListener('window:message', ['$event'])
  onPlayerMessage(event: MessageEvent): void {
    if (event.source !== this.frame?.nativeElement.contentWindow || typeof event.data !== 'string') return;
    try {
      const msg = JSON.parse(event.data);
      const state = msg.event === 'onStateChange' ? msg.info : msg.info?.playerState;
      if (state === 1) this.ready.set(true);
      // Looping via the player API: the `loop` embed parameter needs a playlist, which brings
      // previous / next buttons along.
      if (state === 0) this.command('seekTo', [0, true]);
      if (state === 0) this.command('playVideo');
    } catch {
      /* not a player message */
    }
  }

  private command(func: string, args: unknown[] = []): void {
    this.frame?.nativeElement.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  }

  /** `muted` must be applied as a DOM property / player command: the attribute only counts at creation. */
  applyMute(): void {
    const el = this.video?.nativeElement;
    if (el) {
      el.muted = this.muted;
      if (!this.muted && el.paused) el.play().catch(() => (el.muted = true));
    }
    this.frame?.nativeElement.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: this.muted ? 'mute' : 'unMute', args: [] }),
      '*'
    );
  }
}
