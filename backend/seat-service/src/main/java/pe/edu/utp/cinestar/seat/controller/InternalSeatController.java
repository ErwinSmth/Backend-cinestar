package pe.edu.utp.cinestar.seat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.cinestar.seat.application.services.SeatService;
import pe.edu.utp.cinestar.seat.model.dto.SeatCancelRequest;
import pe.edu.utp.cinestar.seat.model.dto.SeatGenerateRequest;

@RestController
@RequestMapping("/seats/internal")
@RequiredArgsConstructor
public class InternalSeatController {

    private final SeatService seatService;

    @PostMapping("/generate")
    public ResponseEntity<Void> generateSeats(@RequestBody SeatGenerateRequest request) {
        seatService.preGenerateSeats(request.getFuncionId(), request.getSalaId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSeats(@RequestBody SeatCancelRequest request) {
        seatService.cancelSeats(request.getFuncionId());
        return ResponseEntity.ok().build();
    }
}
