# Estado Actual y Lecciones Técnicas Aprendidas

Este documento consolida decisiones arquitectónicas recientes y resoluciones de bugs críticos implementados durante las últimas fases de desarrollo. **Cualquier desarrollador o IA (agente) que se integre al proyecto debe leer esto antes de codificar.**

## 1. Migración a RestClient (Adiós OpenFeign)
Se ha decidido **eliminar Spring Cloud OpenFeign** de todos los microservicios de Spring Boot (ej. `movie-service`, `showtime-service`).
* **Razón:** Problemas de compatibilidad de dependencias, mayor abstracción innecesaria, y fallos silenciosos.
* **Solución Activa:** Para la comunicación síncrona entre microservicios (Orquestador Localizado), se utiliza exclusivamente **`RestClient`**, introducido nativamente en Spring Framework 6 / Spring Boot 3.

## 2. API Gateway: Proxy Selectivo y Endpoints Públicos vs Privados
Originalmente, el API Gateway ruteaba servicios enteros basándose únicamente en el método HTTP (ej. "Todo GET a `/showtimes` es público"). Esto causaba vulnerabilidades o falsos positivos (ej. `GET /showtimes/admin` rebotaba con 403 Forbidden).
* **Solución Activa:** Se implementó una lógica de **Enrutamiento Selectivo** en `backend/api-gateway/src/index.ts`. Se define un array/regex de subrutas explícitamente públicas (ej. `/`, `/salas`, `/proyecciones`) en variables `isPublicRoute`. Todo lo que no cumpla esa estricta condición pasa obligatoriamente por `authMiddleware`.

## 3. Spring Security: Enmascaramiento de Errores (403 vs 500)
Si ocurre una excepción (ej. fallo de serialización) dentro de un Controller en Spring Boot, el framework redirige la petición internamente a `/error`.
* **Problema:** Si `/error` no está expuesto públicamente, Spring Security intercepta la redirección y devuelve un `403 Forbidden` al cliente, **enmascarando completamente el error real (500 Internal Server Error)**.
* **Solución Activa:** Todo archivo `SecurityConfig.java` debe incluir explícitamente `.requestMatchers("/error").permitAll()` dentro de la cadena de filtros `SecurityFilterChain`.

## 4. Redis y Serialización de Fechas (JavaTimeModule)
Al guardar objetos DTO (como los generados por OpenAPI) en Redis usando `GenericJackson2JsonRedisSerializer`, surgieron excepciones del tipo: `Java 8 date/time type java.time.OffsetDateTime not supported by default`.
* **Solución Activa:** 
  1. En `pom.xml`, se debe añadir la dependencia `com.fasterxml.jackson.datatype:jackson-datatype-jsr310`.
  2. Los DTOs generados deben implementar `Serializable` (añadir `<serializableModel>true</serializableModel>` al plugin de OpenAPI).
  3. En `RedisConfig.java` / `CacheConfig.java`, se debe instanciar un `ObjectMapper`, registrarle el `JavaTimeModule()` (`mapper.registerModule(new JavaTimeModule())`), desactivar `WRITE_DATES_AS_TIMESTAMPS`, e inyectar ese mapper en el serializador de Redis mediante `GenericJackson2JsonRedisSerializer.builder()`.

## 5. Pruebas de Integración y Testcontainers en Alpine/CachyOS
* **Problema:** En entornos Linux bleeding-edge (ej. CachyOS/Arch Linux) con Docker versión 29.x, `Testcontainers` (versiones estables actuales de Java) falla silenciosamente o por timeout al intentar leer la versión de la API del Socket de Docker.
* **Solución Activa (Workaround):** Las pruebas con `mvn clean test` que requieren Testcontainers están temporalmente en desuso (bypasseadas o fallidas). Toda prueba de integración/flujo se debe realizar **levantando los microservicios con `docker compose up -d --build`** y lanzando las peticiones manualmente mediante Bruno CLI/GUI.

## 6. Estado Actual de Showtime Service
* En `FuncionService.java`, la lógica que actúa como **Orquestador Síncrono** llamando a `Seat Service` para pre-generar asientos al crear una función, se encuentra **COMENTADA**.
* **Motivo:** El `Seat Service` aún no está desarrollado. Para poder probar y validar manualmente el resto del flujo de base de datos de `showtime-service`, se desactivó esa validación restrictiva. Se debe volver a descomentar cuando `seat-service` esté productivo.
