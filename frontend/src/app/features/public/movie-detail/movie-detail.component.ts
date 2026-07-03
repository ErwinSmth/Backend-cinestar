import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService, MovieDetailResponse } from '../../../core/services/movie.service';
import { ShowtimeService, FuncionResponse } from '../../../core/services/showtime.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);
  private sanitizer = inject(DomSanitizer);
  private location = inject(Location);

  movie = signal<MovieDetailResponse | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Trailer
  trailerUrl = signal<SafeResourceUrl | null>(null);
  isTrailerOpen = signal<boolean>(false);

  // Expanded details
  showMoreDetails = signal<boolean>(false);

  // Age Restriction dictionary
  private ageRestrictionDict: Record<string, string> = {
    'APT': 'Apto para todo público',
    '7+': 'Mayores de 7 años',
    '12+': 'Mayores de 12 años',
    '14+': 'Mayores de 14 años',
    '16+': 'Mayores de 16 años',
    '18+': 'Mayores de 18 años / Apto para público adulto'
  };

  formattedAgeRestriction = computed(() => {
    const code = this.movie()?.restriccion_edad || '';
    return this.ageRestrictionDict[code] || code;
  });

  // Showtimes state
  weekDays = signal<{ date: Date; isoDate: string; label: string; hasShowtimes: boolean }[]>([]);
  showtimesMap = signal<Map<string, FuncionResponse[]>>(new Map());
  selectedDate = signal<string>('');
  isLoadingShowtimes = signal<boolean>(true);

  availableFunctions = computed(() => {
    return this.showtimesMap().get(this.selectedDate()) || [];
  });

  hasAnyShowtime = computed(() => {
    return this.weekDays().some(d => d.hasShowtimes);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovie(parseInt(id, 10));
      }
    });
  }

  private loadMovie(id: number) {
    this.isLoading.set(true);
    this.movieService.getMovieById(id).subscribe({
      next: (data) => {
        this.movie.set(data);
        this.isLoading.set(false);
        this.loadShowtimes(id);
      },
      error: (err) => {
        console.error('Error fetching movie details:', err);
        this.error.set('No se pudo cargar la película.');
        this.isLoading.set(false);
      }
    });
  }

  private loadShowtimes(movieId: number) {
    this.isLoadingShowtimes.set(true);
    const today = new Date();
    const days: { date: Date; isoDate: string; label: string; hasShowtimes: boolean }[] = [];
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      let label = i === 0 ? 'Hoy ' + dayNames[d.getDay()] : dayNames[d.getDay()] + ' ' + d.getDate();
      days.push({ date: d, isoDate, label, hasShowtimes: false });
    }

    this.showtimeService.getShowtimesForNext7Days().subscribe({
      next: (results) => {
        const map = new Map<string, FuncionResponse[]>();
        let firstAvailableDate = '';

        results.forEach((funciones, index) => {
          const isoDate = days[index].isoDate;
          const movieFunciones = funciones.filter(f => f.movieId === movieId);
          map.set(isoDate, movieFunciones);
          
          if (movieFunciones.length > 0) {
            days[index].hasShowtimes = true;
            if (!firstAvailableDate) {
              firstAvailableDate = isoDate;
            }
          }
        });

        this.showtimesMap.set(map);
        this.weekDays.set(days);
        this.selectedDate.set(firstAvailableDate || days[0].isoDate);
        this.isLoadingShowtimes.set(false);
      },
      error: (err) => {
        console.error('Error loading showtimes', err);
        this.weekDays.set(days);
        this.selectedDate.set(days[0].isoDate);
        this.isLoadingShowtimes.set(false);
      }
    });
  }

  selectDate(isoDate: string) {
    this.selectedDate.set(isoDate);
  }

  goToBooking(funcionId: number) {
    this.router.navigate(['/booking/seat-map'], { queryParams: { funcionId: funcionId }});
  }

  goBack() {
    this.location.back();
  }

  toggleMoreDetails() {
    this.showMoreDetails.update(v => !v);
  }

  scrollToFunctions() {
    const el = document.getElementById('funciones-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatDuration(mins: number | undefined): string {
    if (!mins) return 'N/A';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  openTrailer() {
    const movieData = this.movie();
    if (!movieData?.trailers?.length) return;
    const url = movieData.trailers[0];
    const videoId = this.extractYoutubeId(url);
    if (!videoId) return;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    this.trailerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    this.isTrailerOpen.set(true);
  }

  closeTrailer() {
    this.isTrailerOpen.set(false);
    setTimeout(() => this.trailerUrl.set(null), 300);
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}
