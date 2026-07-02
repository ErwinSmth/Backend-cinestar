package pe.edu.utp.cinestar.seat.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "cupones")
@Getter
@Setter
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cupon_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "descuento_porcentaje", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuentoPorcentaje = new BigDecimal("100.00");

    @Column(nullable = false)
    private Boolean usado = false;
}
