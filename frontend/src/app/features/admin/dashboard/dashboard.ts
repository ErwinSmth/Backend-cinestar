import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MovieService } from '../../../core/services/movie.service';
import { ShowtimeService } from '../../../core/services/showtime.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);

  // Computados
  carteleraCount = computed(() => this.movieService.cartelera().length);
  preEstrenosCount = computed(() => this.movieService.preEstrenos().length);

  // Señales de Funciones
  funcionesHoyCount = signal<number | null>(null);
  salasOperativasCount = signal<number | null>(null);

  // Computed para saber si estamos en la raíz del admin
  isDashboardHome = computed(() => this.router.url === '/admin');

  ngOnInit() {
    if (this.movieService.cartelera().length === 0) {
      this.movieService.fetchCartelera().subscribe();
    }
    if (this.movieService.preEstrenos().length === 0) {
      this.movieService.fetchPreEstrenos().subscribe();
    }

    this.loadShowtimeData();
  }

  loadShowtimeData() {
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    this.showtimeService.getShowtimesByDate(today).subscribe(funciones => {
      this.funcionesHoyCount.set(funciones.length);
    });

    this.showtimeService.getActiveSalas().subscribe(salas => {
      const activas = salas.filter(s => true).length; // Backend ya devuelve salas activas o todas (revisar), pero podemos hacer `.length`
      this.salasOperativasCount.set(salas.length);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
