import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeatService } from '../../../../core/services/seat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SeatResponse } from '../../../../core/models/seat.model';
import { MovieService, MovieDetailResponse } from '../../../../core/services/movie.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  funcionId!: number;
  movieId!: number;
  movieDetails?: MovieDetailResponse;
  selectedSeats: SeatResponse[] = [];
  
  // Timer state
  timeLeft: number = 300; // 5 minutes in seconds
  timerDisplay: string = '05:00';
  private timerInterval: any;
  private isPaid: boolean = false;

  constructor(
    private router: Router,
    private seatService: SeatService,
    private authService: AuthService,
    private movieService: MovieService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedSeats = navigation.extras.state['selectedSeats'] || [];
      this.funcionId = navigation.extras.state['funcionId'];
      this.movieId = navigation.extras.state['movieId'];
    }
  }

  ngOnInit(): void {
    if (this.selectedSeats.length === 0) {
      this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: this.funcionId || 1, movieId: this.movieId }});
      return;
    }
    
    if (this.movieId) {
      this.movieService.getMovieById(this.movieId).subscribe({
        next: (res) => this.movieDetails = res,
        error: (err) => console.error('Error fetching movie in checkout', err)
      });
    }

    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // If the component is destroyed (user navigated away) and they didn't pay, unlock seats
    if (!this.isPaid && this.timeLeft > 0) {
      this.unlockSeats();
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  handleTimeout(): void {
    alert('Tiempo expirado. Los asientos han sido liberados.');
    this.processUnlockAndNavigate();
  }

  cancelAndReturn(): void {
    this.processUnlockAndNavigate();
  }

  async processUnlockAndNavigate(): Promise<void> {
    await this.unlockSeats();
    this.isPaid = true; // Prevents ngOnDestroy from unlocking again
    this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: this.funcionId, movieId: this.movieId }});
  }

  async unlockSeats(): Promise<void> {
    try {
      const unlockRequests = this.selectedSeats.map(seat => 
        this.seatService.unlockSeat({ ticketId: seat.ticketId }).toPromise()
      );
      await Promise.all(unlockRequests);
    } catch (err) {
      console.error('Error unlocking', err);
    }
  }

  pay(): void {
    // To be implemented with Culqi
    alert('Simulando pago... Conectando con Culqi');
    // Emulate payment success (for now, just stop timer)
    this.isPaid = true;
    clearInterval(this.timerInterval);
    // Actually, in the real flow, the payment gateway redirects or confirms,
    // and backend handles RabbitMQ PaymentSuccessEvent.
  }
}
