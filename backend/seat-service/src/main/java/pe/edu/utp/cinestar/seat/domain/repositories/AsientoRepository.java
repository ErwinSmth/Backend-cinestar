package pe.edu.utp.cinestar.seat.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.utp.cinestar.seat.domain.entities.Asiento;

import java.util.List;

@Repository
public interface AsientoRepository extends JpaRepository<Asiento, Long> {
    List<Asiento> findBySalaId(Long salaId);
}
