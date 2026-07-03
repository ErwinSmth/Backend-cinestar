package pe.edu.utp.cinestar.seat.model.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSuccessEvent {
    private String transactionId;
    private Long usuarioId;
    private List<Long> ticketIds;
}
