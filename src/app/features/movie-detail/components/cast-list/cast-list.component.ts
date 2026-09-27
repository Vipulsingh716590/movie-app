import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CastMember } from '../../../../core/models/cast-member.model';
import { PosterUrlPipe } from '../../../../shared/pipes/poster-url.pipe';

const PLACEHOLDER = 'assets/images/placeholder-poster.svg';

@Component({
  selector: 'app-cast-list',
  standalone: true,
  imports: [CommonModule, PosterUrlPipe],
  templateUrl: './cast-list.component.html',
  styleUrl: './cast-list.component.scss'
})
export class CastListComponent {
  @Input() cast: CastMember[] = [];

  /** Template-accessible fallback for a member with no photo at all. */
  readonly placeholder = PLACEHOLDER;

  /** Falls back to the local placeholder once if the photo URL is missing or fails to load. */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallback']) return;
    img.dataset['fallback'] = 'true';
    img.src = PLACEHOLDER;
  }
}
