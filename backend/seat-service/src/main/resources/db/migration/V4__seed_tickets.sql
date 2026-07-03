-- ==========================================
-- MIGRATION: V4__seed_tickets.sql
-- Generado automaticamente para los seeders
-- ==========================================

INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 1, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 2, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 3, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 4, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 2;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 5, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 2;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 6, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 7, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 4;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 8, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 9, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 10, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 11, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 4;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 12, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 13, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 14, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 5;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 15, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 5;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 16, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 17, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 18, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 19, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 3;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 20, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 21, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 1;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 22, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 4;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 23, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 4;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 24, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 5;
INSERT INTO tickets (funcion_id, asientos_id, estado, version)
SELECT 25, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = 5;