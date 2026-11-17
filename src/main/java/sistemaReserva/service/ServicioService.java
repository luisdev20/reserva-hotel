package sistemaReserva.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sistemaReserva.dto.RangoOcupadoDTO;
import sistemaReserva.dto.ServicioDTO;
import sistemaReserva.model.Categoria;
import sistemaReserva.model.Reserva;
import sistemaReserva.model.Servicio;
import sistemaReserva.repository.CategoriaRepository;
import sistemaReserva.repository.ReservaRepository;
import sistemaReserva.repository.ServicioRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// Capa de servicio para la gestión de Servicios y Suites
@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    // Listar todos los servicios
    public List<ServicioDTO> listarTodos() {
        return servicioRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Listar únicamente servicios disponibles
    public List<ServicioDTO> listarDisponibles() {
        return servicioRepository.findByDisponibleTrue().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Buscar servicio por ID
    public ServicioDTO obtenerPorId(Long id) {
        Servicio s = servicioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado con ID: " + id));
        return convertirADTO(s);
    }

    // Consulta personalizada con JPQL: filtrar por precio máximo
    public List<ServicioDTO> buscarDisponiblesPorPrecioMax(Double precioMax) {
        return servicioRepository.buscarDisponiblesPorPrecioMaximo(precioMax).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Consulta JPQL: buscar por término en nombre o descripción
    public List<ServicioDTO> buscarPorTermino(String termino) {
        return servicioRepository.buscarPorTermino(termino).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Servicios libres en un rango de fechas, opcionalmente con precio máximo.
    public List<ServicioDTO> buscarDisponiblesEnRango(LocalDate fechaEntrada, LocalDate fechaSalida, Double precioMax) {
        if (fechaEntrada == null || fechaSalida == null) {
            throw new IllegalArgumentException("Debes indicar la fecha de entrada y la fecha de salida");
        }
        if (fechaEntrada.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de entrada no puede ser anterior a hoy");
        }
        if (!fechaSalida.isAfter(fechaEntrada)) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada");
        }

        List<Servicio> servicios = precioMax != null
                ? servicioRepository.buscarDisponiblesEnRangoYPrecio(fechaEntrada, fechaSalida, precioMax)
                : servicioRepository.buscarDisponiblesEnRango(fechaEntrada, fechaSalida);

        return servicios.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Rangos ya reservados de un servicio para bloquearlos en el calendario.
    public List<RangoOcupadoDTO> listarFechasOcupadas(Long servicioId) {
        if (!servicioRepository.existsById(servicioId)) {
            throw new IllegalArgumentException("Servicio no encontrado con ID: " + servicioId);
        }

        return reservaRepository.findReservasActivasPorServicio(servicioId, LocalDate.now()).stream()
                .map(this::convertirARango)
                .collect(Collectors.toList());
    }

    // Crear un nuevo servicio
    public ServicioDTO crear(ServicioDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        Servicio servicio = new Servicio(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getPrecio(),
                dto.getCapacidad() != null ? dto.getCapacidad() : 2,
                dto.getImagenUrl(),
                dto.getDisponible() != null ? dto.getDisponible() : true,
                categoria
        );

        Servicio guardado = servicioRepository.save(servicio);
        return convertirADTO(guardado);
    }

    // Actualizar un servicio existente
    public ServicioDTO actualizar(Long id, ServicioDTO dto) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado con ID: " + id));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con ID: " + dto.getCategoriaId()));

        servicio.setNombre(dto.getNombre());
        servicio.setDescripcion(dto.getDescripcion());
        servicio.setPrecio(dto.getPrecio());
        servicio.setCapacidad(dto.getCapacidad());
        servicio.setImagenUrl(dto.getImagenUrl());
        if (dto.getDisponible() != null) {
            servicio.setDisponible(dto.getDisponible());
        }
        servicio.setCategoria(categoria);

        Servicio actualizado = servicioRepository.save(servicio);
        return convertirADTO(actualizado);
    }

    // Eliminar un servicio por ID
    public void eliminar(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new IllegalArgumentException("No se puede eliminar: servicio no encontrado con ID: " + id);
        }

        // Protege el historial: no se elimina una suite que ya tiene reservas.
        if (reservaRepository.existsByServicioId(id)) {
            throw new IllegalStateException(
                    "No se puede eliminar el servicio porque tiene reservas asociadas. " +
                    "Márcalo como no disponible en su lugar.");
        }

        servicioRepository.deleteById(id);
    }

    private RangoOcupadoDTO convertirARango(Reserva r) {
        return new RangoOcupadoDTO(r.getFechaEntrada(), r.getFechaSalida());
    }

    // Conversión de Entidad a DTO
    private ServicioDTO convertirADTO(Servicio s) {
        return new ServicioDTO(
                s.getId(),
                s.getNombre(),
                s.getDescripcion(),
                s.getPrecio(),
                s.getCapacidad(),
                s.getImagenUrl(),
                s.getDisponible(),
                s.getCategoria() != null ? s.getCategoria().getId() : null,
                s.getCategoria() != null ? s.getCategoria().getNombre() : null
        );
    }
}
