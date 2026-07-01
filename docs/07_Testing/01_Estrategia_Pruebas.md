# Estrategia Global de Pruebas (A Implementar)

La estrategia de pruebas de **CinemaCore** se basa en el aislamiento de responsabilidades propio de una arquitectura de microservicios. Cada componente debe ser probado de forma independiente.

## 1. Pruebas Unitarias (Lógica de Negocio)
Se enfocan en probar los métodos y clases aislándolos de sus dependencias externas (Base de datos, otros servicios) mediante *Mocks*.

* **Microservicios (Java/Spring Boot):**
  * **Herramientas:** JUnit 5, Mockito.
  * **Alcance:** Servicios de dominio, validaciones de negocio (ej. validación de formato de email, solapamiento de horarios, cálculo de precios de asientos).
* **API Gateway (Node.js):**
  * **Herramientas:** Jest.
  * **Alcance:** Middlewares personalizados, validación JWT, Rate Limiting y reglas de enrutamiento proxy.

## 2. Pruebas de Integración (Persistencia y Orquestación)
Verifican que la aplicación interactúa correctamente con los recursos externos (bases de datos, colas) levantando un contexto más real.

* **Microservicios (Java):**
  * **Herramientas:** Testcontainers (PostgreSQL).
  * **Alcance:** Repositorios de datos, sentencias SQL nativas, ORM (Hibernate) y control de concurrencia (Optimistic Locking).
  * **Problemas Conocidos (Workaround):** En entornos Linux basados en Alpine/Arch (como CachyOS) ejecutando Docker versión 29 o superior, `Testcontainers` puede fallar al interactuar con el Docker Socket (errores de parseo de versión o timeout). Si esto ocurre, la estrategia de mitigación es **bypassear las pruebas de integración con Testcontainers** temporalmente y realizar validaciones manuales End-to-End levantando el entorno completo mediante `docker compose up -d --build`.
* **API Gateway:**
  * **Herramientas:** Supertest + Jest.
  * **Alcance:** Verificar que el proxy responde correctamente simulando la respuesta de los microservicios subyacentes.
  * **Ejecución:** `cd backend/api-gateway && npm test`

### Ejecución de Pruebas Automatizadas
Para ejecutar las pruebas en tu máquina local, utiliza los siguientes comandos desde la raíz de cada microservicio respectivo:
- **API Gateway:** `npm test` (requiere `npm install` previo).
- **Servicios Java (Spring Boot):** `./mvnw test` (Testcontainers requiere que Docker esté en ejecución y compatible, de lo contrario se debe recurrir a validación manual E2E).

## 3. Pruebas End-to-End (E2E) y Contratos (API)
Pruebas que validan el flujo completo de la aplicación, entrando por el API Gateway y afectando la base de datos real en un entorno controlado (Docker Compose local).

* **Herramientas:** Bruno CLI / Postman.
* **Alcance:** 
  * Registro de usuario -> Obtención de Token -> Búsqueda de cartelera -> Selección de asientos -> Pago.
  * Validar códigos de estado HTTP (200, 201, 400, 401, 503) y estructuras JSON.
* **Ejecución:** Se almacenará una colección versionada de Bruno en el monorepo (ej. `/docs/bruno-collection`) para que cualquier desarrollador pueda ejecutar toda la suite de pruebas contra su Docker Compose local.
