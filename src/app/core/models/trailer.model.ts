/** A trailer the player can show: a direct video file, or a TMDB-provided hosted video. */
export type PlayableTrailer =
  | { kind: 'file'; url: string }
  | { kind: 'youtube'; key: string };

export const trailerId = (t: PlayableTrailer): string => (t.kind === 'file' ? t.url : t.key);
