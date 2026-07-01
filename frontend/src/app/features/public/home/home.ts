import { Component, computed, inject, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { MovieService, MovieCarteleraResponse } from '../../../core/services/movie.service';
import { ShowtimeService, FuncionResponse } from '../../../core/services/showtime.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private movieService = inject(MovieService);
  private showtimeService = inject(ShowtimeService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  cartelera = this.movieService.cartelera;
  preEstrenos = this.movieService.preEstrenos;
  isLoadingCartelera = this.movieService.isLoadingCartelera;
  isLoadingPreEstrenos = this.movieService.isLoadingPreEstrenos;

  isAdmin = computed(() => this.authService.currentUserRoles().includes('ROLE_ADMINISTRADOR'));

  // Search state
  isSearchOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  
  allActiveMovies = computed(() => {
    return [...this.cartelera(), ...this.preEstrenos()];
  });

  filteredSearchMovies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    return this.allActiveMovies().filter(m => m.titulo.toLowerCase().includes(query));
  });

  // Hero Banner state
  heroIndex = signal<number>(0);
  private heroTimer: any;

  // Hero movies: combina cartelera + preEstrenos ordenados por fecha_estreno descendente, toma top 4
  heroMovies = computed<MovieCarteleraResponse[]>(() => {
    const all = [...this.cartelera(), ...this.preEstrenos()].filter(m => m.backdrop_path);
    return all
      .sort((a, b) => {
        const dA = a.fecha_estreno ? new Date(a.fecha_estreno).getTime() : 0;
        const dB = b.fecha_estreno ? new Date(b.fecha_estreno).getTime() : 0;
        return dB - dA;
      })
      .slice(0, 4);
  });

  currentHeroMovie = computed<MovieCarteleraResponse | null>(() => {
    const movies = this.heroMovies();
    if (!movies.length) return null;
    return movies[this.heroIndex() % movies.length];
  });

  // Trailer modal state
  trailerUrl = signal<SafeResourceUrl | null>(null);
  isModalOpen = signal<boolean>(false);

  // Computed state for Featured Trailers (prioritize pre-estrenos, then cartelera)
  featuredTrailers = computed(() => {
    const pre = this.preEstrenos().filter(m => m.trailers && m.trailers.length > 0);
    const cart = this.cartelera().filter(m => m.trailers && m.trailers.length > 0);
    return [...pre, ...cart].slice(0, 10); // Show up to 10 trailers
  });

  // Quick Book state
  activeQuickBookTab = signal<'pelicula' | 'fecha' | 'hora' | null>(null);

  ngOnInit() {
    if (this.cartelera().length === 0) {
      this.movieService.fetchCartelera().subscribe({
        next: () => setTimeout(() => this.cdr.detectChanges(), 0),
        error: (err) => {
          console.error('Error fetching cartelera:', err);
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      });
    }
    if (this.preEstrenos().length === 0) {
      this.movieService.fetchPreEstrenos().subscribe({
        next: () => setTimeout(() => this.cdr.detectChanges(), 0),
        error: (err) => {
          console.error('Error fetching pre-estrenos:', err);
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      });
    }
    this.startHeroAutoPlay();
  }

  ngOnDestroy() {
    this.stopHeroAutoPlay();
  }

  private startHeroAutoPlay() {
    this.heroTimer = setInterval(() => {
      const total = this.heroMovies().length;
      if (total > 1) {
        this.heroIndex.update(i => (i + 1) % total);
      }
    }, 5000);
  }

  private stopHeroAutoPlay() {
    if (this.heroTimer) clearInterval(this.heroTimer);
  }

  goToHeroSlide(index: number) {
    this.heroIndex.set(index);
    this.stopHeroAutoPlay();
    this.startHeroAutoPlay();
  }

  nextHeroSlide() {
    const total = this.heroMovies().length;
    if (!total) return;
    this.heroIndex.update(i => (i + 1) % total);
    this.stopHeroAutoPlay();
    this.startHeroAutoPlay();
  }

  prevHeroSlide() {
    const total = this.heroMovies().length;
    if (!total) return;
    this.heroIndex.update(i => (i - 1 + total) % total);
    this.stopHeroAutoPlay();
    this.startHeroAutoPlay();
  }

  openTrailer(movie: MovieCarteleraResponse) {
    if (!movie.trailers?.length) return;
    const url = movie.trailers[0];
    // Convertir URL de YouTube a formato embed seguro
    const videoId = this.extractYoutubeId(url);
    if (!videoId) return;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    this.trailerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    this.isModalOpen.set(true);
  }

  closeTrailer() {
    this.isModalOpen.set(false);
    setTimeout(() => this.trailerUrl.set(null), 300);
  }

  getYoutubeThumbnail(url: string): string {
    if (!url) return '';
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    const videoId = match ? match[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  }

  toggleQuickBookTab(tab: 'pelicula' | 'fecha' | 'hora') {
    if (tab === 'fecha' && !this.selectedMovieForBook()) return;
    if (tab === 'hora' && !this.selectedDateForBook()) return;

    if (this.activeQuickBookTab() === tab) {
      this.activeQuickBookTab.set(null);
    } else {
      this.activeQuickBookTab.set(tab);
    }
  }

  closeQuickBook() {
    this.activeQuickBookTab.set(null);
  }

  private extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  logout() {
    this.authService.logout();
  }

  // Search handlers
  openSearch() {
    this.isSearchOpen.set(true);
    // document.body.style.overflow = 'hidden'; // Optional: disable scrolling
  }

  closeSearch() {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    // document.body.style.overflow = '';
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // --- QUICK BOOK LOGIC ---
  selectedMovieForBook = signal<MovieCarteleraResponse | null>(null);
  selectedDateForBook = signal<string | null>(null);
  selectedFuncionForBook = signal<FuncionResponse | null>(null);
  
  availableDates = signal<{isoDate: string; label: string}[]>([]);
  availableFunciones = signal<FuncionResponse[]>([]);
  allShowtimesMap = signal<Map<string, FuncionResponse[]>>(new Map());

  selectMovieForBook(movie: MovieCarteleraResponse) {
    this.selectedMovieForBook.set(movie);
    this.selectedDateForBook.set(null);
    this.selectedFuncionForBook.set(null);
    this.activeQuickBookTab.set(null);
    
    if (this.allShowtimesMap().size === 0) {
      this.loadAllShowtimes();
    } else {
      this.updateAvailableDates(movie.id);
    }
  }

  private loadAllShowtimes() {
    this.showtimeService.getShowtimesForNext7Days().subscribe({
      next: (results) => {
        const today = new Date();
        const map = new Map<string, FuncionResponse[]>();
        
        results.forEach((funciones, index) => {
          const d = new Date(today);
          d.setDate(today.getDate() + index);
          const isoDate = d.toISOString().split('T')[0];
          map.set(isoDate, funciones);
        });
        
        this.allShowtimesMap.set(map);
        const movieId = this.selectedMovieForBook()?.id;
        if (movieId) {
          this.updateAvailableDates(movieId);
        }
      }
    });
  }

  private updateAvailableDates(movieId: number) {
    const dates: {isoDate: string; label: string}[] = [];
    const map = this.allShowtimesMap();
    const today = new Date();
    
    Array.from(map.entries()).forEach(([isoDate, funciones]) => {
      const hasMovie = funciones.some(f => f.movieId === movieId);
      if (hasMovie) {
        const parts = isoDate.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dates.push({ isoDate, label: `${dayNames[dateObj.getDay()]} ${dateObj.getDate()}/${dateObj.getMonth()+1}` });
      }
    });
    this.availableDates.set(dates);
  }

  selectDateForBook(isoDate: string, label: string) {
    this.selectedDateForBook.set(label); // Store label for display
    this.selectedFuncionForBook.set(null);
    this.activeQuickBookTab.set(null);
    
    const movieId = this.selectedMovieForBook()?.id;
    if (movieId) {
      const funciones = this.allShowtimesMap().get(isoDate) || [];
      this.availableFunciones.set(funciones.filter(f => f.movieId === movieId));
    }
  }

  selectFuncionForBook(funcion: FuncionResponse) {
    this.selectedFuncionForBook.set(funcion);
    this.activeQuickBookTab.set(null);
  }

  goToBooking() {
    const fId = this.selectedFuncionForBook()?.id;
    if (fId) {
      this.router.navigate(['/booking', fId]);
    }
  }
}
