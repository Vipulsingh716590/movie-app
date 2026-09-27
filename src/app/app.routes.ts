import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent)
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes')
  },
  {
    path: 'movie/:id',
    loadChildren: () => import('./features/movie-detail/movie-detail.routes')
  },
  {
    path: '**',
    redirectTo: ''
  }
];
