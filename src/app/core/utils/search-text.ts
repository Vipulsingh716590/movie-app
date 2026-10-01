import { Movie } from '../models/movie.model';

const DEVANAGARI = /[ऀ-ॿ]/;

/** True when the text contains Hindi (Devanagari) letters. */
export const hasDevanagari = (text: string): boolean => DEVANAGARI.test(text);

/**
 * Folds text so the same word typed different ways still matches: case, accents (é -> e), punctuation,
 * and the common Devanagari spelling variants (इंसेप्शन vs इन्सेप्शन, nukta ज़ vs ज).
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/़/g, '') // nukta
    .replace(/[ँं]/g, 'न') // chandrabindu / anusvara -> न
    .replace(/्/g, '') // halant (half letters)
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ')
    .trim();
}

/** Matches a query against a movie's title, original title (e.g. शोले) and alternative titles. */
export function movieMatches(movie: Movie, query: string): boolean {
  const needle = normalizeForSearch(query);
  if (!needle) return false;
  return [movie.title, movie.original_title, ...(movie.alternative_titles ?? [])].some(
    (name) => !!name && normalizeForSearch(name).includes(needle)
  );
}
