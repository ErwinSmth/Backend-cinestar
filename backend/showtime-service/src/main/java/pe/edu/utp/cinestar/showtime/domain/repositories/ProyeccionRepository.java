package pe.edu.utp.cinestar.showtime.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.cinestar.showtime.domain.entities.Proyeccion;

import java.util.Optional;

public interface ProyeccionRepository extends JpaRepository<Proyeccion, Integer> {
    Optional<Proyeccion> findByCodigo(String codigo);
}
