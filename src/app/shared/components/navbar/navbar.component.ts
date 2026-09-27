import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter } from 'rxjs';

const SEARCH_DEBOUNCE_MS = 350;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnDestroy {
  private router = inject(Router);
  private typed = new Subject<string>();
  private subs = new Subscription();

  /** Transparent over the hero, solid black once the page has scrolled (Netflix / Hotstar style). */
  scrolled = signal(false);
  searchOpen = signal(false);
  menuOpen = signal(false);
  query = signal('');

  constructor() {
    // Results update as you type (after a short pause), like Netflix.
    this.subs.add(
      this.typed.pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()).subscribe((q) => {
        const term = q.trim();
        if (term) this.router.navigate(['/search'], { queryParams: { q: term } });
        else if (this.router.url.startsWith('/search')) this.router.navigate(['/']);
      })
    );
    // Leaving the search page (logo, nav links, a movie) resets the box.
    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => {
          if (!e.urlAfterRedirects.startsWith('/search')) {
            this.query.set('');
            this.searchOpen.set(false);
          }
          this.menuOpen.set(false);
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleSearch(input: HTMLInputElement): void {
    if (this.searchOpen() && this.query()) return;
    this.searchOpen.update((open) => !open);
    if (this.searchOpen()) setTimeout(() => input.focus());
  }

  onInput(value: string): void {
    this.query.set(value);
    this.typed.next(value);
  }

  /** An empty box collapses back to the icon when it loses focus. */
  onBlur(): void {
    if (!this.query().trim()) this.searchOpen.set(false);
  }

  closeSearch(input: HTMLInputElement): void {
    this.query.set('');
    this.typed.next('');
    this.searchOpen.set(false);
    input.blur();
  }
}
