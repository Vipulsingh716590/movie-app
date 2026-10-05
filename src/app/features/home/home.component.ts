import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './components/banner/banner.component';
import { UpcomingGridComponent } from './components/upcoming-grid/upcoming-grid.component';
import { LatestGridComponent } from './components/latest-grid/latest-grid.component';
import { PopularGridComponent } from './components/popular-grid/popular-grid.component';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BannerComponent, UpcomingGridComponent, LatestGridComponent, PopularGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  settings = inject(SiteSettingsService);
}
