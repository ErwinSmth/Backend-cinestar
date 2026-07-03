package pe.edu.utp.cinestar.seat.model.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatLockedEvent {
    private Long ticketId;
    private Long usuarioId;
}
