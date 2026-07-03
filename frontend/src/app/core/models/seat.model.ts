export interface SeatResponse {
  ticketId: number;
  fila: string;
  numero: number;
  tipo: string;
  estado: 'DISPONIBLE' | 'BLOQUEADO' | 'VENDIDO' | 'CANCELADO';
}

export interface SeatLockRequest {
  ticketId: number;
  usuarioId: number;
}

export interface SeatUnlockRequest {
  ticketId: number;
}
