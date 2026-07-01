-- =======================================================================
-- MIGRATION: V2__seed_showtimes.sql
-- DESCRIPCIÓN: Inserta datos iniciales para salas, proyecciones y funciones.
-- FECHA BASE: Miércoles 1 de Julio de 2026
-- =======================================================================

-- 1. Insertar Salas
INSERT INTO salas (nombre, capacidad, estado) VALUES
('Sala 1 - IMAX', 250, 'ACTIVA'),
('Sala 2 - 4DX', 150, 'ACTIVA'),
('Sala 3 - 2D', 300, 'ACTIVA'),
('Sala 4 - 3D', 200, 'ACTIVA'),
('Sala 5 - VIP', 50, 'ACTIVA');


-- 3. Insertar Funciones

-- Spider-Man: Un nuevo día (Movie ID: 1, Duración: 120min) - IMAX y 4DX
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(1, 1, 3, '2026-07-02 15:00:00', '2026-07-02 17:00:00', 25.00, 'PROGRAMADA'),
(1, 1, 3, '2026-07-02 18:00:00', '2026-07-02 20:00:00', 25.00, 'PROGRAMADA'),
(1, 1, 3, '2026-07-02 21:00:00', '2026-07-02 23:00:00', 25.00, 'PROGRAMADA'),
(1, 2, 5, '2026-07-03 16:00:00', '2026-07-03 18:00:00', 30.00, 'PROGRAMADA'),
(1, 2, 5, '2026-07-04 16:00:00', '2026-07-04 18:00:00', 30.00, 'PROGRAMADA');

-- Supergirl (Movie ID: 2, Duración: 108min) - 2D y 3D
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(2, 3, 1, '2026-07-02 14:00:00', '2026-07-02 15:48:00', 15.00, 'PROGRAMADA'),
(2, 4, 2, '2026-07-02 17:00:00', '2026-07-02 18:48:00', 18.00, 'PROGRAMADA'),
(2, 3, 1, '2026-07-03 14:00:00', '2026-07-03 15:48:00', 15.00, 'PROGRAMADA');

-- Toy Story 5 (Movie ID: 3, Duración: 102min) - 2D y 3D DOB
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(3, 3, 1, '2026-07-02 10:00:00', '2026-07-02 11:42:00', 12.00, 'PROGRAMADA'),
(3, 3, 1, '2026-07-02 13:00:00', '2026-07-02 14:42:00', 12.00, 'PROGRAMADA'),
(3, 4, 2, '2026-07-02 16:00:00', '2026-07-02 17:42:00', 15.00, 'PROGRAMADA');

-- Scary Movie 6 (Movie ID: 4, RETIRADA)
-- No se añaden funciones

-- Minions & Monstruos (Movie ID: 5, Duración: 90min)
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(5, 3, 1, '2026-07-03 10:00:00', '2026-07-03 11:30:00', 12.00, 'PROGRAMADA'),
(5, 3, 1, '2026-07-03 12:30:00', '2026-07-03 14:00:00', 12.00, 'PROGRAMADA');

-- El día de la revelación (Movie ID: 6, Duración: 145min) - VIP
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(6, 5, 1, '2026-07-02 19:00:00', '2026-07-02 21:25:00', 40.00, 'PROGRAMADA'),
(6, 5, 1, '2026-07-02 22:00:00', '2026-07-03 00:25:00', 40.00, 'PROGRAMADA');

-- La Odisea (Movie ID: 7, Duración: 172min) - IMAX
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(7, 1, 3, '2026-07-03 15:00:00', '2026-07-03 17:52:00', 25.00, 'PROGRAMADA'),
(7, 1, 3, '2026-07-03 19:00:00', '2026-07-03 21:52:00', 25.00, 'PROGRAMADA');

-- Cantuta: La Orden Secreta (Movie ID: 8, Duración: 76min)
INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) VALUES
(8, 3, 1, '2026-07-02 21:00:00', '2026-07-02 22:16:00', 15.00, 'PROGRAMADA'),
(8, 3, 1, '2026-07-02 23:00:00', '2026-07-03 00:16:00', 15.00, 'PROGRAMADA');
