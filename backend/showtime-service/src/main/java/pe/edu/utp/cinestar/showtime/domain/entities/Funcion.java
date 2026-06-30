package pe.edu.utp.cinestar.showtime.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "funcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Funcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "funcion_id")
    private Long id;

    // Referencia externa al Movie Service (No es una relación JPA)
    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyeccion_id", nullable = false)
    private Proyeccion proyeccion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Column(name = "precio_ticket", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioTicket;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PROGRAMADA";
}
