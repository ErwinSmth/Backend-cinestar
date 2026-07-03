import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatService } from '../../../../core/services/seat.service';
import { SeatResponse } from '../../../../core/models/seat.model';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map.component.html',
  styleUrls: ['./seat-map.component.css']
})
export class SeatMapComponent implements OnInit {
  funcionId!: number;
  movieId: number | null = null;
  seats: SeatResponse[] = [];
  rows: string[] = [];
  seatsByRow: { [key: string]: SeatResponse[] } = {};
  selectedSeats: SeatResponse[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private seatService: SeatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('funcionId');
    const movieIdParam = this.route.snapshot.queryParamMap.get('movieId');
    if (movieIdParam) {
      this.movieId = +movieIdParam;
    }
    if (id) {
      this.funcionId = +id;
      this.loadSeats();
    } else {
      this.error = 'No se especificó la función';
    }
  }

  loadSeats(): void {
    this.seatService.getSeatsMap(this.funcionId).subscribe({
      next: (data) => {
        this.seats = data;
        this.groupSeats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar los asientos';
      }
    });
  }

  groupSeats(): void {
    this.seatsByRow = {};
    this.seats.forEach(seat => {
      if (!this.seatsByRow[seat.fila]) {
        this.seatsByRow[seat.fila] = [];
      }
      this.seatsByRow[seat.fila].push(seat);
    });
    
    // Sort rows alphabetically and seats by number
    this.rows = Object.keys(this.seatsByRow).sort();
    this.rows.forEach(row => {
      this.seatsByRow[row].sort((a, b) => a.numero - b.numero);
    });
  }

  toggleSeatSelection(seat: SeatResponse): void {
    if (seat.estado !== 'DISPONIBLE') return;

    const index = this.selectedSeats.findIndex(s => s.ticketId === seat.ticketId);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }

  isSelected(seat: SeatResponse): boolean {
    return this.selectedSeats.some(s => s.ticketId === seat.ticketId);
  }

  confirmSeats(): void {
    if (this.selectedSeats.length === 0) return;
    
    this.isLoading = true;
    
    // We iterate sequentially or use Promise.all to lock all selected seats.
    const usuarioId = this.authService.getUserId(); 
    
    if (!usuarioId) {
      alert('Error: No se pudo identificar al usuario.');
      this.isLoading = false;
      return;
    }
    
    const lockRequests = this.selectedSeats.map(seat => 
      this.seatService.lockSeat({ ticketId: seat.ticketId, usuarioId }).toPromise()
    );

    Promise.all(lockRequests).then(() => {
      this.isLoading = false;
      this.router.navigate(['/booking/checkout'], { 
        state: { 
          selectedSeats: this.selectedSeats,
          funcionId: this.funcionId
        } 
      });
    }).catch(err => {
      this.isLoading = false;
      if (err.status === 409) {
        alert('Uy, alguien fue más rápido. Algunos asientos ya no están disponibles.');
      } else {
        alert('Ocurrió un error al reservar los asientos.');
      }
      // Clear selection and reload map
      this.selectedSeats = [];
      this.loadSeats();
    });
  }

  goBack(): void {
    if (this.movieId) {
      this.router.navigate(['/movies', this.movieId]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
