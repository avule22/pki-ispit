import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../interfaces/user.interface';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ProfileComponent implements OnInit {
  currentUser: Observable<UserProfile | null> | undefined;
  favoriteGenresInput: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.currentUser.subscribe({
      next: user => {
        if (user) {
          this.favoriteGenresInput = user.favoriteGenres.join(', ');
        }
      }
    });
  }

  updateProfile(): void {
    this.currentUser?.subscribe({
      next: user => {
        if (user) {
          const updatedUser: UserProfile = {
            ...user,
            favoriteGenres: this.favoriteGenresInput.split(',').map(g => g.trim()).filter(g => g.length > 0)
          };
          this.authService.updateProfile(updatedUser).subscribe({
            next: success => {
              if (success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Uspešno!',
                  text: 'Profil uspešno ažuriran!',
                  timer: 3000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Greška!',
                  text: 'Greška prilikom ažuriranja profila.',
                  timer: 3000,
                  showConfirmButton: false
                });
              }
            },
            error: error => {
              Swal.fire({
                icon: 'error',
                title: 'Greška!',
                text: 'Došlo je do greške prilikom ažuriranja profila.',
                timer: 3000,
                showConfirmButton: false
              });
              console.error(error);
            }
          });
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
