import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeatService } from '../../../../core/services/seat.service';
import { SeatResponse } from '../../../../core/models/seat.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  funcionId!: number;
  selectedSeats: SeatResponse[] = [];
  
  // Timer state
  timeLeft: number = 300; // 5 minutes in seconds
  timerDisplay: string = '05:00';
  private timerInterval: any;
  private isPaid: boolean = false;

  constructor(
    private router: Router,
    private seatService: SeatService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedSeats = navigation.extras.state['selectedSeats'] || [];
      this.funcionId = navigation.extras.state['funcionId'];
    }
  }

  ngOnInit(): void {
    if (this.selectedSeats.length === 0) {
      this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: this.funcionId || 1 }});
      return;
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
    // Navigating away will trigger ngOnDestroy which calls unlockSeats
    this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: this.funcionId }});
  }

  cancelAndReturn(): void {
    // Navigating away triggers ngOnDestroy -> unlockSeats
    this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: this.funcionId }});
  }

  unlockSeats(): void {
    const unlockRequests = this.selectedSeats.map(seat => 
      this.seatService.unlockSeat({ ticketId: seat.ticketId }).toPromise()
    );
    // Best effort background release
    Promise.all(unlockRequests).catch(err => console.error('Error unlocking', err));
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
