import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { TrailerService } from '../../../core/services/trailer.service';

@Component({
  selector: 'app-trailer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trailer-modal.component.html',
  styleUrl: './trailer-modal.component.scss',
  host: { '(document:keydown.escape)': 'trailer.close()' }
})
export class TrailerModalComponent {
  trailer = inject(TrailerService);
  private sanitizer = inject(DomSanitizer);

  /** Only a validated 11-character video id ever reaches the embed URL (see TrailerLookupService). */
  embedUrl = computed(() => {
    const t = this.trailer.current()?.trailer;
    return t?.kind === 'youtube'
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${t.key}?autoplay=1&rel=0&modestbranding=1`
        )
      : null;
  });
}
