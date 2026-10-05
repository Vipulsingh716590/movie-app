import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BACKGROUND_REQUEST } from '../interceptors/background-request';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../models/site-settings.model';

/**
 * Display switches managed from the movie-dashboard. Only the mock API stores them; with real TMDB data (or if the
 * settings can't be loaded) everything stays visible, so a missing dashboard never hides content.
 */
@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private http = inject(HttpClient);

  private state = signal<SiteSettings>(DEFAULT_SITE_SETTINGS);
  readonly settings = this.state.asReadonly();

  constructor() {
    if (!environment.useMock) return;
    this.http
      .get<Partial<SiteSettings>>(`${environment.apiBaseUrl}/settings`, {
        context: new HttpContext().set(BACKGROUND_REQUEST, true)
      })
      .pipe(catchError(() => of({} as Partial<SiteSettings>)))
      .subscribe((saved) => this.state.set({ ...DEFAULT_SITE_SETTINGS, ...saved }));
  }

  ratingVisible(movieId?: number): boolean {
    const s = this.state();
    return s.showRatings && !(movieId !== undefined && s.hiddenRatingIds.includes(movieId));
  }
}
