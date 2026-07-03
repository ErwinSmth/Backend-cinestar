package pe.edu.utp.cinestar.seat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.cinestar.seat.application.services.SeatService;
import pe.edu.utp.cinestar.seat.model.dto.CouponRedeemRequest;
import pe.edu.utp.cinestar.seat.model.dto.SeatLockRequest;
import pe.edu.utp.cinestar.seat.model.dto.SeatResponse;
import pe.edu.utp.cinestar.seat.model.dto.SeatUnlockRequest;

import java.util.List;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<List<SeatResponse>> getSeatsMap(@RequestParam Long funcionId) {
        return ResponseEntity.ok(seatService.getSeatsMap(funcionId));
    }

    @PostMapping("/lock")
    public ResponseEntity<Void> lockSeat(@RequestBody SeatLockRequest request) {
        seatService.lockTicket(request.getTicketId(), request.getUsuarioId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unlock")
    public ResponseEntity<Void> unlockSeat(@RequestBody SeatUnlockRequest request) {
        seatService.unlockTicket(request.getTicketId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/redeem-coupon")
    public ResponseEntity<Void> redeemCoupon(@RequestBody CouponRedeemRequest request) {
        seatService.redeemCoupon(request.getCodigo(), request.getTicketIds());
        return ResponseEntity.ok().build();
    }
}
