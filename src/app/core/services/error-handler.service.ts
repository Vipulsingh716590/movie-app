import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  readonly currentError = signal<string | null>(null);

  setError(message: string): void {
    this.currentError.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  clearError(): void {
    this.currentError.set(null);
  }
}
