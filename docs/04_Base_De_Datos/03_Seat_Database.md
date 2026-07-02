---
description: Esquema de Base de Datos para Seat Service (Inventario y Reservas)
related_skills:
  - postgresql
  - seat-service
---

# Data Model: Seat Service (`db_seats`)

## Diagrama Relacional (Entidad-Relación)

La base de datos `db_seats` está altamente optimizada para manejar concurrencia estricta (Optimistic Locking) y prevenir "Race Conditions" durante la compra de boletos.

### 1. Tabla `asientos` (Seats)
Representa la distribución física y estática de las butacas en una sala.
*   `asientos_id` (BIGSERIAL / BIGINT, Primary Key)
*   `sala_id` (BIGINT): Referencia externa a la sala física del cine.
*   `fila_butaca` (VARCHAR 10): Ej. "A", "G".
*   `numero_butaca` (INTEGER): Ej. 14.
*   `tipo` (VARCHAR 50): Ej. "VIP", "REGULAR", "DISCAPACITADO".

### 2. Tabla `tickets` (Tickets)
Representa el estado transaccional de un asiento para una función específica. Esta tabla es el núcleo de la estrategia de concurrencia.
*   `ticket_id` (BIGSERIAL / BIGINT, Primary Key)
*   `funcion_id` (BIGINT): Referencia externa al Showtime (función programada).
*   `asientos_id` (BIGINT, Foreign Key -> `asientos.asientos_id`)
*   `usuario_id` (BIGINT, Nullable): ID del usuario que reservó o compró. Nace como NULL.
*   `estado` (VARCHAR 20): El Semáforo del Negocio (`AVAILABLE`, `LOCKED`, `SOLD`, `CANCELLED`).
*   `tiempo_bloqueo` (TIMESTAMP, Nullable): El Temporizador de Abandono. Fecha/Hora límite en estado `LOCKED`.
*   `version` (INTEGER): El Escudo de BD. Controlado por la anotación `@Version` de JPA para manejar el Optimistic Locking de manera nativa.

### 3. Tabla `cupones` (Coupons)
Representa los códigos de cortesía generados automáticamente por el sistema tras una cancelación de emergencia para realizar el bypass de pasarela.
*   `cupon_id` (BIGSERIAL / BIGINT, Primary Key)
*   `codigo` (VARCHAR 20, Unique): El código alfanumérico que el usuario ingresará.
*   `usuario_id` (BIGINT): Referencia externa al usuario dueño del cupón. Esto evita robos de códigos.
*   `descuento_porcentaje` (DECIMAL): Usualmente 100.00.
*   `usado` (BOOLEAN): Bandera de control, inicia en `false`.

---

## 4. Notas del Roadmap y Próximas Optimizaciones
Tal como se ha definido en el roadmap del proyecto, el enfoque para esta base de datos es el **rendimiento relacional estricto**:
1.  **Índices (Indexes):** En una fase posterior se diseñarán y aplicarán índices en columnas clave como `funcion_id` y `estado` para que el frontend pueda cargar el mapa de butacas en milisegundos.
2.  **No Redis para Asientos:** Dado que la transacción de reserva de un asiento requiere propiedades ACID absolutas para evitar sobreventas, no se delegará esta responsabilidad a Redis (el cual se reservará para el `Movie Service`). Todo el peso de la validación transaccional recae en PostgreSQL a través de la columna `version`.
