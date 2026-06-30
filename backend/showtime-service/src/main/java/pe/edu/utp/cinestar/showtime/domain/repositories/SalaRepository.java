package pe.edu.utp.cinestar.showtime.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.utp.cinestar.showtime.domain.entities.Sala;

import java.util.List;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    List<Sala> findByEstado(String estado);
}
