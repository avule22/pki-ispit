import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ReservationCartItem } from '../../interfaces/movie.interface';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService } from '../../services/movie.service';
import { RatingComponent } from '../rating/rating.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';



import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RatingComponent
  ]
})
export class CartComponent implements OnInit {
  isLoggedIn: Observable<boolean> = of(false);
  cartItems: Observable<ReservationCartItem[]> | undefined;
  totalPrice: Observable<number> | undefined;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private movieService: MovieService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: (isLoggedIn: boolean) => {
        this.isLoggedIn = of(isLoggedIn);
      }
    });
    this.cartItems = this.cartService.cartItems;
    this.totalPrice = this.cartService.getTotalPrice();
  }


  deleteItem(itemId: string): void {
    Swal.fire({
      title: 'Da li ste sigurni?',
      text: "Ova stavka će biti trajno obrisana iz korpe!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Da, obriši!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.deleteItemFromCart(itemId).subscribe({
          next: success => {
            if (!success) {
              Swal.fire({
                icon: 'error',
                title: 'Greška!',
                text: 'Nije moguće obrisati stavku.',
                timer: 3000,
                showConfirmButton: false
              });
            } else {
              Swal.fire(
                'Obrisano!',
                'Stavka je uspešno obrisana.',
                'success'
              );
            }
          },
          error: err => {
            Swal.fire({
              icon: 'error',
              title: 'Greška!',
              text: 'Došlo je do greške prilikom brisanja stavke.',
              timer: 3000,
              showConfirmButton: false
            });
            console.error(err);
          }
        });
      }
    });
  }

  updateRating(itemId: string, newRating: number): void {

    this.authService.currentUser.pipe(take(1)).subscribe(user => {
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


      this.cartItems?.pipe(take(1)).subscribe(items => {
        const itemToRate = items.find(item => item.id === itemId);
        if (itemToRate) {

          this.cartService.modifyCartItem(itemId, undefined, undefined, newRating).subscribe({
            next: success => {
              if (success) {

                this.movieService.addReview(
                  itemToRate.projection.id,
                  user.firstName + ' ' + user.lastName,
                  newRating,
                  ''
                );
                Swal.fire({
                  icon: 'success',
                  title: 'Uspešno!',
                  text: 'Vaša ocena je uspešno dodata!',
                  timer: 2000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Greška!',
                  text: 'Nije moguće ažurirati ocenu.',
                  timer: 3000,
                  showConfirmButton: false
                });
              }
            },
            error: err => {
              Swal.fire({
                icon: 'error',
                title: 'Greška!',
                text: 'Došlo je do greške prilikom ažuriranja ocene.',
                timer: 3000,
                showConfirmButton: false
              });
              console.error(err);
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Stavka za ocenjivanje nije pronađena u korpi.',
            timer: 5000,
            showConfirmButton: false
          });
        }
      });
    });
  }


  purchaseItems(): void {
    Swal.fire({
      title: 'Potvrdi kupovinu?',
      text: "Ova akcija će obraditi vašu porudžbinu i isprazniti korpu.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Da, kupi!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.clearCart();
        Swal.fire(
          'Uspešna kupovina!',
          'Vaša porudžbina je uspešno obrađena!',
          'success'
        );
        this.router.navigate(['/movies']);
      }
    });
  }


  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
