import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap, shareReplay, switchMap } from 'rxjs/operators';

import { MovieProjection, UserReview, ProjectionDate } from '../interfaces/movie.interface';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private API_KEY = '628f2040f063d7b0120c6a4a2146345d';
  private BASE_URL = 'https://api.themoviedb.org/3';


  private moviesEndpoint = `${this.BASE_URL}/movie/now_playing?api_key=${this.API_KEY}&language=sr-RS&page=1`;
  private genresEndpoint = `${this.BASE_URL}/genre/movie/list?api_key=${this.API_KEY}&language=sr-RS`;

  private moviesSubject = new BehaviorSubject<MovieProjection[]>([]);
  public readonly movies: Observable<MovieProjection[]> = this.moviesSubject.asObservable();

  private genreMap = new Map<number, string>();

  constructor(private http: HttpClient) {
    this.loadGenres().subscribe(() => {
      this.loadMovies();
    });
  }


  private transliterateCyrillicToLatin(text: string): string {
    if (!text) return '';
    const cyrillicMap: { [key: string]: string } = {
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Ђ': 'Đ', 'Е': 'E', 'Ж': 'Ž', 'З': 'Z', 'И': 'I',
      'Ј': 'J', 'К': 'K', 'Л': 'L', 'Љ': 'Lj', 'М': 'M', 'Н': 'N', 'Њ': 'Nj', 'О': 'O', 'П': 'P', 'Р': 'R',
      'С': 'S', 'Т': 'T', 'Ћ': 'Ć', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Č', 'Џ': 'Dž', 'Ш': 'Š',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'đ', 'е': 'e', 'ж': 'ž', 'з': 'z', 'и': 'i',
      'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj', 'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r',
      'с': 's', 'т': 't', 'ћ': 'ć', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č', 'џ': 'dž', 'ш': 'š'
    };
    return text.split('').map(char => cyrillicMap[char] || char).join('');
  }

  private loadGenres(): Observable<any> {
    return this.http.get<{ genres: { id: number, name: string }[] }>(this.genresEndpoint).pipe(
      tap(response => {
        response.genres.forEach(genre => this.genreMap.set(genre.id, this.transliterateCyrillicToLatin(genre.name)));

      }),
      catchError(error => {
        console.error('Greška pri učitavanju žanrova:', error);
        return of(null);
      })
    );
  }

  private loadMovies(): void {
    this.http.get<{ results: any[] }>(this.moviesEndpoint).pipe(
      map(response => response.results.map(tmdbMovie => this.mapTmdbMovieToMovieProjection(tmdbMovie))),
      tap(movies => console.log('Filmovi učitani iz TMDb API-ja (sr-RS, latinica):', movies)),
      catchError(error => {
        console.error('Greška pri učitavanju filmova sa TMDb API-ja:', error);
        return of([]);
      })
    ).subscribe(movies => {
      const populatedMovies = movies.map(movie => this.addSimulatedData(movie));
      this.moviesSubject.next(populatedMovies);
    });
  }


  private mapTmdbMovieToMovieProjection(tmdbMovie: any): MovieProjection {
    const genres = tmdbMovie.genre_ids ? tmdbMovie.genre_ids.map((id: number) => this.genreMap.get(id) || 'Nepoznat') : [];

    return {
      id: tmdbMovie.id.toString(),
      title: this.transliterateCyrillicToLatin(tmdbMovie.title),
      description: this.transliterateCyrillicToLatin(tmdbMovie.overview),
      genre: genres,
      duration: 0,
      director: 'N/A',
      actors: [],
      releaseDate: tmdbMovie.release_date,
      posterPath: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : 'https://placehold.co/500x750/cccccc/333333?text=Nema+postera', // VRAĆENO: tekst na srpski
      backdropPath: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` : '',
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      ticketPrice: this.generateRandomPrice(),
      projectionDates: this.generateRandomProjectionDates(),
      userReviews: []
    };
  }


  getMovieDetailsFromTmdb(tmdbMovieId: string): Observable<{ runtime: number, director: string, actors: string[] }> {
    const detailsUrl = `${this.BASE_URL}/movie/${tmdbMovieId}?api_key=${this.API_KEY}&language=sr-RS&append_to_response=credits`;
    return this.http.get<any>(detailsUrl).pipe(
      map(response => {
        const director = response.credits.crew.find((member: any) => member.job === 'Director');
        const actors = response.credits.cast.slice(0, 5).map((cast: any) => cast.name);
        return {
          runtime: response.runtime || 0,
          director: director ? this.transliterateCyrillicToLatin(director.name) : 'N/A',
          actors: actors.map((actor: string) => this.transliterateCyrillicToLatin(actor)) || []
        };
      }),
      catchError(error => {
        console.error('Greška pri učitavanju detalja filma sa TMDb API-ja:', error);
        return of({ runtime: 0, director: 'N/A', actors: [] });
      })
    );
  }

  private addSimulatedData(movie: MovieProjection): MovieProjection {
    return {
      ...movie,
      ticketPrice: this.generateRandomPrice(),
      projectionDates: this.generateRandomProjectionDates(),
      userReviews: []
    };
  }

  private generateRandomPrice(): number {
    return Math.floor(Math.random() * (800 - 500 + 1)) + 500;
  }

  private generateRandomProjectionDates(): ProjectionDate[] {
    const dates: ProjectionDate[] = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const times = ['18:00', '20:30', '22:00'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      dates.push({ date: dateString, times: times });
    }
    return dates;
  }

  getMovies(): Observable<MovieProjection[]> {
    return this.movies;
  }

  getMovieById(id: string): Observable<MovieProjection | undefined> {
    return this.movies.pipe(
      map(movies => movies.find(movie => movie.id === id)),
      switchMap(movie => {
        if (movie && (movie.duration === 0 || movie.director === 'N/A' || movie.actors.length === 0)) {
          return this.getMovieDetailsFromTmdb(movie.id).pipe(
            map(details => {
              const updatedMovie = {
                ...movie,
                duration: details.runtime || movie.duration,
                director: details.director || movie.director,
                actors: details.actors.length > 0 ? details.actors : movie.actors
              };
              const currentMovies = this.moviesSubject.getValue();
              const movieIndex = currentMovies.findIndex(m => m.id === updatedMovie.id);
              if (movieIndex > -1) {
                currentMovies[movieIndex] = updatedMovie;
                this.moviesSubject.next(currentMovies);
              }
              return updatedMovie;
            })
          );
        }
        return of(movie);
      })
    );
  }

  searchMovies(criteria: any): Observable<MovieProjection[]> {
    return this.movies.pipe(
      map(movies => {
        return movies.filter(movie => {
          let match = true;

          if (criteria.title && !movie.title.toLowerCase().includes(criteria.title.toLowerCase())) {
            match = false;
          }
          if (criteria.description && !movie.description.toLowerCase().includes(criteria.description.toLowerCase())) {
            match = false;
          }
          if (criteria.genre && !movie.genre.some(g => g.toLowerCase().includes(criteria.genre.toLowerCase()))) {
            match = false;
          }
          if (criteria.duration && movie.duration > criteria.duration) {
            match = false;
          }
          if (criteria.director && !movie.director.toLowerCase().includes(criteria.director.toLowerCase())) {
            match = false;
          }
          if (criteria.actors && !movie.actors.some(a => a.toLowerCase().includes(criteria.actors.toLowerCase()))) {
            match = false;
          }
          if (criteria.releaseDate) {
            const searchDate = new Date(criteria.releaseDate);
            const movieReleaseDate = new Date(movie.releaseDate);
            if (movieReleaseDate.toDateString() !== searchDate.toDateString()) {
              match = false;
            }
          }
          if (criteria.projectionDate || criteria.projectionTime) {
            let hasMatchingProjection = false;
            for (const pd of movie.projectionDates) {
              const projectionDate = new Date(pd.date);
              const searchProjectionDate = criteria.projectionDate ? new Date(criteria.projectionDate) : null;

              let dateMatch = !searchProjectionDate || projectionDate.toDateString() === searchProjectionDate.toDateString();
              let timeMatch = !criteria.projectionTime || pd.times.includes(criteria.projectionTime);

              if (dateMatch && timeMatch) {
                hasMatchingProjection = true;
                break;
              }
            }
            if (!hasMatchingProjection) {
              match = false;
            }
          }
          if (criteria.price && movie.ticketPrice > criteria.price) {
            match = false;
          }
          if (criteria.reviewKeyword && !movie.userReviews.some(review => review.comment.toLowerCase().includes(criteria.reviewKeyword.toLowerCase()))) {
            match = false;
          }

          return match;
        });
      })
    );
  }

  addReview(movieId: string, username: string, rating: number, comment: string): void {
    const currentMovies = this.moviesSubject.getValue();
    const movieIndex = currentMovies.findIndex(m => m.id === movieId);

    if (movieIndex > -1) {
      const updatedMovies = [...currentMovies];
      const movieToUpdate = { ...updatedMovies[movieIndex] };

      const newReview: UserReview = { username, rating, comment };
      movieToUpdate.userReviews = [...movieToUpdate.userReviews, newReview];

      updatedMovies[movieIndex] = movieToUpdate;
      this.moviesSubject.next(updatedMovies);
    }
  }
}
