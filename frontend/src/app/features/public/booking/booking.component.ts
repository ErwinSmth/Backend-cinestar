import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking.component.html'
})
export class BookingComponent {
  private route = inject(ActivatedRoute);
  
  funcionId = this.route.snapshot.paramMap.get('funcionId');
}
