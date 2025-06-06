import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, combineLatest, of} from 'rxjs';
import { MovieProjection, ReservationCartItem } from '../interfaces/movie.interface';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<ReservationCartItem[]> = new BehaviorSubject<ReservationCartItem[]>([]);
  public cartItems: Observable<ReservationCartItem[]> = this.cartItemsSubject.asObservable();

  constructor(private authService: AuthService) {

    this.authService.currentUser.subscribe(user => {
      if (user) {
        const storedCart = localStorage.getItem(`cart_${user.id}`);
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);

            if (JSON.stringify(this.cartItemsSubject.getValue()) !== storedCart) {
              this.cartItemsSubject.next(parsedCart);
            }
          } catch (e) {
            console.error('Greška pri parsiranju korpe iz localStorage-a:', e);
            this.cartItemsSubject.next([]);
          }
        } else {
          this.cartItemsSubject.next([]);
        }
      } else {

        this.cartItemsSubject.next([]);
      }
    });


    this.cartItems.subscribe(items => {
      const user = this.authService.getCurrentUserValue();
      if (user) {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
      }
    });
  }


  addMovieToCart(projection: MovieProjection, quantity: number): Observable<boolean> {
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      console.error('Korisnik mora biti prijavljen da bi dodao film u korpu.');
      return of(false);
    }

    const currentItems = this.cartItemsSubject.getValue();

    const existingItemIndex = currentItems.findIndex(item => item.projection.id === projection.id && item.status === 'rezervisano');

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this.cartItemsSubject.next(updatedItems);
    } else {
      const newItem: ReservationCartItem = {
        id: crypto.randomUUID(),
        projection: { ...projection },
        quantity: quantity,
        reservedAt: new Date().toISOString(),
        status: 'rezervisano',
        userRating: undefined
      };
      this.cartItemsSubject.next([...currentItems, newItem]);
    }
    console.log(`Dodato ${quantity} karata za film "${projection.title}" u korpu.`);
    return of(true);
  }


  deleteItemFromCart(itemId: string): Observable<boolean> {
    const currentItems = this.cartItemsSubject.getValue();
    const updatedItems = currentItems.filter(item => item.id !== itemId);

    if (updatedItems.length < currentItems.length) {
      this.cartItemsSubject.next(updatedItems);
      console.log(`Stavka sa ID-jem ${itemId} obrisana iz korpe.`);
      return of(true);
    }
    console.error(`Stavka sa ID-jem ${itemId} nije pronađena u korpi za brisanje.`);
    return of(false);
  }


  modifyCartItem(itemId: string, newQuantity?: number, newStatus?: 'rezervisano' | 'gledano' | 'otkazano', userRating?: number): Observable<boolean> {
    const currentItems = this.cartItemsSubject.getValue();
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      const itemToUpdate = { ...currentItems[itemIndex] };

      if (newQuantity !== undefined) {
        if (itemToUpdate.status === 'rezervisano') {
          itemToUpdate.quantity = newQuantity;
        } else {
          console.warn('Nije moguće modifikovati količinu za stavku koja nije "rezervisano".');
          //
          //
        }
      }

      if (newStatus !== undefined) {

        if (newStatus === 'gledano' && itemToUpdate.status === 'rezervisano') {
          itemToUpdate.status = newStatus;
        } else if (newStatus === 'otkazano' && itemToUpdate.status === 'rezervisano') {
          itemToUpdate.status = newStatus;
        } else if (newStatus === 'rezervisano' && itemToUpdate.status === 'otkazano') {
          itemToUpdate.status = newStatus;
        } else {
          console.warn(`Nije dozvoljena promena statusa iz "${itemToUpdate.status}" u "${newStatus}".`);
          //
        }
      }

      if (userRating !== undefined) {

        itemToUpdate.userRating = userRating;
      }

      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = itemToUpdate;
      this.cartItemsSubject.next(updatedItems);
      console.log(`Stavka sa ID-jem ${itemId} modifikovana u korpi.`);
      return of(true);
    }
    console.error(`Stavka sa ID-jem ${itemId} nije pronađena u korpi za modifikaciju.`);
    return of(false);
  }


  getTotalPrice(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.reduce((total, item) => total + (item.projection.ticketPrice * item.quantity), 0))
    );
  }


  clearCart(): void {
    this.cartItemsSubject.next([]);
    console.log('Korpa je ispražnjena.');
  }
}
