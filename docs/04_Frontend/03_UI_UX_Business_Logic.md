# Lógica de Negocio UI/UX - Frontend

Este documento detalla las reglas de negocio y decisiones de diseño para los componentes visuales de la interfaz, asegurando consistencia a medida que el proyecto crece.

## 1. Carrusel Principal (Hero Banner) y Algoritmo de Relevancia
- **Población Dinámica**: El Hero Banner NO debe ser estático. Se llenará con las películas más relevantes dictadas por el API Gateway (fusionando data de `movie-service` y `showtime-service`).
- **Score de Relevancia (Priority Score)**:
  1. Películas con **preventa activa** (máxima prioridad de negocio).
  2. Películas en cartelera con **alta cantidad de funciones activas**.
  3. Películas "Muy Esperadas" marcadas manualmente por el Admin (a través de un flag `{"isFeatured": true}` inyectado en la columna `metadata` JSONB de la BD).
- **Indicadores de Botón Principal (State Flags)**: 
  El Backend enviará banderas calculadas (`hasActivePresale`, `hasActiveShowtimes`). El UI reaccionará así:
  - Si es estreno y `!hasActivePresale`: El botón dirá **"PRÓXIMAMENTE"** (solo lectura o trailer).
  - Si es estreno y `hasActivePresale`: El botón dirá **"COMPRAR PREVENTA"**.
  - Si está en cartelera y `hasActiveShowtimes`: El botón dirá **"COMPRAR ENTRADAS"**.

## 2. Sección "Próximos Estrenos" (Pre-Estrenos)
Las películas en estado `PRE-ESTRENO` se muestran aquí. Existen sub-estados importantes:
- **Película Futura (Sin Preventa)**: Solo muestra fecha de estreno y opción "Ver Tráiler".
- **Película Futura (Con Preventa Activa)**: 
  - Aparece un badge (etiqueta) rojo parpadeante en la tarjeta indicando "PREVENTA ACTIVA".
  - Al pasar el ratón (hover) sobre la tarjeta, se deben mostrar **dos botones**:
    1. `Comprar Preventa` (Rojo destacado).
    2. `Ver Tráiler` (Secundario/Glassmorphism).

*Nota técnica Integración Backend*: El cálculo de estas banderas se hará en tiempo real en el **API Gateway** (actuando como BFF). El Gateway consultará las películas del catálogo (`movie-service`) y, en paralelo, consumirá un endpoint ultraligero del `showtime-service` (ej. `GET /showtimes/movies/active`) que devolverá únicamente un arreglo de `movie_id`s con funciones futuras programadas (`SELECT DISTINCT movie_id...`). Luego, el Gateway cruzará esta data en memoria (O(1)) e inyectará los flags en el payload del Frontend, manteniendo la carga instantánea y evitando problemas de N+1 peticiones. No se necesita modificar el esquema de base de datos actual para esto.

## 3. Tráilers Destacados (Featured Trailers)
- **Data Source**: Se debe combinar la lista de `Próximos Estrenos` y `Cartelera`, filtrando estrictamente las películas que contengan al menos un tráiler en su array `trailers`.
- **Prioridad/Orden**: Se debe priorizar (mostrar primero) los tráilers de los `Próximos Estrenos`, ya que generan mayor expectativa en los usuarios, seguidos por los de la cartelera actual.
- **Rendimiento**: En lugar de usar las imágenes de alta resolución de TMDB (`backdrop_path`), se extraen dinámicamente las **miniaturas nativas de YouTube** (`mqdefault.jpg`). Esto reduce el peso por imagen de ~200KB a ~15KB, manteniendo la carga de la página instantánea.

## 4. Compra Rápida (Sticky Footer)
- **Propósito**: Permitir al usuario iniciar un flujo de compra desde cualquier parte de la vista principal sin tener que navegar hacia arriba.
- **Flujo**:
  1. El usuario hace clic en "Película" o "Fecha".
  2. Se despliega un menú flotante sobre la barra.
  3. Tras seleccionar una película, se habilitan las fechas disponibles.
  4. Tras seleccionar una fecha, se habilitan las horas (funciones) disponibles.
- **Ocultamiento Inteligente (Filtro)**: Para optimizar la experiencia de usuario, el desplegable de "Elige Película" filtrará internamente el catálogo proveído por el Gateway. Aquellas películas que no tengan funciones activas ni preventas (`!hasActiveShowtimes && !hasActivePresale`) **no** aparecerán en la lista. Esto evita que el usuario inicie un flujo "muerto" que termine en fechas vacías.
- **Integración**: Este componente se nutrirá directamente de los flags inyectados por el Gateway y la data de horarios del `showtime-service`.

## 5. Panel de Administración (Dashboard)
El panel de administración resume la operatividad del negocio basándose estrictamente en datos calculables y cruzables por el API Gateway desde los microservicios:
- **Estado del Catálogo (`movie-service`)**: Conteo de películas `CARTELERA`, `PRE-ESTRENO` y películas pendientes de revisión (`INACTIVO`).
- **Operatividad (`showtime-service`)**: Cantidad de salas con estado `ACTIVA` y funciones de hoy con estado `PROGRAMADA` o `EN_CURSO`.
- **Ventas y Ocupación (`seat-service` + `showtime-service`)**:
  - `Entradas Vendidas`: Tickets en estado `SOLD` de funciones del día.
  - `Compras en Proceso`: Tickets en estado `LOCKED` (Checkout en tiempo real).
  - `Ingresos Estimados`: Entradas vendidas multiplicadas por el `precio_ticket` de la función asociada.

## 6. Navegación al Detalle y Evaluación de Funciones
- **Delegación de Lógica al Detalle**: Para mantener el Home ultrarrápido (con catálogos básicos desde Redis), no se consultan las funciones disponibles por película en la página principal. En su lugar, todas las tarjetas de películas y botones primarios ("Comprar", "Preventa") simplemente navegan a la vista de detalle (`/movies/:id`).
- **Resolución Real**: Es la página de Detalle (`MovieDetailComponent`) quien asume la responsabilidad de interactuar con el *Showtime Service* para verificar la disponibilidad.
  - Si el servicio retorna funciones (incluso para películas en `PRE-ESTRENO`), se habilita y muestra el módulo de compra de entradas (Preventa activa).
  - Si el servicio retorna un array vacío, se muestra el letrero "PRÓXIMAMENTE - La venta aún no está habilitada".
