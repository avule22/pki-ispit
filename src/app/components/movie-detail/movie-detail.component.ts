import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MovieProjection } from '../../interfaces/movie.interface';
import { MovieService } from '../../services/movie.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { RatingComponent } from '../rating/rating.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RatingComponent
  ]
})
export class MovieDetailComponent implements OnInit {
  movie: Observable<MovieProjection | undefined> | undefined;
  quantity: number = 1;
  isLoggedIn: Observable<boolean> | undefined;

  newReviewRating: number = 0;
  newReviewComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.movie = this.route.paramMap.pipe(
      switchMap(params => {
        const movieId = params.get('id');
        if (movieId) {
          return this.movieService.getMovieById(movieId);
        } else {
          return of(undefined);
        }
      })
    );
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  addMovieToCart(movie: MovieProjection): void {
    if (this.quantity < 1) {
      this.snackBar.open('Broj karata mora biti najmanje 1.', 'Zatvori', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    this.cartService.addMovieToCart(movie, this.quantity).subscribe({
      next: success => {
        if (success) {
          Swal.fire({
            icon: 'success',
            title: 'Dodato u korpu!',
            text: `${movie.title} ${this.quantity} karata uspešno dodato u korpu.`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Nije moguće dodati film u korpu.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Greška!',
          text: 'Došlo je do greške prilikom dodavanja u korpu.',
          timer: 3000,
          showConfirmButton: false
        });
        console.error(err);
      }
    });
  }

  reserveMovie(movie: MovieProjection): void {
    this.authService.isLoggedIn().subscribe({
      next: loggedIn => {
        if (!loggedIn) {
          Swal.fire({
            icon: 'warning',
            title: 'Niste prijavljeni!',
            text: 'Morate biti prijavljeni da biste rezervisali karte.',
            timer: 3000,
            showConfirmButton: false
          });
          this.router.navigate(['/login']);
          return;
        }

        if (this.quantity < 1) {
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Broj karata mora biti najmanje 1.',
            timer: 3000,
            showConfirmButton: false
          });
          return;
        }

        this.cartService.addMovieToCart(movie, this.quantity).subscribe({
          next: success => {
            if (success) {
              Swal.fire({
                icon: 'success',
                title: 'Uspešno!',
                text: `Uspešno ste rezervisali ${this.quantity} karte za film "${movie.title}"!`,
                timer: 3000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Greška!',
                text: 'Greška prilikom rezervacije. Pokušajte ponovo.',
                timer: 3000,
                showConfirmButton: false
              });
            }
          },
          error: error => {
            Swal.fire({
              icon: 'error',
              title: 'Greška!',
              text: 'Došlo je do greške prilikom rezervacije.',
              timer: 3000,
              showConfirmButton: false
            });
            console.error(error);
          }
        });
      }
    });
  }

  submitReview(movieId: string): void {
    this.authService.currentUser.subscribe({
      next: user => {
        if (!user) {
          Swal.fire({
            icon: 'warning',
            title: 'Niste prijavljeni!',
            text: 'Morate biti prijavljeni da biste ostavili recenziju.',
            timer: 3000,
            showConfirmButton: false
          });
          return;
        }

        if (this.newReviewRating === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Ocena potrebna!',
            text: 'Molimo Vas da ocenite film (1-5 zvezdica).',
            timer: 3000,
            showConfirmButton: false
          });
          return;
        }

        this.cartService.cartItems.subscribe({
          next: cartItems => {
            const watchedMovieInCart = cartItems.find(item =>
              item.projection.id === movieId && item.status === 'gledano'
            );

            if (!watchedMovieInCart) {
              Swal.fire({
                icon: 'warning',
                title: 'Nije gledano!',
                text: 'Možete ocenjivati samo filmove koje ste rezervisali i koji imaju status "gledano".',
                timer: 5000,
                showConfirmButton: false
              });
              return;
            }

            this.movieService.addReview(movieId, user.firstName + ' ' + user.lastName, this.newReviewRating, this.newReviewComment);
            this.cartService.modifyCartItem(movieId, undefined, 'gledano', this.newReviewRating);

            Swal.fire({
              icon: 'success',
              title: 'Uspešno!',
              text: 'Vaša recenzija je uspešno dodata!',
              timer: 3000,
              showConfirmButton: false
            });
            this.newReviewRating = 0;
            this.newReviewComment = '';
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }
}
