import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

/** Shows the app's current request error as a dismissible toast, so a failed load is never silent. */
@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss'
})
export class ErrorBannerComponent {
  errorHandler = inject(ErrorHandlerService);

  reload(): void {
    this.errorHandler.clearError();
    window.location.reload();
  }
}
