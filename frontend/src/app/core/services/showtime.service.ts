import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
export interface SalaResponse {
  id: number;
  nombre: string;
  capacidad: number;
}

export interface ProyeccionResponse {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface FuncionResponse {
  id: number;
  movieId: number;
  sala: SalaResponse;
  proyeccion: ProyeccionResponse;
  fechaInicio: string;
  fechaFin: string;
  precioTicket: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/showtimes';

  /**
   * Obtiene todas las funciones disponibles en una fecha determinada.
   * @param fecha Formato YYYY-MM-DD
   */
  getShowtimesByDate(fecha: string): Observable<FuncionResponse[]> {
    return this.http.get<FuncionResponse[]>(`${this.apiUrl}?fecha=${fecha}`).pipe(
      catchError(err => {
        console.error(`Error fetching showtimes for date ${fecha}`, err);
        return of([]); // Fallback to empty array on error
      })
    );
  }

  /**
   * Obtiene las funciones de los próximos 7 días haciendo peticiones en paralelo.
   * Gracias al @Cacheable en el backend, esto es muy rápido.
   */
  getShowtimesForNext7Days(): Observable<FuncionResponse[][]> {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
      dates.push(isoDate);
    }

    const requests = dates.map(date => this.getShowtimesByDate(date));
    
    // forkJoin ejecuta todas las peticiones en paralelo y devuelve un solo observable con el array de resultados
    return forkJoin(requests);
  }
}
