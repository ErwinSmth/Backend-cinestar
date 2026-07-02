-- V1__create_seats_tickets_coupons_schema.sql

-- Tabla Asientos (Inventario Físico)
CREATE TABLE asientos (
    asientos_id BIGSERIAL PRIMARY KEY,
    sala_id BIGINT NOT NULL,
    fila_butaca VARCHAR(10) NOT NULL,
    numero_butaca INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

-- Tabla Tickets (Inventario Transaccional / Concurrencia)
CREATE TABLE tickets (
    ticket_id BIGSERIAL PRIMARY KEY,
    funcion_id BIGINT NOT NULL,
    asientos_id BIGINT NOT NULL,
    usuario_id BIGINT,
    estado VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    tiempo_bloqueo TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_tickets_asientos FOREIGN KEY (asientos_id) REFERENCES asientos(asientos_id)
);

-- Índices para optimización de consultas (Roadmap point 1)
CREATE INDEX idx_tickets_funcion ON tickets(funcion_id);
CREATE INDEX idx_tickets_estado ON tickets(estado);

-- Tabla Cupones (Bypass de Pasarela y Compensaciones SAGA)
CREATE TABLE cupones (
    cupon_id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    usado BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_cupones_codigo ON cupones(codigo);
