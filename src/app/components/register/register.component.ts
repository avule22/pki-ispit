import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { UserProfile } from '../../interfaces/user.interface';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class RegisterComponent {
  user: UserProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    favoriteGenres: [],
    password: ''
  };
  favoriteGenresInput = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) { }

  register(): void {
    this.user.favoriteGenres = this.favoriteGenresInput.split(',').map(g => g.trim()).filter(g => g.length > 0);

    this.authService.register(this.user).subscribe({
      next: success => {
        if (success) {
          this.cartService.clearCart();
          Swal.fire({
            icon: 'success',
            title: 'Uspešno!',
            text: 'Registracija uspešna! Možete se prijaviti.',
            timer: 3000,
            showConfirmButton: false
          });
          this.router.navigate(['/login']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Korisnik sa ovim emailom već postoji.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: error => {
        Swal.fire({
          icon: 'error',
          title: 'Greška!',
          text: 'Došlo je do greške prilikom registracije.',
          timer: 3000,
          showConfirmButton: false
        });
        console.error(error);
      }
    });
  }
}
