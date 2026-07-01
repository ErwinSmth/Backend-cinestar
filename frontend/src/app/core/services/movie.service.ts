import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { tap, finalize, catchError, map } from 'rxjs/operators';

export interface MovieCarteleraResponse {
  id: number;
  titulo: string;
  poster_path: string;
  backdrop_path?: string;
  estado: string;
  restriccion_edad: string;
  fecha_estreno?: string;
  trailers?: string[];
  hasActivePresale?: boolean;
  hasActiveShowtimes?: boolean;
}

export interface TmdbMovie {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
}

export interface MovieDetailResponse {
  id: number;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  fecha_estreno?: string;
  estado: string;
  restriccion_edad: string;
  poster_path: string;
  backdrop_path?: string;
  director?: string;
  actores?: string[];
  generos?: string[];
  trailers?: string[];
  hasActivePresale?: boolean;
  hasActiveShowtimes?: boolean;
}

export interface Movie {
  id: number;
  tmdbId: number;
  titulo: string;
  sinopsis: string;
  duracionMin: number;
  estado: string;
  restriccionEdad: { codigo: string; descripcion: string };
  metadata: {
    posterPath?: string;
    backdropPath?: string;
    trailers?: string[];
  };
}

export interface UpdateMovieRequest {
  titulo: string;
  sinopsis: string;
  estado: string;
  restriccionEdadId?: number;
  restriccionCodigo?: string; // Por practicidad lo manejaremos por codigo en el front
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_URL = 'http://localhost:8080/api/v1/movies';

  cartelera = signal<MovieCarteleraResponse[]>([]);
  preEstrenos = signal<MovieCarteleraResponse[]>([]);
  isLoadingCartelera = signal<boolean>(false);
  isLoadingPreEstrenos = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  fetchCartelera(): Observable<MovieCarteleraResponse[]> {
    this.isLoadingCartelera.set(true);
    return this.http.get<MovieCarteleraResponse[]>(this.API_URL).pipe(
      tap((movies) => this.cartelera.set(movies)),
      catchError((err) => {
        console.error('Error fetching cartelera:', err);
        return EMPTY;
      }),
      finalize(() => this.isLoadingCartelera.set(false))
    );
  }

  fetchPreEstrenos(): Observable<MovieCarteleraResponse[]> {
    this.isLoadingPreEstrenos.set(true);
    return this.http.get<MovieCarteleraResponse[]>(`${this.API_URL}/pre-estreno`).pipe(
      tap((movies) => this.preEstrenos.set(movies)),
      catchError((err) => {
        console.error('Error fetching pre-estrenos:', err);
        return EMPTY;
      }),
      finalize(() => this.isLoadingPreEstrenos.set(false))
    );
  }

  // --- ADMINISTRADOR ---

  getAdminMovies(status?: string, search?: string): Observable<Movie[]> {
    let url = `${this.API_URL}/admin?`;
    if (status) url += `status=${status}&`;
    if (search) url += `search=${search}`;
    return this.http.get<Movie[]>(url);
  }

  searchTmdbMovies(query: string): Observable<TmdbMovie[]> {
    return this.http.get<any>(`${this.API_URL}/tmdb/search?query=${query}`).pipe(
      map(res => res.results || [])
    );
  }

  importMovie(tmdbId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/tmdb/import/${tmdbId}`, {});
  }

  updateMovie(id: number, data: UpdateMovieRequest): Observable<Movie> {
    const backendPayload = {
      title: data.titulo,
      overview: data.sinopsis,
      status: data.estado,
      ageRating: data.restriccionCodigo
    };
    return this.http.put<Movie>(`${this.API_URL}/${id}`, backendPayload);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getMovieById(id: number): Observable<MovieDetailResponse> {
    return this.http.get<MovieDetailResponse>(`${this.API_URL}/${id}`);
  }
}
