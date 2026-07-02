package pe.edu.utp.cinestar.seat.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.utp.cinestar.seat.domain.entities.Ticket;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByFuncionId(Long funcionId);
    List<Ticket> findByEstado(String estado);
}
