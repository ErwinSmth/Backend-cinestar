# Requerimientos del Sistema

## 1. Descripción del Proyecto
Este proyecto propone el desarrollo de un sistema web basado en microservicios para la gestión de venta de entradas de cine, integrando funcionalidades como cartelera, programación de funciones, selección de asientos y autenticación de usuarios. La solución busca optimizar la experiencia del cliente y mejorar la eficiencia operativa mediante el uso de tecnologías modernas como APIs REST, tokens JWT y procesamiento en tiempo real. Además, se enfoca en garantizar la seguridad, escalabilidad y disponibilidad del sistema.

## 2. Actores del Sistema y Necesidades

| Actor | Necesidad Principal | Impacto en el Negocio |
|---|---|---|
| **Cliente / Usuario Final** | Consultar la cartelera actualizada, horarios disponibles y seleccionar asientos en tiempo real sin errores de duplicidad. | Incremento en las ventas digitales y mejora drástica en la experiencia de usuario (UX). |
| **Administrador de Cine** | Gestionar el catálogo de películas (Movie Service) y configurar la asignación de salas y horarios (Showtime Service). | Optimización de la ocupación de las salas y control eficiente de la oferta comercial. |
| **Taquillero (Personal de Local)** | Acceso inmediato al inventario de asientos para ventas presenciales y validación de estados (Disponible/Vendido). | Reducción de colas en el cine físico y sincronización total con la venta online para evitar colisiones. |
| **Sistema de Pagos Externo** | Comunicación mediante API para confirmar transacciones y liberar o confirmar el bloqueo de asientos. | Seguridad financiera y reducción de "asientos perdidos" por procesos de pago inconclusos. |

## 3. Requerimientos Funcionales (RF)

### 3.1. Authentication Service (Servicio de Autenticación / Login)
| ID        | Requerimiento Específico   | Descripción                                                                               |
| --------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| **RF-01** | Registro de Usuarios       | El sistema debe permitir el registro de nuevos usuarios con datos básicos y credenciales. |
| **RF-02** | Inicio de Sesión           | Permitir a los usuarios autenticarse mediante usuario y contraseña.                       |
| **RF-03** | Validación de Credenciales | Verificar que las credenciales ingresadas sean correctas antes de otorgar acceso.         |
| **RF-04** | Generación de token JWT    | Generar un token de acceso seguro (JWT) al iniciar sesión correctamente.                  |
| **RF-05** | Gestión de Roles           | Asignar y validar roles de usuario (Administrador, Cliente, Taquillero).                  |
| **RF-06** | Cierre de Sesión           | Permitir al usuario cerrar sesión invalidando su token de acceso.                         |

### 3.2. Movie Service (Servicio de Películas)
| ID        | Requerimiento Específico   | Descripción                                                                     |
| --------- | -------------------------- | ------------------------------------------------------------------------------- |
| **RF-07** | Registro de Películas      | El sistema debe permitir registrar títulos, sinopsis, duración y clasificación. |
| **RF-08** | Actualización de Contenido | Permitir editar información de películas y recursos multimedia.                 |
| **RF-09** | Eliminación de Películas   | Permitir eliminar películas que ya no estén en cartelera.                       |
| **RF-10** | Gestión de Multimedia      | Permitir cargar imágenes, trailers y contenido relacionado.                     |
| **RF-11** | Consulta de Cartelera      | Permitir listar películas disponibles en tiempo real.                           |
| **RF-12** | Búsqueda y Filtro          | Permitir filtrar películas por género, duración o clasificación.                |
| **RF-13** | Cacheo de Consultas        | Proveer consultas rápidas mediante almacenamiento en caché (Redis).             |

### 3.3. Showtime Service (Servicio de Funciones)
| ID | Requerimiento Específico | Descripción |
|---|---|---|
| **RF-14** | Creación de Funciones | Permitir programar funciones asignando película, sala y horario. |
| **RF-15** | Modificación de Funciones | Permitir actualizar horarios o salas de funciones existentes. |
| **RF-16** | Eliminación de Funciones | Permitir eliminar funciones programadas. |
| **RF-17** | Validación de Horarios | Evitar traslapes de horarios en una misma sala. |
| **RF-18** | Asignación de Tecnología | Permitir definir tipo de proyección (2D, 3D, IMAX). |
| **RF-19** | Consulta de Funciones | Permitir visualizar funciones disponibles por fecha y película. |
| **RF-20** | Cancelación por Emergencia | Permitir forzar el mantenimiento de una sala, cancelando funciones activas (SAGA) e iniciando reembolsos y entrega de cupones de cortesía. |

### 3.4. Seat Inventory Service (Servicio de Asientos)
| ID | Requerimiento Específico | Descripción |
|---|---|---|
| **RF-20** | Visualización de Asientos | Mostrar el estado de asientos en tiempo real (Disponible/Ocupado). |
| **RF-21** | Selección de Asientos | Permitir al usuario seleccionar asientos disponibles. |
| **RF-22** | Bloqueo Temporal de Asientos | Reservar asientos temporalmente (Optimistic Locking/Redis) durante el proceso de pago. |
| **RF-23** | Liberación de Asientos | Liberar asientos si el pago no se completa en un tiempo determinado. |
| **RF-24** | Confirmación de Compra | Marcar asientos como ocupados tras pago exitoso. |
| **RF-25** | Sincronización en Tiempo Real | Actualizar el estado de asientos en la plataforma global. |

## 4. Requerimientos No Funcionales (RNF)

| Área Funcional | ID | Requerimiento Específico | Descripción |
|---|---|---|---|
| **Usabilidad** | **RNF-01** | Interfaz Adaptable (Responsive) | El sistema web debe renderizarse correctamente y mantener el 100% de operatividad en resoluciones móviles, tablets, escritorio y terminales de taquilla. |
| **Usabilidad** | **RNF-02** | Experiencia de Selección Visual | El mapa interactivo de butacas debe cargar su disponibilidad rápidamente garantizando renderización fluida. |
| **Seguridad** | **RNF-03** | Autenticación y Roles | Uso del estándar OAuth 2.0 y tokens JWT para validación stateless entre los microservicios, asegurando accesos por rol (RBAC). |
| **Seguridad** | **RNF-04** | Integridad y Cifrado | Todo el tráfico externo debe estar blindado bajo TLS 1.2+. Backups incrementales diarios de bases de datos. Contraseñas con BCrypt. |
| **Rendimiento** | **RNF-05** | Alta Concurrencia | El API Gateway debe soportar al menos 1000 peticiones concurrentes sin degradar el tiempo de respuesta por encima de 500ms. |
| **Infraestructura** | **RNF-06** | Contenedores (Docker) | Servicios backend y frontend aislados en imágenes Docker ligeras (Alpine Linux), facilitando la orquestación local con Docker Compose. |
| **Disponibilidad** | **RNF-07** | Tolerancia a Fallos Parciales | Si un servicio no crítico falla, el core transaccional de venta en Spring debe seguir operando con normalidad. |
