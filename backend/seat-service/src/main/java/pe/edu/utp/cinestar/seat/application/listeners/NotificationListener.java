package pe.edu.utp.cinestar.seat.application.listeners;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import pe.edu.utp.cinestar.seat.config.RabbitMQConfig;
import pe.edu.utp.cinestar.seat.model.event.PaymentSuccessEvent;

@Slf4j
@Component
public class NotificationListener {

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleNotification(PaymentSuccessEvent event) {
        log.info("=================================================");
        log.info("📧 SIMULANDO ENVÍO DE CORREO A USUARIO {}", event.getUsuarioId());
        log.info("🎫 Tickets comprados: {}", event.getTicketIds());
        log.info("💳 Transacción Culqi: {}", event.getTransactionId());
        log.info("🔗 Adjuntando Código QR...");
        log.info("✅ Correo enviado exitosamente.");
        log.info("=================================================");
    }
}
