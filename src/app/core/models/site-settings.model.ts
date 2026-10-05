/** Display switches edited in the movie-dashboard app and read by this app (stored at /settings in the mock API). */
export interface SiteSettings {
  /** Master switch: false hides every rating badge. */
  showRatings: boolean;
  /** Movie ids whose rating is hidden even when showRatings is true. */
  hiddenRatingIds: number[];
  showHeroBanner: boolean;
  showPopular: boolean;
  showUpcoming: boolean;
  showLatest: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  showRatings: true,
  hiddenRatingIds: [],
  showHeroBanner: true,
  showPopular: true,
  showUpcoming: true,
  showLatest: true
};
