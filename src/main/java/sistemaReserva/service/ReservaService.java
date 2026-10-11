package sistemaReserva.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sistemaReserva.dto.ReservaDTO;
import sistemaReserva.dto.ReservaResponseDTO;
import sistemaReserva.model.Reserva;
import sistemaReserva.model.Servicio;
import sistemaReserva.model.Usuario;
import sistemaReserva.repository.ReservaRepository;
import sistemaReserva.repository.ServicioRepository;
import sistemaReserva.repository.UsuarioRepository;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

// Capa de servicio para la gestión de Reservas
@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear una nueva reserva para el usuario autenticado
    public ReservaResponseDTO crearReserva(String userEmail, ReservaDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con email: " + userEmail));

        Servicio servicio = servicioRepository.findById(dto.getServicioId())
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado con ID: " + dto.getServicioId()));

        if (!servicio.getDisponible()) {
            throw new IllegalStateException("El servicio o suite seleccionado no se encuentra disponible actualmente");
        }

        if (dto.getFechaSalida().isBefore(dto.getFechaEntrada()) || dto.getFechaSalida().isEqual(dto.getFechaEntrada())) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        long noches = ChronoUnit.DAYS.between(dto.getFechaEntrada(), dto.getFechaSalida());
        if (noches < 1) {
            noches = 1;
        }

        double total = noches * servicio.getPrecio();

        Reserva nuevaReserva = new Reserva(
                dto.getFechaEntrada(),
                dto.getFechaSalida(),
                total,
                "CONFIRMADA",
                dto.getNotas(),
                usuario,
                servicio
        );

        Reserva guardada = reservaRepository.save(nuevaReserva);
        return convertirADTO(guardada);
    }

    // Listar todas las reservas (para ADMIN)
    public List<ReservaResponseDTO> listarTodas() {
        return reservaRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Listar las reservas del usuario autenticado utilizando consulta JPQL
    public List<ReservaResponseDTO> listarMisReservas(String userEmail) {
        return reservaRepository.findByUsuarioEmail(userEmail).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Cancelar una reserva
    public ReservaResponseDTO cancelarReserva(Long reservaId, String userEmail, boolean esAdmin) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + reservaId));

        // Verificar que pertenezca al usuario o que sea admin
        if (!esAdmin && !reserva.getUsuario().getEmail().equalsIgnoreCase(userEmail)) {
            throw new SecurityException("No tiene permisos para cancelar esta reserva");
        }

        reserva.setEstado("CANCELADA");
        Reserva actualizada = reservaRepository.save(reserva);
        return convertirADTO(actualizada);
    }

    // Conversión de Entidad a DTO
    private ReservaResponseDTO convertirADTO(Reserva r) {
        String nombreCompleto = r.getUsuario().getNombre() + (r.getUsuario().getApellido() != null ? " " + r.getUsuario().getApellido() : "");
        return new ReservaResponseDTO(
                r.getId(),
                r.getServicio().getId(),
                r.getServicio().getNombre(),
                r.getServicio().getPrecio(),
                r.getUsuario().getId(),
                r.getUsuario().getEmail(),
                nombreCompleto,
                r.getFechaEntrada(),
                r.getFechaSalida(),
                r.getTotal(),
                r.getEstado(),
                r.getNotas(),
                r.getFechaCreacion()
        );
    }
}
