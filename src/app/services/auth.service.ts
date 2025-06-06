import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserProfile } from '../interfaces/user.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: UserProfile[] = [];
  private currentUserSubject: BehaviorSubject<UserProfile | null> = new BehaviorSubject<UserProfile | null>(null);
  public currentUser: Observable<UserProfile | null> = this.currentUserSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }


  register(user: UserProfile): Observable<boolean> {
    if (this.users.some(u => u.email === user.email)) {
      console.error('Korisnik sa ovim emailom već postoji.');
      return of(false);
    }
    user.id = `user_${this.users.length + 1}`;
    this.users.push(user);
    console.log('Registrovan korisnik:', user);
    return of(true);
  }


  login(email: string, password: string): Observable<UserProfile | null> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Korisnik prijavljen:', user.email);
      return of(user);
    } else {
      console.error('Pogrešan email ili lozinka.');
      return of(null);
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    console.log('Korisnik odjavljen.');
  }


  isLoggedIn(): Observable<boolean> {
    return this.currentUser.pipe(map(user => !!user));
  }

  updateProfile(updatedProfile: UserProfile): Observable<boolean> {
    const index = this.users.findIndex(u => u.id === updatedProfile.id);
    if (index > -1) {
      this.users[index] = { ...this.users[index], ...updatedProfile };
      this.currentUserSubject.next({ ...this.users[index] });
      localStorage.setItem('currentUser', JSON.stringify(this.users[index]));
      console.log('Profil ažuriran:', this.users[index]);
      return of(true);
    }
    console.error('Korisnik nije pronađen za ažuriranje profila.');
    return of(false);
  }


  getCurrentUserValue(): UserProfile | null {
    return this.currentUserSubject.getValue();
  }
}
