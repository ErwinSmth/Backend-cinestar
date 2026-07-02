package pe.edu.utp.cinestar.showtime.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.utp.cinestar.showtime.application.services.FuncionService;
import pe.edu.utp.cinestar.showtime.model.dto.FuncionResponse;
import pe.edu.utp.cinestar.showtime.model.dto.ProgramarFuncionRequest;
import pe.edu.utp.cinestar.showtime.model.dto.ProyeccionResponse;
import pe.edu.utp.cinestar.showtime.model.dto.SalaResponse;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class FuncionController {

    private final FuncionService funcionService;

    @GetMapping
    public ResponseEntity<List<FuncionResponse>> getShowtimesByDate(@RequestParam("fecha") String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        return ResponseEntity.ok(funcionService.getShowtimesByDate(fecha));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    public ResponseEntity<String> programarFuncion(@RequestBody ProgramarFuncionRequest request) {
        Long id = funcionService.programarFuncion(request);
        return ResponseEntity.created(URI.create("/showtimes/" + id)).build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    public ResponseEntity<List<FuncionResponse>> getAllShowtimesAdmin(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "salaId", required = false) Long salaId) {
        return ResponseEntity.ok(funcionService.getAllShowtimesAdmin(status, salaId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> cancelShowtime(@PathVariable("id") Long id) {
        funcionService.cancelarFuncion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/salas")
    public ResponseEntity<List<SalaResponse>> getSalas() {
        return ResponseEntity.ok(funcionService.getSalasActivas());
    }

    @GetMapping("/proyecciones")
    public ResponseEntity<List<ProyeccionResponse>> getProyecciones() {
        return ResponseEntity.ok(funcionService.getProyecciones());
    }

    @GetMapping("/movies/active")
    public ResponseEntity<List<Long>> getActiveMovieIds() {
        return ResponseEntity.ok(funcionService.getActiveMovieIds());
    }

    @PatchMapping("/salas/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMINISTRADOR')")
    public ResponseEntity<Void> updateSalaStatus(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        funcionService.updateSalaStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
