import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { Movie, MovieResponse } from '../models/movie.model';
import { useEnvironment } from '../../../testing/environment';

const movie = (id: number, title: string, extra: Partial<Movie> = {}): Movie => ({
  id,
  title,
  poster_path: `/p${id}.jpg`,
  backdrop_path: `/b${id}.jpg`,
  release_date: '2024-01-01',
  vote_average: 7,
  overview: `About ${title}`,
  ...extra
});

describe('MovieService', () => {
  let service: MovieService;
  let http: HttpTestingController;

  function setUp(): void {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
  }

  afterEach(() => http.verify());

  describe('in mock mode', () => {
    const base = 'http://localhost:3000';
    useEnvironment('mock');
    beforeEach(setUp);

    it('fetches the list endpoints without an api_key', () => {
      const lists: [() => unknown, string][] = [
        [() => service.getPopular(), '/movie/popular'],
        [() => service.getUpcoming(), '/movie/upcoming'],
        [() => service.getLatest(), '/movie/now_playing'],
        [() => service.getHeroMovies(), '/movie/hero']
      ];
      for (const [call, path] of lists) {
        let result: MovieResponse | undefined;
        (call() as ReturnType<MovieService['getPopular']>).subscribe((r) => (result = r));
        const req = http.expectOne(`${base}${path}`);
        expect(req.request.params.has('api_key')).toBeFalse();
        const body = { results: [movie(1, 'Inception')] };
        req.flush(body);
        expect(result).toEqual(body);
      }
    });

    it('returns movie details as served', () => {
      let result: unknown;
      service.getMovieById(42).subscribe((r) => (result = r));
      const detail = { ...movie(42, 'Dune'), genres: [], cast: [] };
      http.expectOne(`${base}/movie/42`).flush(detail);
      expect(result).toEqual(detail);
    });

    it('searches every mock list by title, case-insensitively and without duplicates', () => {
      let result: MovieResponse | undefined;
      service.searchMovies('  DARK ').subscribe((r) => (result = r));

      const knight = movie(1, 'The Dark Knight');
      http.expectOne(`${base}/movie/hero`).flush({ results: [knight] });
      http.expectOne(`${base}/movie/popular`).flush({ results: [knight, movie(2, 'Inception')] });
      http.expectOne(`${base}/movie/upcoming`).flush({ results: [movie(3, 'Dark Waters')] });
      http.expectOne(`${base}/movie/now_playing`).flush({ results: [] });
      http.expectOne(`${base}/search/movie`).flush({ results: [] });

      expect(result!.results.map((m) => m.title)).toEqual(['The Dark Knight', 'Dark Waters']);
    });

    it('matches Hindi and alternative titles in the mock catalogue', () => {
      let result: MovieResponse | undefined;
      service.searchMovies('शोले').subscribe((r) => (result = r));

      for (const path of ['hero', 'popular', 'upcoming', 'now_playing']) {
        http.expectOne(`${base}/movie/${path}`).flush({ results: [] });
      }
      http.expectOne(`${base}/search/movie`).flush({
        results: [movie(5, 'Sholay', { original_title: 'शोले' }), movie(6, 'Deewaar')]
      });

      expect(result!.results.map((m) => m.title)).toEqual(['Sholay']);
    });

    it('loads the mock catalogue only once across searches', () => {
      service.searchMovies('a').subscribe();
      for (const path of ['hero', 'popular', 'upcoming', 'now_playing']) {
        http.expectOne(`${base}/movie/${path}`).flush({ results: [] });
      }
      http.expectOne(`${base}/search/movie`).flush({ results: [] });
      let result: MovieResponse | undefined;
      service.searchMovies('b').subscribe((r) => (result = r));
      http.expectNone(() => true);
      expect(result).toEqual({ results: [] });
    });
  });

  describe('in TMDB mode', () => {
    const base = 'https://api.themoviedb.org/3';
    useEnvironment('tmdb');
    beforeEach(setUp);

    const flushGenres = () =>
      http.expectOne((r) => r.url === `${base}/genre/movie/list`).flush({
        genres: [
          { id: 28, name: 'Action' },
          { id: 18, name: 'Drama' }
        ]
      });

    it('sends the api_key and turns genre ids into names', () => {
      let result: MovieResponse | undefined;
      service.getPopular().subscribe((r) => (result = r));

      const req = http.expectOne((r) => r.url === `${base}/movie/popular`);
      expect(req.request.params.get('api_key')).toBe('test-key');
      req.flush({ results: [{ ...movie(1, 'Heat'), genre_ids: [28, 18, 999] }] });
      flushGenres();

      const [heat] = result!.results;
      expect(heat.genres).toEqual([
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drama' }
      ]);
      expect('genre_ids' in heat).toBeFalse();
    });

    it('fetches genres only once for several lists', () => {
      service.getPopular().subscribe();
      http.expectOne((r) => r.url === `${base}/movie/popular`).flush({ results: [] });
      flushGenres();

      let result: MovieResponse | undefined;
      service.getUpcoming().subscribe((r) => (result = r));
      http.expectOne((r) => r.url === `${base}/movie/upcoming`).flush({ results: [{ ...movie(2, 'Up'), genre_ids: [18] }] });
      http.expectNone((r) => r.url === `${base}/genre/movie/list`);
      expect(result!.results[0].genres).toEqual([{ id: 18, name: 'Drama' }]);
    });

    it('builds the hero from trending movies that have a backdrop and overview, capped at six', () => {
      let result: MovieResponse | undefined;
      service.getHeroMovies().subscribe((r) => (result = r));

      const trending = [
        movie(1, 'No backdrop', { backdrop_path: '' }),
        movie(2, 'No overview', { overview: '' }),
        ...Array.from({ length: 8 }, (_, i) => movie(10 + i, `Hit ${i}`))
      ];
      http.expectOne((r) => r.url === `${base}/trending/movie/week`).flush({ results: trending });
      flushGenres();

      expect(result!.results.map((m) => m.id)).toEqual([10, 11, 12, 13, 14, 15]);
    });

    it('asks for credits with the details and keeps the top 12 cast members', () => {
      let result: any;
      service.getMovieById(7).subscribe((r) => (result = r));

      const req = http.expectOne((r) => r.url === `${base}/movie/7`);
      expect(req.request.params.get('append_to_response')).toBe('credits');
      expect(req.request.params.get('api_key')).toBe('test-key');
      const cast = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Actor ${i}`, character: '', profile_path: '' }));
      req.flush({ ...movie(7, 'Se7en'), genres: [], credits: { cast } });

      expect(result.cast.length).toBe(12);
      expect(result.cast[0].name).toBe('Actor 0');
      expect(result.credits).toBeUndefined();
    });

    it('returns an empty cast when TMDB sends no credits', () => {
      let result: any;
      service.getMovieById(8).subscribe((r) => (result = r));
      http.expectOne((r) => r.url === `${base}/movie/8`).flush({ ...movie(8, 'Solo'), genres: [] });
      expect(result.cast).toEqual([]);
    });

    it('searches TMDB in English first, then Hindi, without duplicates', () => {
      let result: MovieResponse | undefined;
      service.searchMovies('matrix').subscribe((r) => (result = r));

      const reqs = http.match((r) => r.url === `${base}/search/movie`);
      expect(reqs.map((r) => r.request.params.get('language'))).toEqual(['en-US', 'hi-IN']);
      expect(reqs[0].request.params.get('query')).toBe('matrix');
      expect(reqs[0].request.params.get('api_key')).toBe('test-key');
      reqs[0].flush({ results: [{ ...movie(603, 'The Matrix'), genre_ids: [28] }] });
      flushGenres();
      reqs[1].flush({ results: [{ ...movie(603, 'द मैट्रिक्स'), genre_ids: [28] }, { ...movie(604, 'Reloaded'), genre_ids: [] }] });

      expect(result!.results.map((m) => m.title)).toEqual(['The Matrix', 'Reloaded']);
      expect(result!.results[0].genres).toEqual([{ id: 28, name: 'Action' }]);
    });

    it('asks TMDB in Hindi first when the query is in Devanagari', () => {
      service.searchMovies('शोले').subscribe();
      const reqs = http.match((r) => r.url === `${base}/search/movie`);
      expect(reqs.map((r) => r.request.params.get('language'))).toEqual(['hi-IN', 'en-US']);
      reqs.forEach((r) => r.flush({ results: [] }));
      http.match((r) => r.url === `${base}/genre/movie/list`).forEach((r) => r.flush({ genres: [] }));
    });
  });

  describe('image URLs', () => {
    useEnvironment('tmdb');
    beforeEach(setUp);

    it('prefixes TMDB paths and leaves absolute URLs alone', () => {
      expect(service.getPosterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
      expect(service.getBackdropUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/original/abc.jpg');
      expect(service.getPosterUrl('https://picsum.photos/1')).toBe('https://picsum.photos/1');
      expect(service.getBackdropUrl('https://picsum.photos/1')).toBe('https://picsum.photos/1');
    });

    it('returns an empty string for a missing path', () => {
      expect(service.getPosterUrl('')).toBe('');
      expect(service.getBackdropUrl('')).toBe('');
    });
  });
});
