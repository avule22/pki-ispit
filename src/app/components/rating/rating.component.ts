import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class RatingComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false;
  @Input() showText: boolean = false;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();

  currentRating: number = 0;
  hoveredRating: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rating']) {
      this.currentRating = this.rating;
    }
  }

  setRating(value: number): void {
    this.currentRating = value;
    this.ratingChange.emit(this.currentRating);
  }

  hoverRating(value: number): void {
    this.hoveredRating = value;
    this.currentRating = value;
  }

  resetHover(): void {
    this.currentRating = this.rating;
    this.hoveredRating = 0;
  }
}
