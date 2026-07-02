package pe.edu.utp.cinestar.showtime.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.cinestar.showtime.application.client.SeatRestClient;
import pe.edu.utp.cinestar.showtime.domain.entities.Funcion;
import pe.edu.utp.cinestar.showtime.domain.entities.Proyeccion;
import pe.edu.utp.cinestar.showtime.domain.entities.Sala;
import pe.edu.utp.cinestar.showtime.domain.exceptions.ResourceNotFoundException;
import pe.edu.utp.cinestar.showtime.domain.exceptions.RoomConflictException;
import pe.edu.utp.cinestar.showtime.domain.exceptions.InvalidDateException;
import pe.edu.utp.cinestar.showtime.domain.repositories.FuncionRepository;
import pe.edu.utp.cinestar.showtime.domain.repositories.ProyeccionRepository;
import pe.edu.utp.cinestar.showtime.domain.repositories.SalaRepository;
import pe.edu.utp.cinestar.showtime.model.dto.FuncionResponse;
import pe.edu.utp.cinestar.showtime.model.dto.ProgramarFuncionRequest;
import pe.edu.utp.cinestar.showtime.model.dto.ProyeccionResponse;
import pe.edu.utp.cinestar.showtime.model.dto.SalaResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionService {

    private final FuncionRepository funcionRepository;
    private final SalaRepository salaRepository;
    private final ProyeccionRepository proyeccionRepository;
    private final SeatRestClient seatRestClient;

    private static final int CLEANING_TIME_MINUTES = 30;

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "showtimes", key = "#request.getFechaInicio().toLocalDate().toString()"),
        @CacheEvict(value = "active_movie_ids", allEntries = true)
    })
    public Long programarFuncion(ProgramarFuncionRequest request) {
        Sala sala = salaRepository.findById(request.getSalaId())
                .orElseThrow(() -> new ResourceNotFoundException("Sala no encontrada"));

        Proyeccion proyeccion = proyeccionRepository.findById(request.getProyeccionId())
                .orElseThrow(() -> new ResourceNotFoundException("Proyección no encontrada"));

        LocalDateTime fechaInicio = request.getFechaInicio().toLocalDateTime();
        
        // Validación Anti-Pasado
        if (fechaInicio.isBefore(LocalDateTime.now())) {
            throw new InvalidDateException("No se puede programar una función en una fecha u hora pasada.");
        }

        // Calculamos la fecha fin sumándole la duración de la película MÁS 30 minutos de limpieza
        LocalDateTime fechaFin = fechaInicio.plusMinutes(request.getDuracionMin() + CLEANING_TIME_MINUTES);

        // Validación Anti-Overlap (Solapamiento)
        List<Funcion> overlaps = funcionRepository.findOverlappingFunciones(sala.getId(), fechaInicio, fechaFin);
        if (!overlaps.isEmpty()) {
            throw new RoomConflictException("La sala " + sala.getNombre() + " ya tiene funciones programadas que se solapan en este horario.");
        }

        Funcion funcion = new Funcion();
        funcion.setMovieId(request.getMovieId());
        funcion.setSala(sala);
        funcion.setProyeccion(proyeccion);
        funcion.setFechaInicio(fechaInicio);
        funcion.setFechaFin(fechaFin);
        funcion.setPrecioTicket(request.getPrecioTicket());
        funcion.setStatus("PROGRAMADA");

        funcion = funcionRepository.save(funcion);

        // Orquestación Síncrona hacia el Seat Service (Si falla, Spring hace Rollback)
        // TODO: Descomentar cuando el Seat Service esté implementado
        // seatRestClient.preGenerateSeats(funcion.getId(), sala.getCapacidad());

        return funcion.getId();
    }

    @Cacheable(value = "showtimes", key = "#fecha.toString()")
    public List<FuncionResponse> getShowtimesByDate(LocalDate fecha) {
        LocalDateTime startOfDay = fecha.atStartOfDay();
        LocalDateTime endOfDay = fecha.atTime(23, 59, 59);

        // Usa el índice parcial de PROGRAMADA y el BETWEEN de fecha
        List<Funcion> funciones = funcionRepository.findByFechaInicioBetweenAndStatus(startOfDay, endOfDay, "PROGRAMADA");

        return funciones.stream().map(this::toFuncionResponse).collect(Collectors.toList());
    }

    public List<FuncionResponse> getAllShowtimesAdmin(String status, Long salaId) {
        // Para el administrador, listamos todas sin forzar la fecha. (En un entorno real usaríamos paginación)
        List<Funcion> funciones = funcionRepository.findAll();
        
        if (status != null && !status.isBlank()) {
            funciones = funciones.stream().filter(f -> f.getStatus().equals(status)).collect(Collectors.toList());
        }
        if (salaId != null) {
            funciones = funciones.stream().filter(f -> f.getSala().getId().equals(salaId)).collect(Collectors.toList());
        }

        return funciones.stream().map(this::toFuncionResponse).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"showtimes", "active_movie_ids"}, allEntries = true)
    public void cancelarFuncion(Long id) {
        Funcion funcion = funcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Función no encontrada con ID: " + id));

        funcion.setStatus("CANCELADA");
        funcionRepository.save(funcion);

        // Orquestación para cancelar (o liberar) butacas en Seat Service
        // TODO: Descomentar cuando el Seat Service esté implementado
        // seatRestClient.cancelSeats(funcion.getId());
    }

    @Cacheable(value = "active_movie_ids")
    public List<Long> getActiveMovieIds() {
        return funcionRepository.findActiveMovieIds();
    }

    public List<SalaResponse> getSalasActivas() {
        return salaRepository.findAll().stream().map(this::toSalaResponse).collect(Collectors.toList());
    }

    public List<ProyeccionResponse> getProyecciones() {
        return proyeccionRepository.findAll().stream().map(this::toProyeccionResponse).collect(Collectors.toList());
    }

    @Transactional
    public void updateSalaStatus(Long salaId, String newStatus) {
        Sala sala = salaRepository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala no encontrada con ID: " + salaId));

        if ("MANTENIMIENTO".equals(newStatus)) {
            boolean hasFutureFunctions = funcionRepository.existsBySalaIdAndFechaInicioGreaterThanEqualAndStatus(
                    salaId, LocalDateTime.now(), "PROGRAMADA");
            
            if (hasFutureFunctions) {
                throw new RoomConflictException("La sala tiene funciones pendientes y no puede ponerse en mantenimiento. Cancélelas primero.");
            }
        }

        sala.setEstado(newStatus);
        salaRepository.save(sala);
    }

    // --- Mappers ---

    private FuncionResponse toFuncionResponse(Funcion f) {
        FuncionResponse dto = new FuncionResponse();
        dto.setId(f.getId());
        dto.setMovieId(f.getMovieId());
        
        if (f.getFechaInicio() != null) {
            dto.setFechaInicio(f.getFechaInicio().atOffset(java.time.ZoneOffset.ofHours(-5)));
        }
        if (f.getFechaFin() != null) {
            dto.setFechaFin(f.getFechaFin().atOffset(java.time.ZoneOffset.ofHours(-5)));
        }
        
        dto.setPrecioTicket(f.getPrecioTicket());
        dto.setStatus(f.getStatus());
        dto.setSala(toSalaResponse(f.getSala()));
        dto.setProyeccion(toProyeccionResponse(f.getProyeccion()));
        return dto;
    }

    private SalaResponse toSalaResponse(Sala s) {
        SalaResponse dto = new SalaResponse();
        dto.setId(s.getId());
        dto.setNombre(s.getNombre());
        dto.setCapacidad(s.getCapacidad());
        return dto;
    }

    private ProyeccionResponse toProyeccionResponse(Proyeccion p) {
        ProyeccionResponse dto = new ProyeccionResponse();
        dto.setId(p.getId());
        dto.setCodigo(p.getCodigo());
        dto.setDescripcion(p.getDescripcion());
        return dto;
    }
}
