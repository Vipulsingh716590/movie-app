/**
 * Paste your free TMDB API key (themoviedb.org -> Settings -> API) here to switch the whole app from the
 * local mock API to real TMDB data: real posters, search, and every movie's own trailer.
 * Leave it empty to keep using the mock API (json-server on port 3000).
 */
const tmdbApiKey = '';

export const environment = {
  production: false,
  useMock: !tmdbApiKey,
  apiBaseUrl: tmdbApiKey ? 'https://api.themoviedb.org/3' : 'http://localhost:3000',
  imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  backdropBaseUrl: 'https://image.tmdb.org/t/p/original',
  tmdbApiKey
};
