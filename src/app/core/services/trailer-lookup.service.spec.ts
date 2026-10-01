import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TrailerLookupService } from './trailer-lookup.service';
import { PlayableTrailer } from '../models/trailer.model';
import { BACKGROUND_REQUEST } from '../interceptors/background-request';
import { useEnvironment } from '../../../testing/environment';

const YT_KEY = 'dQw4w9WgXcQ';

describe('TrailerLookupService', () => {
  let service: TrailerLookupService;
  let http: HttpTestingController;

  function setUp(): void {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TrailerLookupService);
    http = TestBed.inject(HttpTestingController);
  }

  function resolve(movie: Parameters<TrailerLookupService['resolve']>[0]): PlayableTrailer | null | undefined {
    let result: PlayableTrailer | null | undefined;
    service.resolve(movie).subscribe((t) => (result = t));
    return result;
  }

  afterEach(() => http.verify());

  describe('in mock mode', () => {
    useEnvironment('mock');
    beforeEach(setUp);

    it("uses the movie's own YouTube key", () => {
      expect(resolve({ id: 1, trailer_key: YT_KEY })).toEqual({ kind: 'youtube', key: YT_KEY });
    });

    it('accepts https and bundled video files', () => {
      expect(resolve({ id: 1, trailer_url: 'https://cdn.example.com/t.mp4' })).toEqual({
        kind: 'file',
        url: 'https://cdn.example.com/t.mp4'
      });
      expect(resolve({ id: 1, trailer_url: 'assets/videos/t.webm' })).toEqual({
        kind: 'file',
        url: 'assets/videos/t.webm'
      });
    });

    it('refuses unsafe trailer URLs', () => {
      expect(resolve({ id: 1, trailer_url: 'javascript:alert(1)' })).toBeNull();
      expect(resolve({ id: 1, trailer_url: 'data:video/mp4;base64,AAAA' })).toBeNull();
      expect(resolve({ id: 1, trailer_url: 'http://insecure.example.com/t.mp4' })).toBeNull();
    });

    it('ignores a malformed YouTube key and falls back to the file', () => {
      expect(resolve({ id: 1, trailer_key: 'bad key', trailer_url: 'assets/videos/t.mp4' })).toEqual({
        kind: 'file',
        url: 'assets/videos/t.mp4'
      });
    });

    it('returns null without calling any API when the movie has no trailer', () => {
      expect(resolve({ id: 1 })).toBeNull();
      http.expectNone(() => true);
    });
  });

  describe('in TMDB mode', () => {
    const url = (id: number) => `https://api.themoviedb.org/3/movie/${id}/videos`;
    useEnvironment('tmdb');
    beforeEach(setUp);

    const video = (key: string, type: string, official = false, site = 'YouTube') => ({ key, type, official, site });

    it("still prefers the movie's own trailer over an API call", () => {
      expect(resolve({ id: 1, trailer_key: YT_KEY })).toEqual({ kind: 'youtube', key: YT_KEY });
      http.expectNone(() => true);
    });

    it('looks up /videos as a background request with the api_key', () => {
      resolve({ id: 5 });
      const req = http.expectOne((r) => r.url === url(5));
      expect(req.request.params.get('api_key')).toBe('test-key');
      expect(req.request.context.get(BACKGROUND_REQUEST)).toBeTrue();
      req.flush({ results: [] });
    });

    it('prefers an official trailer, then any trailer, then a teaser', () => {
      const cases: [ReturnType<typeof video>[], string | null][] = [
        [[video('teaser00001', 'Teaser'), video('trailer0001', 'Trailer'), video('official001', 'Trailer', true)], 'official001'],
        [[video('teaser00001', 'Teaser'), video('trailer0001', 'Trailer')], 'trailer0001'],
        [[video('featurette1', 'Featurette'), video('teaser00001', 'Teaser')], 'teaser00001'],
        [[video('featurette1', 'Featurette')], null]
      ];
      cases.forEach(([videos, expected], i) => {
        let result: PlayableTrailer | null | undefined;
        service.resolve({ id: 100 + i }).subscribe((t) => (result = t));
        http.expectOne((r) => r.url === url(100 + i)).flush({ results: videos });
        expect(result).toEqual(expected ? { kind: 'youtube', key: expected } : null);
      });
    });

    it('skips videos that are not on YouTube or have a malformed key', () => {
      let result: PlayableTrailer | null | undefined;
      service.resolve({ id: 6 }).subscribe((t) => (result = t));
      http.expectOne((r) => r.url === url(6)).flush({
        results: [video('vimeo000001', 'Trailer', true, 'Vimeo'), video('short', 'Trailer', true), video(YT_KEY, 'Teaser')]
      });
      expect(result).toEqual({ kind: 'youtube', key: YT_KEY });
    });

    it('returns null when the lookup fails', () => {
      let result: PlayableTrailer | null | undefined;
      service.resolve({ id: 7 }).subscribe((t) => (result = t));
      http.expectOne((r) => r.url === url(7)).flush('boom', { status: 500, statusText: 'Server Error' });
      expect(result).toBeNull();
    });

    it('caches the lookup per movie', () => {
      service.resolve({ id: 8 }).subscribe();
      http.expectOne((r) => r.url === url(8)).flush({ results: [video(YT_KEY, 'Trailer')] });

      let again: PlayableTrailer | null | undefined;
      service.resolve({ id: 8 }).subscribe((t) => (again = t));
      http.expectNone((r) => r.url === url(8));
      expect(again).toEqual({ kind: 'youtube', key: YT_KEY });
    });
  });
});
