## 1. El Ciclo de Vida del Ticket (Pre-generación)

**Regla de Arquitectura:** Los registros en la tabla `tickets` **NO se crean en el momento en que el usuario hace clic** en un asiento.

- **¿Cuándo se crean?** Se pre-generan en bloque en el momento en que el Administrador crea la función (Showtime).
- **Ejemplo:** Si el Admin programa *Spider-Man* en la Sala 1 (100 butacas), el sistema hace un `INSERT` de 100 filas en la tabla `tickets` automáticamente.
- **Estado Inicial:** Todas las filas nacen con `user_id = null`, `status = 'AVAILABLE'` y `version = 0`.
- **Beneficio:** Al pre-existir la fila, cuando múltiples usuarios intentan comprar al mismo tiempo, el sistema solo compite por hacer un `UPDATE`, permitiendo que las herramientas de bloqueo de la base de datos funcionen a la perfección.

## 2. Anatomía de las Columnas Especiales

La tabla `tickets` posee 3 columnas encargadas de orquestar la transacción:

### A. `status` (El Semáforo del Negocio)

- **Qué es:** Es una etiqueta de texto (`AVAILABLE`, `LOCKED`, `SOLD`).
- **Para qué sirve:** Le indica al **Frontend** de qué color pintar la butaca (Verde = Libre, Amarillo = En proceso de pago, Gris = Vendido). A la base de datos no le importa el valor de este texto.

### B. `version` (El Escudo de la Base de Datos - Optimistic Locking)

- **Qué es:** Es un contador numérico interno controlado nativamente por JPA/Hibernate (`@Version`).
- **Para qué sirve:** Impide matemáticamente que dos transacciones modifiquen la misma fila al mismo tiempo. Es invisible para el Frontend y para el usuario.
- **¿Es lo mismo que el **`**status**`**?:** **NO.** * *Analogía del Baño Público:* El `status` es el letrero de plástico por fuera que dice "Libre / Ocupado" (para que la gente lo vea). La `version` es la cerradura de metal por dentro que traba la puerta e impide físicamente que alguien más entre (para evitar choques).

### C. `locked_until` (El Temporizador de Abandono)

- **Qué es:** Un campo de fecha y hora (`TIMESTAMP`).
- **Para qué sirve:** Define el tiempo límite que un asiento puede permanecer en estado `LOCKED`. Si el usuario no completa el pago (ej. cierra el navegador), el Backend utilizará esta hora para saber si ya pasaron los 5 minutos de gracia y puede devolver la butaca a estado `AVAILABLE`.

## 3. Caso Práctico de Colisión: El Escenario "Juan vs. María"

¿Qué sucede cuando dos personas intentan comprar la **misma butaca** en el **mismo milisegundo**?

**Minuto 0: El Escenario**

- Juan y María están en sus casas viendo la cartelera.
- Ambos ven el asiento "G-14" en color verde.
- Su Frontend tiene el dato en memoria: `Asiento G-14 | status: AVAILABLE | version: 1`.

**Minuto 1: El Choque (Race Condition)**

- Ambos hacen clic en "Comprar G-14" casi al unísono. Hay solo 2 milisegundos de diferencia entre la petición de Juan y la de María.

**Resolución en el Backend (PostgreSQL + Spring Boot):**

18. **Petición de Juan (Llega primero):**
    - El Backend envía a la BD: *"Actualiza el asiento G-14 a LOCKED, suma 5 min a locked_until, y cambia la versión a 2, ****SOLO SI**** la versión actual sigue siendo 1"*.
    - PostgreSQL dice: *"La versión es 1. Perfecto. Filas actualizadas: 1"*.
    - **Resultado:** Juan avanza a la pasarela de pagos.
19. **Petición de María (Llega 2 milisegundos tarde):**
    - El Backend envía la misma orden exacta: *"Actualiza el asiento G-14 a LOCKED, y cambia la versión a 2, ****SOLO SI**** la versión actual sigue siendo 1"*.
    - PostgreSQL busca el asiento G-14 con versión 1. **Pero ya no lo encuentra**, porque Juan lo acaba de cambiar a versión 2.
    - PostgreSQL responde: *"Filas actualizadas: 0"*.
20. **La Excepción:**
    - Spring Boot detecta que se afectaron 0 filas y lanza una `OptimisticLockException`.
    - El Backend intercepta este error y le devuelve una respuesta limpia al Frontend de María: *"Lo sentimos, este asiento acaba de ser tomado por otro usuario"*.