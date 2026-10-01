import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubePlayer } from '@angular/youtube-player';
import { TrailerService } from '../../../core/services/trailer.service';

@Component({
  selector: 'app-trailer-modal',
  standalone: true,
  imports: [CommonModule, YouTubePlayer],
  templateUrl: './trailer-modal.component.html',
  styleUrl: './trailer-modal.component.scss',
  host: { '(document:keydown.escape)': 'trailer.close()' }
})
export class TrailerModalComponent {
  trailer = inject(TrailerService);

  /** Starts the trailer as soon as the dialog opens; rel=0 keeps suggestions to the same channel. */
  readonly playerVars: YT.PlayerVars = { autoplay: 1, rel: 0, playsinline: 1 };

  /** Only a validated 11-character video id ever reaches the player (see TrailerLookupService). */
  youtubeKey = computed(() => {
    const t = this.trailer.current()?.trailer;
    return t?.kind === 'youtube' ? t.key : null;
  });
}
