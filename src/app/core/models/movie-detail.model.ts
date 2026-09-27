import { Genre, Movie } from './movie.model';
import { CastMember } from './cast-member.model';

export type { Genre };

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime?: number;
  cast: CastMember[];
}
