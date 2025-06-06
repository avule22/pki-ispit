import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) { }

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: user => {
        if (user) {
          this.cartService.clearCart();
          Swal.fire({
            icon: 'success',
            title: 'Uspešna prijava!',
            text: 'Dobrodošli nazad!',
            timer: 3000,
            showConfirmButton: false
          });
          this.router.navigate(['/movies']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Greška!',
            text: 'Pogrešan email ili lozinka.',
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      error: error => {
        Swal.fire({
          icon: 'error',
          title: 'Greška!',
          text: 'Došlo je do greške prilikom prijave.',
          timer: 3000,
          showConfirmButton: false
        });
        console.error(error);
      }
    });
  }
}
