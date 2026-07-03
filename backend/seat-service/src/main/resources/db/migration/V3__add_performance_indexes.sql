-- =======================================================================
-- MIGRATION: V3__add_performance_indexes.sql
-- DESCRIPCIÓN: Agrega índices a la tabla tickets para consultas rápidas
-- =======================================================================

DROP INDEX IF EXISTS idx_tickets_funcion;
DROP INDEX IF EXISTS idx_tickets_estado;

CREATE INDEX idx_tickets_funcion_estado ON tickets (funcion_id, estado);
