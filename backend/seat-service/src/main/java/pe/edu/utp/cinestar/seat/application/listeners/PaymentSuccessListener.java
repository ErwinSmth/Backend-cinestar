package pe.edu.utp.cinestar.seat.application.listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.cinestar.seat.config.RabbitMQConfig;
import pe.edu.utp.cinestar.seat.domain.entities.Ticket;
import pe.edu.utp.cinestar.seat.domain.repositories.TicketRepository;
import pe.edu.utp.cinestar.seat.model.event.PaymentSuccessEvent;
import pe.edu.utp.cinestar.seat.model.event.SeatLockedEvent;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSuccessListener {

    private final TicketRepository ticketRepository;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_SUCCESS_QUEUE)
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Recibido evento de pago exitoso. Transacción: {}", event.getTransactionId());

        List<Ticket> tickets = ticketRepository.findAllById(event.getTicketIds());
        
        for (Ticket ticket : tickets) {
            if ("BLOQUEADO".equals(ticket.getEstado()) && ticket.getUsuarioId().equals(event.getUsuarioId())) {
                log.info("Consolidando ticket {} como VENDIDO", ticket.getId());
                ticket.setEstado("VENDIDO");
                ticket.setTiempoBloqueo(null);
            } else {
                log.warn("El ticket {} no estaba bloqueado por el usuario {}", ticket.getId(), event.getUsuarioId());
            }
        }
        
        ticketRepository.saveAll(tickets);
        
        // Emitir evento para notificar al usuario (simulado)
        log.info("Emitiendo evento de Notificación para enviar QR...");
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY_NOTIFICATION, event);
    }
}
