export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
  /** Title in the film's own language, e.g. "शोले" for Sholay (TMDB and mock data). */
  original_title?: string;
  original_language?: string;
  /** Other names people search for, e.g. Hindi spelling of an English title or romanised spellings (mock data). */
  alternative_titles?: string[];
  genres?: Genre[];
  /** YouTube video id of this movie's own trailer (mock data; TMDB mode looks it up per movie). */
  trailer_key?: string;
  /** Direct video file (mp4/webm) of the trailer: an https URL or a path under assets/videos. */
  trailer_url?: string;
}

export interface MovieResponse {
  results: Movie[];
}
