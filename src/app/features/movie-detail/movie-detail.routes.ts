import { Routes } from '@angular/router';
import { MovieDetailComponent } from './movie-detail.component';
import { movieDetailResolver } from './movie-detail.resolver';

export const MOVIE_DETAIL_ROUTES: Routes = [
  {
    path: '',
    component: MovieDetailComponent,
    resolve: { movie: movieDetailResolver }
  }
];

export default MOVIE_DETAIL_ROUTES;
