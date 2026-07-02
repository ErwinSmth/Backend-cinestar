package pe.edu.utp.cinestar.seat.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long id;

    @Column(name = "funcion_id", nullable = false)
    private Long funcionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asientos_id", nullable = false)
    private Asiento asiento;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(nullable = false, length = 20)
    private String estado = "DISPONIBLE"; // DISPONIBLE, BLOQUEADO, VENDIDO, CANCELADO

    @Column(name = "tiempo_bloqueo")
    private LocalDateTime tiempoBloqueo;

    @Version
    @Column(nullable = false)
    private Integer version = 0;
}
