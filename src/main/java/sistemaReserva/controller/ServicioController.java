package sistemaReserva.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sistemaReserva.dto.RangoOcupadoDTO;
import sistemaReserva.dto.ServicioDTO;
import sistemaReserva.service.ServicioService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// Controlador REST para la gestión de Servicios y Suites (CRUD completo)
@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "*")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    // 1. Listar todos los servicios (o solo disponibles con ?soloDisponibles=true)
    @GetMapping
    public ResponseEntity<List<ServicioDTO>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean soloDisponibles) {
        List<ServicioDTO> servicios = soloDisponibles
                ? servicioService.listarDisponibles()
                : servicioService.listarTodos();
        return ResponseEntity.ok(servicios);
    }

    // 2. Obtener un servicio por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            ServicioDTO servicio = servicioService.obtenerPorId(id);
            return ResponseEntity.ok(servicio);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 3. Consultas personalizadas: precio, texto o disponibilidad por fechas.
    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) String q,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaEntrada,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaSalida) {

        // Si se envía una sola fecha, la petición no es ambigua.
        if ((fechaEntrada == null) != (fechaSalida == null)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Debes indicar la fecha de entrada y la fecha de salida"));
        }

        try {
            if (fechaEntrada != null && fechaSalida != null) {
                return ResponseEntity.ok(
                        servicioService.buscarDisponiblesEnRango(fechaEntrada, fechaSalida, precioMax));
            }
            if (precioMax != null) {
                return ResponseEntity.ok(servicioService.buscarDisponiblesPorPrecioMax(precioMax));
            }
            if (q != null && !q.isBlank()) {
                return ResponseEntity.ok(servicioService.buscarPorTermino(q));
            }
            return ResponseEntity.ok(servicioService.listarDisponibles());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3.1. Rangos ocupados de una suite para pintar el calendario del cliente.
    @GetMapping("/{id}/ocupacion")
    public ResponseEntity<?> ocupacion(@PathVariable Long id) {
        try {
            List<RangoOcupadoDTO> rangos = servicioService.listarFechasOcupadas(id);
            return ResponseEntity.ok(rangos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 4. Crear un nuevo servicio (Requiere rol ADMIN en Spring Security)
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody ServicioDTO dto) {
        try {
            ServicioDTO creado = servicioService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 5. Actualizar un servicio existente (Requiere rol ADMIN en Spring Security)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody ServicioDTO dto) {
        try {
            ServicioDTO actualizado = servicioService.actualizar(id, dto);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Eliminar un servicio (Requiere rol ADMIN en Spring Security)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            servicioService.eliminar(id);
            return ResponseEntity.ok(Map.of("mensaje", "Servicio eliminado exitosamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }
}
