package sistemaReserva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sistemaReserva.model.Servicio;

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
}
