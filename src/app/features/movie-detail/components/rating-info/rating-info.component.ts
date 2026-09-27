import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDetail } from '../../../../core/models/movie-detail.model';
import { RatingBadgeComponent } from '../../../../shared/components/rating-badge/rating-badge.component';

@Component({
  selector: 'app-rating-info',
  standalone: true,
  imports: [CommonModule, RatingBadgeComponent],
  templateUrl: './rating-info.component.html',
  styleUrl: './rating-info.component.scss'
})
export class RatingInfoComponent {
  @Input({ required: true }) movie!: MovieDetail;
}
