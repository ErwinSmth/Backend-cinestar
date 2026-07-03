import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeatResponse, SeatLockRequest, SeatUnlockRequest } from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = 'http://localhost:8080/api/v1/seats';

  constructor(private http: HttpClient) {}

  getSeatsMap(funcionId: number): Observable<SeatResponse[]> {
    return this.http.get<SeatResponse[]>(`${this.apiUrl}?funcionId=${funcionId}`);
  }

  lockSeat(request: SeatLockRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/lock`, request);
  }

  unlockSeat(request: SeatUnlockRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/unlock`, request);
  }
}
