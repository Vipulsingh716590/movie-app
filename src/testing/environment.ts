import { environment } from '../environments/environment';

type Env = typeof environment;

const MOCK: Partial<Env> = { useMock: true, apiBaseUrl: 'http://localhost:3000', tmdbApiKey: '' };
const TMDB: Partial<Env> = { useMock: false, apiBaseUrl: 'https://api.themoviedb.org/3', tmdbApiKey: 'test-key' };

/**
 * Switches the shared environment object to mock or TMDB mode for one spec and restores it afterwards.
 * Services read `environment` directly, so call this inside a describe, before the beforeEach that runs TestBed.inject().
 */
export function useEnvironment(mode: 'mock' | 'tmdb'): void {
  let saved: Env;
  beforeEach(() => {
    saved = { ...environment };
    Object.assign(environment, mode === 'mock' ? MOCK : TMDB);
  });
  afterEach(() => Object.assign(environment, saved));
}
