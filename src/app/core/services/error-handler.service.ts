import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  readonly currentError = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  setError(message: string): void {
    this.currentError.set(message);
    // Restart the countdown, so an older error's timer can't hide a newer error early.
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.clearError(), 5000);
  }

  clearError(): void {
    clearTimeout(this.timer);
    this.currentError.set(null);
  }
}
