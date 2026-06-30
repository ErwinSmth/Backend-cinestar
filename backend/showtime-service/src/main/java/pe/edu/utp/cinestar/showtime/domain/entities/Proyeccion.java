package pe.edu.utp.cinestar.showtime.domain.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proyeccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proyeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "proyeccion_id")
    private Integer id;

    @Column(name = "codigo", nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 100)
    private String descripcion;
}
