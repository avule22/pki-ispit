import { Routes } from '@angular/router';


import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { MovieSearchComponent } from './components/movie-search/movie-search.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';


import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [

  { path: '', redirectTo: '/movies', pathMatch: 'full' },


  { path: 'movies', component: MovieListComponent },


  { path: 'movie/:id', component: MovieDetailComponent },


  { path: 'search', component: MovieSearchComponent },


  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard]
  },


  { path: 'login', component: LoginComponent },


  { path: 'register', component: RegisterComponent },


  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: '/movies' }
];

export { routes };
