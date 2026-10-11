package sistemaReserva.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sistemaReserva.dto.ReservaDTO;
import sistemaReserva.dto.ReservaResponseDTO;
import sistemaReserva.service.ReservaService;

import java.util.List;
import java.util.Map;

// Controlador REST para la gestión de Reservas
@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    // Crear una nueva reserva para el usuario en sesión
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody ReservaDTO dto) {
        String email = obtenerEmailAutenticado();
        try {
            ReservaResponseDTO reserva = reservaService.crearReserva(email, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Listar las reservas del usuario actualmente autenticado (Cliente o Admin)
    @GetMapping("/mis-reservas")
    public ResponseEntity<List<ReservaResponseDTO>> listarMisReservas() {
        String email = obtenerEmailAutenticado();
        List<ReservaResponseDTO> misReservas = reservaService.listarMisReservas(email);
        return ResponseEntity.ok(misReservas);
    }

    // Listar todas las reservas del sistema (Solo ADMIN)
    @GetMapping
    public ResponseEntity<List<ReservaResponseDTO>> listarTodas() {
        List<ReservaResponseDTO> todas = reservaService.listarTodas();
        return ResponseEntity.ok(todas);
    }

    // Cancelar una reserva
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        String email = obtenerEmailAutenticado();
        boolean esAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        try {
            ReservaResponseDTO cancelada = reservaService.cancelarReserva(id, email, esAdmin);
            return ResponseEntity.ok(cancelada);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    private String obtenerEmailAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
