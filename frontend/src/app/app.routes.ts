import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/public/home/home';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { AdminMovies } from './features/admin/movies/admin-movies';
import { AdminShowtimesComponent } from './features/admin/showtimes/showtimes.component';
import { TaquillaDashboard } from './features/taquilla/dashboard/taquilla-dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { taquillaGuard } from './core/guards/taquilla.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'admin', 
    component: Dashboard, 
    canActivate: [adminGuard],
    children: [
      { path: 'peliculas', component: AdminMovies },
      { path: 'showtimes', component: AdminShowtimesComponent }
    ]
  },
  { path: 'taquilla', component: TaquillaDashboard, canActivate: [taquillaGuard] },
  { 
    path: 'booking/seat-map', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/public/booking/seat-map/seat-map.component').then(m => m.SeatMapComponent) 
  },
  { 
    path: 'booking/checkout', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/public/booking/checkout/checkout.component').then(m => m.CheckoutComponent) 
  },
  { 
    path: 'movies/:id', 
    loadComponent: () => import('./features/public/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent) 
  },
  { path: '**', redirectTo: '' }
];
