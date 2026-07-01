---
description: Arquitectura de Seguridad y Políticas de Acceso del Sistema CinemaCore
related_skills:
  - security-auditor
---

# Arquitectura de Seguridad (Security Guidelines)

Este documento define la única fuente de verdad técnica para los estándares de seguridad, autenticación, autorización y protección de datos en todo el ecosistema de microservicios de CinemaCore.

---

## 1. Perímetro y Control de Acceso

### 1.1 El API Gateway como Única Frontera
Ningún microservicio interno (Auth, Movie, Seat, Showtime) está expuesto a Internet. Todo el tráfico hacia el sistema **debe** pasar a través del `API Gateway`.
*   **Aislamiento de Red:** Los microservicios solo escuchan conexiones en la red interna de Docker.
*   **Protocolo Seguro:** Todo el tráfico externo (Frontend -> Gateway) debe viajar obligatoriamente sobre **HTTPS empleando TLS 1.2 o superior**, asegurando que los tokens y contraseñas no puedan ser interceptados.

### 1.2 Autenticación Stateless (JWT y OAuth 2.0)
El sistema abandona el uso de sesiones en memoria a favor de una arquitectura 100% Stateless:
1.  **Emisión:** El `Auth Service` es la única entidad autorizada para emitir tokens JWT tras validar credenciales con BCrypt.
2.  **Verificación Local:** El `API Gateway` posee la misma clave secreta (`JWT_SECRET`) que el Auth Service. Esto le permite verificar criptográficamente la autenticidad del token sin hacer costosas llamadas de red adicionales.

---

## 2. Propagación de Identidad (Zero Trust Interno)

Cuando una petición autenticada supera el API Gateway, la identidad del usuario debe viajar hacia los microservicios de forma estandarizada.

*   **Extracción e Inyección:** El Gateway extrae el `user_id` y el `role` desde el payload del JWT.
*   **Headers Internos:** El Gateway descarta el JWT original y envía la petición al microservicio destino inyectando los headers seguros:
    *   `X-User-Id`: UUID del usuario.
    *   `X-User-Role`: El rol del usuario.
*   **Regla de Microservicios:** Los microservicios (como Seat o Movie) **nunca** deben validar un JWT por sí mismos. Confían ciegamente en los headers `X-User-*`, asumiendo que si la petición llegó a ellos, el Gateway ya hizo el trabajo sucio.

---

## 3. Autorización y Roles (RBAC)

El sistema utiliza control de acceso basado en roles (Role-Based Access Control). Los roles válidos en el sistema son:

1.  **`ROLE_CLIENTE`**
    *   Puede visualizar la cartelera y funciones (Rutas Públicas).
    *   Puede reservar asientos temporalmente (`/api/v1/seats/lock`).
    *   Puede procesar compras propias.
2.  **`ROLE_TAQUILLERO`**
    *   Tiene los mismos privilegios del cliente, más capacidades de venta presencial masiva.
    *   Puede bloquear asientos por fallas mecánicas o mantenimiento.
3.  **`ROLE_ADMINISTRADOR`**
    *   Control total del catálogo: Importar de TMDB, crear películas locales.
    *   Crear salas y programar horarios (Showtimes).

---

## 4. Protección de Datos y Persistencia

### 4.1 Cifrado de Contraseñas
*   Las contraseñas de los usuarios **jamás** deben almacenarse en texto plano, ni siquiera en memoria durante más tiempo del estrictamente necesario para su evaluación.
*   Se utilizará el algoritmo **BCrypt** (mínimo factor de costo (work factor) de 10) para el hasheo unidireccional de contraseñas.

### 4.2 Respuestas de Seguridad (Anti-Enumeración)
*   En el endpoint de `/auth/login`, si la contraseña o el correo son incorrectos, el sistema debe responder genéricamente con "Credenciales inválidas" (HTTP 401). **Nunca** debe indicar si el correo existe o no, para prevenir ataques de enumeración de usuarios.

### 4.3 Backups de Bases de Datos
*   Como Requerimiento No Funcional Crítico, todas las bases de datos de los microservicios (`db_auth`, `db_movies`, `db_seats`, `db_showtime`) tendrán configurados *backups incrementales diarios* para garantizar la integridad ante catástrofes.

---

## 5. Prevención de Ataques y Nuevos Requerimientos (Optimizaciones Sugeridas)

*Esta sección se añade para cubrir aspectos de seguridad moderna que deben implementarse en el API Gateway durante la fase de optimización:*

1.  **Rate Limiting (Protección contra DDoS y Fuerza Bruta):** El API Gateway deberá implementar una política de limitación de tasa (ej. máximo 5 intentos de login por IP en 5 minutos) para proteger el Auth Service.
2.  **CORS (Cross-Origin Resource Sharing):** El API Gateway debe estar configurado para rechazar peticiones de dominios no autorizados, permitiendo explícitamente solo los dominios de los frontends oficiales del cine.
3.  **Sanitización de JSON:** El Gateway debe rechazar cargas útiles (payloads) exageradamente grandes antes de que lleguen a los servicios backend (prevenir ataques de desbordamiento de buffer o agotamiento de recursos).
4.  **Enrutamiento Selectivo (Proxy):** Las rutas de un mismo servicio (ej. `showtimes`) pueden tener partes públicas (`/salas`) y privadas (`/admin`). El API Gateway debe usar middlewares condicionales (evaluando `req.path` y `req.method`) para decidir si invoca el `authMiddleware` antes de hacer el proxy, en lugar de aplicar el proxy a ciegas basado solo en el método HTTP.
5.  **Des-Enmascaramiento de Errores Internos:** En los microservicios de Spring Boot, si ocurre una excepción no controlada (ej. error de serialización en Redis), Spring redirige la petición a la ruta `/error`. Si esta ruta no está explícitamente permitida en `SecurityConfig` (`.requestMatchers("/error").permitAll()`), Spring Security interceptará la redirección y devolverá un falso `403 Forbidden` al Gateway. Es mandatorio permitir `/error` para no ocultar errores 500 bajo problemas de permisos.
