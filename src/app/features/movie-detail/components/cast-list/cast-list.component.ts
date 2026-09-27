import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CastMember } from '../../../../core/models/cast-member.model';

@Component({
  selector: 'app-cast-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cast-list.component.html',
  styleUrl: './cast-list.component.scss'
})
export class CastListComponent {
  @Input() cast: CastMember[] = [];
}
