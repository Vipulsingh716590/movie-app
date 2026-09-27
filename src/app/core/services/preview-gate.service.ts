import { Injectable, signal } from '@angular/core';

/**
 * Makes sure only one card's hover-preview video plays at a time (the hero has its own, separate
 * player). Without this, moving the mouse quickly across a row could leave several trailer iframes
 * loaded at once, which is heavier than the site needs.
 */
@Injectable({ providedIn: 'root' })
export class PreviewGateService {
  private activeId = signal<symbol | null>(null);

  /** Registers as the one active preview, returning false if another preview already holds the slot. */
  claim(id: symbol): boolean {
    if (this.activeId() !== null && this.activeId() !== id) return false;
    this.activeId.set(id);
    return true;
  }

  release(id: symbol): void {
    if (this.activeId() === id) this.activeId.set(null);
  }
}
