package pe.edu.utp.cinestar.showtime.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.utp.cinestar.showtime.domain.entities.Funcion;

import java.time.LocalDateTime;
import java.util.List;

public interface FuncionRepository extends JpaRepository<Funcion, Long> {

    // Utiliza el Índice Parcial: idx_funciones_activas
    List<Funcion> findByFechaInicioBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);

    // Utiliza el Índice Compuesto: idx_funcion_movie_fecha
    List<Funcion> findByMovieIdAndFechaInicioBetweenAndStatus(Long movieId, LocalDateTime start, LocalDateTime end, String status);

    // Consulta para validación de Overlap (Solapamiento de horarios en la misma sala)
    @Query("SELECT f FROM Funcion f WHERE f.sala.id = :salaId AND f.status = 'PROGRAMADA' AND " +
           "((f.fechaInicio < :end AND f.fechaFin > :start))")
    List<Funcion> findOverlappingFunciones(@Param("salaId") Long salaId, 
                                           @Param("start") LocalDateTime start, 
                                           @Param("end") LocalDateTime end);

    // Obtener IDs únicos de películas con funciones activas/futuras
    @Query("SELECT DISTINCT f.movieId FROM Funcion f WHERE f.status = 'PROGRAMADA' AND f.fechaInicio >= CURRENT_TIMESTAMP")
    List<Long> findActiveMovieIds();

    // Validar si existen funciones programadas a futuro para una sala (usado para mantenimiento)
    boolean existsBySalaIdAndFechaInicioGreaterThanEqualAndStatus(Long salaId, LocalDateTime fechaInicio, String status);
}
