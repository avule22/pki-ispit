export interface UserReview {
  username: string;
  rating: number;
  comment: string;
}

export interface ProjectionDate {
  date: string;
  times: string[];
}

export interface MovieProjection {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  director: string;
  actors: string[];
  releaseDate: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  voteCount: number;
  ticketPrice: number;
  projectionDates: ProjectionDate[];
  userReviews: UserReview[];
}

export interface ReservationCartItem {
  id: string;
  projection: MovieProjection;
  quantity: number;
  status: 'rezervisano' | 'gledano' | 'otkazano';
  reservedAt: string;
  userRating?: number;
}
