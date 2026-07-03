package pe.edu.utp.cinestar.seat.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.cinestar.seat.domain.entities.Asiento;
import pe.edu.utp.cinestar.seat.domain.entities.Cupon;
import pe.edu.utp.cinestar.seat.domain.entities.Ticket;
import pe.edu.utp.cinestar.seat.domain.repositories.AsientoRepository;
import pe.edu.utp.cinestar.seat.domain.repositories.CuponRepository;
import pe.edu.utp.cinestar.seat.domain.repositories.TicketRepository;
import pe.edu.utp.cinestar.seat.model.dto.SeatResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final AsientoRepository asientoRepository;
    private final TicketRepository ticketRepository;
    private final CuponRepository cuponRepository;

    @Transactional
    public void preGenerateSeats(Long funcionId, Long salaId) {
        List<Asiento> asientos = asientoRepository.findBySalaId(salaId);
        if (asientos.isEmpty()) {
            throw new IllegalStateException("No hay asientos mapeados para la sala " + salaId);
        }

        List<Ticket> tickets = asientos.stream().map(asiento -> {
            Ticket ticket = new Ticket();
            ticket.setFuncionId(funcionId);
            ticket.setAsiento(asiento);
            ticket.setEstado("DISPONIBLE");
            return ticket;
        }).collect(Collectors.toList());

        ticketRepository.saveAll(tickets);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsMap(Long funcionId) {
        return ticketRepository.findByFuncionId(funcionId).stream().map(ticket -> {
            SeatResponse response = new SeatResponse();
            response.setTicketId(ticket.getId());
            response.setFila(ticket.getAsiento().getFilaButaca());
            response.setNumero(ticket.getAsiento().getNumeroButaca());
            response.setTipo(ticket.getAsiento().getTipo());
            response.setEstado(ticket.getEstado());
            return response;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void lockTicket(Long ticketId, Long usuarioId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado"));
                
        if (!"DISPONIBLE".equals(ticket.getEstado())) {
            throw new IllegalStateException("El ticket no está disponible");
        }

        ticket.setEstado("BLOQUEADO");
        ticket.setUsuarioId(usuarioId);
        ticket.setTiempoBloqueo(LocalDateTime.now().plusMinutes(5));
        ticketRepository.save(ticket);
    }

    @Transactional
    public void unlockTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado"));
                
        ticket.setEstado("DISPONIBLE");
        ticket.setUsuarioId(null);
        ticket.setTiempoBloqueo(null);
        ticketRepository.save(ticket);
    }

    @Transactional
    public void redeemCoupon(String codigo, List<Long> ticketIds) {
        Cupon cupon = cuponRepository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalArgumentException("Cupón inválido"));

        if (cupon.getUsado()) {
            throw new IllegalStateException("Cupón ya ha sido usado");
        }

        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        for (Ticket ticket : tickets) {
            if (!"DISPONIBLE".equals(ticket.getEstado()) && !"BLOQUEADO".equals(ticket.getEstado())) {
                throw new IllegalStateException("El ticket " + ticket.getId() + " no se puede canjear");
            }
            ticket.setEstado("VENDIDO");
            ticket.setUsuarioId(cupon.getUsuarioId());
            ticket.setTiempoBloqueo(null);
        }

        cupon.setUsado(true);
        cuponRepository.save(cupon);
        ticketRepository.saveAll(tickets);
    }

    @Transactional
    public void cancelSeats(Long funcionId) {
        List<Ticket> tickets = ticketRepository.findByFuncionId(funcionId);
        for (Ticket ticket : tickets) {
            ticket.setEstado("CANCELADO");
        }
        ticketRepository.saveAll(tickets);
    }
}
