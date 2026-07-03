import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShowtimeService, FuncionResponse, SalaResponse, ProyeccionResponse } from '../../../core/services/showtime.service';
import { MovieService, Movie } from '../../../core/services/movie.service';

@Component({
  selector: 'app-admin-showtimes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './showtimes.component.html'
})
export class AdminShowtimesComponent implements OnInit {
  private showtimeService = inject(ShowtimeService);
  private movieService = inject(MovieService);

  activeTab = signal<'FUNCIONES' | 'SALAS'>('FUNCIONES');
  
  // Data
  funciones = signal<FuncionResponse[]>([]);
  salas = signal<SalaResponse[]>([]);
  proyecciones = signal<ProyeccionResponse[]>([]);
  
  // Table Filters & Sorting
  filterStatus = signal<'TODAS' | 'ACTIVAS' | 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA'>('ACTIVAS');
  filterSala = signal<number | null>(null);
  filterFecha = signal<string>('');
  sortField = signal<'FECHA' | 'PRECIO' | 'SALA'>('FECHA');
  sortOrder = signal<'ASC' | 'DESC'>('ASC');

  filteredFunciones = computed(() => {
    let result = this.funciones();

    // 1. Filter by Status
    const status = this.filterStatus();
    if (status === 'ACTIVAS') {
      result = result.filter(f => f.status === 'PROGRAMADA' || f.status === 'EN_CURSO');
    } else if (status !== 'TODAS') {
      result = result.filter(f => f.status === status);
    }

    // 2. Filter by Sala
    const salaId = this.filterSala();
    if (salaId) {
      result = result.filter(f => f.sala.id === salaId);
    }

    // 3. Filter by Fecha
    const fecha = this.filterFecha();
    if (fecha) {
      result = result.filter(f => f.fechaInicio.startsWith(fecha));
    }

    // 4. Sort
    result = [...result].sort((a, b) => {
      const field = this.sortField();
      const order = this.sortOrder() === 'ASC' ? 1 : -1;

      if (field === 'FECHA') {
        return (new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()) * order;
      }
      if (field === 'PRECIO') {
        return (a.precioTicket - b.precioTicket) * order;
      }
      if (field === 'SALA') {
        return (a.sala.nombre.localeCompare(b.sala.nombre)) * order;
      }
      return 0;
    });

    return result;
  });

  // Create Form State
  showCreateModal = signal<boolean>(false);
  
  // We compute active movies (cartelera + pre-estrenos)
  activeMovies = computed(() => {
    return [...this.movieService.cartelera(), ...this.movieService.preEstrenos()];
  });

  // Selected Movie for the form
  selectedMovieId = signal<number | null>(null);
  selectedMovie = computed(() => {
    const id = this.selectedMovieId();
    if (!id) return null;
    return this.activeMovies().find(m => m.id === id) || null;
  });

  // Form Model
  newFuncion = {
    salaId: null as number | null,
    proyeccionId: null as number | null,
    fecha: '',
    horaSelected: '18',
    minutoSelected: '00',
    precioTicket: null as number | null
  };

  // UI State for Deletion
  isDeleteModalOpen = signal<boolean>(false);
  funcionToDelete = signal<FuncionResponse | null>(null);
  isDeleting = signal<boolean>(false);

  // Custom Time Picker State
  isTimePickerOpen = signal<boolean>(false);
  timePickerMode = signal<'HOUR' | 'MINUTE'>('HOUR');

  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  ngOnInit() {
    this.loadData();
    // Ensure movies are loaded
    if (this.movieService.cartelera().length === 0) {
      this.movieService.fetchCartelera().subscribe();
    }
    if (this.movieService.preEstrenos().length === 0) {
      this.movieService.fetchPreEstrenos().subscribe();
    }
  }

  loadData() {
    this.showtimeService.getAllShowtimesAdmin().subscribe((data: any) => this.funciones.set(data));
    this.showtimeService.getActiveSalas().subscribe((data: any) => this.salas.set(data));
    this.showtimeService.getProyecciones().subscribe((data: any) => this.proyecciones.set(data));
  }

