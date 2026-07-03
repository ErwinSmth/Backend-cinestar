package pe.edu.utp.cinestar.seat.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "asientos")
@Getter
@Setter
public class Asiento implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asientos_id")
    private Long id;

    @Column(name = "sala_id", nullable = false)
    private Long salaId;

    @Column(name = "fila_butaca", nullable = false, length = 10)
    private String filaButaca;

    @Column(name = "numero_butaca", nullable = false)
    private Integer numeroButaca;

    @Column(nullable = false, length = 50)
    private String tipo;
}
