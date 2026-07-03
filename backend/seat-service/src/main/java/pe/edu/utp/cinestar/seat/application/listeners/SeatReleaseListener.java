package pe.edu.utp.cinestar.seat.application.listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.cinestar.seat.config.RabbitMQConfig;
import pe.edu.utp.cinestar.seat.domain.entities.Ticket;
import pe.edu.utp.cinestar.seat.domain.repositories.TicketRepository;
import pe.edu.utp.cinestar.seat.model.event.SeatLockedEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeatReleaseListener {

    private final TicketRepository ticketRepository;

    @RabbitListener(queues = RabbitMQConfig.RELEASE_QUEUE)
    @Transactional
    public void handleSeatRelease(SeatLockedEvent event) {
        log.info("Recibido evento de DLX para liberar asiento: {}", event.getTicketId());
        
        ticketRepository.findById(event.getTicketId()).ifPresent(ticket -> {
            if ("BLOQUEADO".equals(ticket.getEstado()) && ticket.getUsuarioId().equals(event.getUsuarioId())) {
                log.info("Liberando ticket {} por expiración de timeout", ticket.getId());
                ticket.setEstado("DISPONIBLE");
                ticket.setUsuarioId(null);
                ticket.setTiempoBloqueo(null);
                ticketRepository.save(ticket);
            } else {
                log.info("El ticket {} ya no está BLOQUEADO o fue pagado. Ignorando evento.", ticket.getId());
            }
        });
    }
}
