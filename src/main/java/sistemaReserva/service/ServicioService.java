package sistemaReserva.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sistemaReserva.dto.ServicioDTO;
import sistemaReserva.model.Categoria;
import sistemaReserva.model.Servicio;
import sistemaReserva.repository.CategoriaRepository;
import sistemaReserva.repository.ServicioRepository;

import java.util.List;
import java.util.stream.Collectors;

// Capa de servicio para la gestión de Servicios y Suites
@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

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
        servicioRepository.deleteById(id);
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
