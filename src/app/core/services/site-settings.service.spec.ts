import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SiteSettingsService } from './site-settings.service';
import { environment } from '../../../environments/environment';

describe('SiteSettingsService', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const service = TestBed.inject(SiteSettingsService);
    const http = TestBed.inject(HttpTestingController);
    return { service, http };
  }

  it('shows every rating until the dashboard says otherwise', () => {
    const { service } = setup();
    expect(service.ratingVisible(1)).toBeTrue();
  });

  if (environment.useMock) {
    it('hides all ratings, or one movie, from the saved settings', () => {
      const { service, http } = setup();
      http.expectOne(`${environment.apiBaseUrl}/settings`).flush({ hiddenRatingIds: [7] });
      expect(service.ratingVisible(7)).toBeFalse();
      expect(service.ratingVisible(8)).toBeTrue();
    });

    it('falls back to showing everything when settings cannot be loaded', () => {
      const { service, http } = setup();
      http.expectOne(`${environment.apiBaseUrl}/settings`).error(new ProgressEvent('error'));
      expect(service.ratingVisible(1)).toBeTrue();
    });
  }
});
