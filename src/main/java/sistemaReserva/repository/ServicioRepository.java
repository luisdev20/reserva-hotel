package sistemaReserva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sistemaReserva.model.Servicio;

import java.time.LocalDate;
import java.util.List;

// Repositorio JPA para operaciones CRUD y consultas JPQL sobre servicios
@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    // Consulta derivada: listar solo los servicios disponibles
    List<Servicio> findByDisponibleTrue();

    // Consulta derivada: buscar servicios por categoría
    List<Servicio> findByCategoriaId(Long categoriaId);

    // Consulta básica con JPQL: filtrar servicios disponibles con precio menor o igual al indicado
    @Query("SELECT s FROM Servicio s WHERE s.disponible = true AND s.precio <= :precioMax ORDER BY s.precio ASC")
    List<Servicio> buscarDisponiblesPorPrecioMaximo(@Param("precioMax") Double precioMax);

    // Consulta JPQL: buscar servicios por coincidencia de texto en nombre o descripción
    @Query("SELECT s FROM Servicio s WHERE LOWER(s.nombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(s.descripcion) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<Servicio> buscarPorTermino(@Param("termino") String termino);

    // Consulta JPQL: servicios disponibles que no se cruzan con ninguna reserva activa.
    // Es la base del filtro "disponibles entre estas fechas".
    @Query("""
            SELECT s FROM Servicio s
            WHERE s.disponible = true
              AND NOT EXISTS (
                  SELECT r FROM Reserva r
                  WHERE r.servicio = s
                    AND r.estado <> 'CANCELADA'
                    AND r.fechaEntrada < :fechaSalida
                    AND r.fechaSalida > :fechaEntrada
              )
            ORDER BY s.precio ASC
            """)
    List<Servicio> buscarDisponiblesEnRango(
            @Param("fechaEntrada") LocalDate fechaEntrada,
            @Param("fechaSalida") LocalDate fechaSalida);

    // Variante con precio máximo para combinar ambos filtros.
    @Query("""
            SELECT s FROM Servicio s
            WHERE s.disponible = true
              AND s.precio <= :precioMax
              AND NOT EXISTS (
                  SELECT r FROM Reserva r
                  WHERE r.servicio = s
                    AND r.estado <> 'CANCELADA'
                    AND r.fechaEntrada < :fechaSalida
                    AND r.fechaSalida > :fechaEntrada
              )
            ORDER BY s.precio ASC
            """)
    List<Servicio> buscarDisponiblesEnRangoYPrecio(
            @Param("fechaEntrada") LocalDate fechaEntrada,
            @Param("fechaSalida") LocalDate fechaSalida,
            @Param("precioMax") Double precioMax);
}
