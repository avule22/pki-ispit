import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MovieProjection } from '../../interfaces/movie.interface';
import { MovieService } from '../../services/movie.service';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    RouterLink
  ]
})
export class MovieListComponent implements OnInit {
  movies$: Observable<MovieProjection[]> | undefined;

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movies$ = this.movieService.getMovies();
  }
}
