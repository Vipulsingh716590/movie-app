import { Component, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { TrailerModalComponent } from './shared/components/trailer-modal/trailer-modal.component';
import { ErrorBannerComponent } from './shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    TrailerModalComponent,
    ErrorBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor() {
    // Keep in-page jumps (navbar links) from landing under the fixed navbar.
    inject(ViewportScroller).setOffset([0, 72]);
  }
}