  getMovieTitle(movieId: number): string {
    const movie = this.activeMovies().find(m => m.id === movieId);
    return movie ? movie.titulo : `ID: ${movieId}`;
  }

  openCreateModal() {
    this.errorMessage.set(null);
    this.selectedMovieId.set(null);
    this.newFuncion = {
      salaId: null,
      proyeccionId: null,
      fecha: '',
      horaSelected: '18',
      minutoSelected: '00',
      precioTicket: null
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  toggleSort(field: 'FECHA' | 'PRECIO' | 'SALA') {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('ASC');
    }
  }

  setStatusFilter(status: 'TODAS' | 'ACTIVAS' | 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA') {
    this.filterStatus.set(status);
  }

  selectMovie(id: number) {
    this.selectedMovieId.set(id);
  }

  getHours(): string[] {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }

  getMinutes(): string[] {
    return ['00', '10', '15', '20', '30', '40', '45', '50'];
  }

  toggleTimePicker() {
    this.isTimePickerOpen.update(v => !v);
    if (this.isTimePickerOpen()) {
      this.timePickerMode.set('HOUR');
    }
  }

  selectHour(h: string) {
    if (this.getOccupiedHours().includes(h)) return;
    this.newFuncion.horaSelected = h;
    this.timePickerMode.set('MINUTE');
  }

  selectMinute(m: string) {
    if (this.getOccupiedMinutes(this.newFuncion.horaSelected).includes(m)) return;
    this.newFuncion.minutoSelected = m;
    this.closeTimePicker();
  }

  closeTimePicker() {
    this.isTimePickerOpen.set(false);
  }

  getOccupiedFunctions(): FuncionResponse[] {
    if (!this.newFuncion.salaId || !this.newFuncion.fecha) return [];
    return this.funciones().filter(f => 
      f.sala.id === this.newFuncion.salaId && 
      f.fechaInicio.startsWith(this.newFuncion.fecha) &&
      f.status !== 'CANCELADA'
    );
  }

  getOccupiedHours(): string[] {
    const hours = new Set<string>();
    
    const durationMin = this.selectedMovie() ? ((this.selectedMovie() as any).duracion_min || 120) : 120;
    const newTotalDuration = durationMin + 30; // incl limpieza

    for (const f of this.getOccupiedFunctions()) {
      const fStartHour = parseInt(f.fechaInicio.substring(11, 13), 10);
      const fStartMin = parseInt(f.fechaInicio.substring(14, 16), 10);
      const fStartTotal = fStartHour * 60 + fStartMin;
      
      const fEndHour = parseInt(f.fechaFin.substring(11, 13), 10);
      const fEndMin = parseInt(f.fechaFin.substring(14, 16), 10);
      let fEndTotal = fEndHour * 60 + fEndMin;
      
      if (fEndTotal < fStartTotal) {
          fEndTotal += 24 * 60;
      }

      for (let h = 0; h < 24; h++) {
        const testStart = h * 60; // asumiendo que empieza al minuto 00
        const testEnd = testStart + newTotalDuration;

        if (testStart < fEndTotal && testEnd > fStartTotal) {
          hours.add(h.toString().padStart(2, '0'));
        }
      }
    }
    return Array.from(hours);
  }

  getOccupiedMinutes(hourStr: string): string[] {
    const mins = new Set<string>();
    const h = parseInt(hourStr, 10);
    if (isNaN(h)) return [];

    const durationMin = this.selectedMovie() ? ((this.selectedMovie() as any).duracion_min || 120) : 120;
    const newTotalDuration = durationMin + 30; 

    for (const f of this.getOccupiedFunctions()) {
      const fStartHour = parseInt(f.fechaInicio.substring(11, 13), 10);
      const fStartMin = parseInt(f.fechaInicio.substring(14, 16), 10);
      const fStartTotal = fStartHour * 60 + fStartMin;
      
      const fEndHour = parseInt(f.fechaFin.substring(11, 13), 10);
      const fEndMin = parseInt(f.fechaFin.substring(14, 16), 10);
      let fEndTotal = fEndHour * 60 + fEndMin;
      
      if (fEndTotal < fStartTotal) {
          fEndTotal += 24 * 60;
      }

      for (const mStr of this.getMinutes()) {
        const m = parseInt(mStr, 10);
        const testStart = h * 60 + m;
        const testEnd = testStart + newTotalDuration;

        if (testStart < fEndTotal && testEnd > fStartTotal) {
          mins.add(mStr);
        }
      }
    }
    return Array.from(mins);
  }

  getHoraCompleta(): string {
    return `${this.newFuncion.horaSelected}:${this.newFuncion.minutoSelected}`;
  }

  // UI Warning flag for trasnoche
  isTrasnoche = computed(() => {
    const hour = parseInt(this.newFuncion.horaSelected, 10);
    return hour >= 0 && hour <= 5; // 12 AM to 5 AM
  });

  getTodayString(): string {
    const today = new Date();
    // Obtener YYYY-MM-DD en la zona horaria local
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - offset)).toISOString().split('T')[0];
    return localISOTime;
  }

  getEstimatedEndTime(): string {
    if (!this.selectedMovie() || !this.newFuncion.fecha) return '';
    const start = new Date(`${this.newFuncion.fecha}T${this.getHoraCompleta()}:00`);
    if (isNaN(start.getTime())) return '';
    
    const duration = (this.selectedMovie() as any).duracion_min || 120;
    
    // Add duration + 30 min cleaning
    start.setMinutes(start.getMinutes() + duration + 30);
    return start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  submitFuncion() {
    this.errorMessage.set(null);
    if (!this.selectedMovieId() || !this.newFuncion.salaId || !this.newFuncion.proyeccionId || !this.newFuncion.fecha || !this.newFuncion.precioTicket) {
      this.errorMessage.set('Por favor completa todos los campos.');
      return;
    }

    const horaCompleta = this.getHoraCompleta();

    // Validación de fecha y hora pasada
    const inputDate = new Date(`${this.newFuncion.fecha}T${horaCompleta}:00`);
    const now = new Date();
    if (inputDate < now) {
      this.errorMessage.set('No puedes programar una función en una fecha u hora pasada.');
      return;
    }

    const payload = {
      movie_id: this.selectedMovieId(),
      sala_id: this.newFuncion.salaId,
      proyeccion_id: this.newFuncion.proyeccionId,
      // Forzar huso horario UTC-5 (Perú) para evitar que JS sume 5 horas (toISOString)
      fecha_inicio: `${this.newFuncion.fecha}T${horaCompleta}:00-05:00`,
      duracion_min: (this.selectedMovie() as any).duracion_min || 120,
      precio_ticket: this.newFuncion.precioTicket
    };

    this.isSubmitting.set(true);

    this.showtimeService.programarFuncion(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.loadData();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          this.errorMessage.set(err.error?.message || 'Choque de horarios: La sala ya está ocupada en este bloque.');
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Datos inválidos. Verifica la información ingresada.');
        } else {
          this.errorMessage.set(err.error?.message || 'Error de conexión con el servidor. Por favor, intenta de nuevo.');
        }
      }
    });
  }

  openDeleteModal(funcion: FuncionResponse) {
    this.funcionToDelete.set(funcion);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.funcionToDelete.set(null);
    this.isDeleting.set(false);
  }

  confirmDelete() {
    const funcion = this.funcionToDelete();
    if (!funcion) return;

    this.isDeleting.set(true);
    this.showtimeService.cancelShowtime(funcion.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadData();
      },
      error: (err) => {
        alert('Error al cancelar la función: ' + (err.error?.message || 'Error desconocido'));
        this.isDeleting.set(false);
      }
    });
  }

  cancelarFuncion(id: number) {
    // Ya no se usa window.confirm directamente, se abre el modal.
  }

  toggleSalaStatus(sala: SalaResponse) {
    const currentStatus = sala.estado || 'ACTIVA';
    const targetStatus = currentStatus === 'ACTIVA' ? 'MANTENIMIENTO' : 'ACTIVA';

    this.showtimeService.updateSalaStatus(sala.id, targetStatus).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err: any) => {
        if (err.status === 409) {
          alert('No puedes poner la sala en mantenimiento porque tiene funciones pendientes. Debes cancelarlas primero.');
        } else {
          alert('Error al cambiar el estado de la sala');
        }
      }
    });
  }
}
