package sistemaReserva.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sistemaReserva.model.Reserva;

import java.util.List;

// Repositorio JPA para operaciones y consultas JPQL sobre reservas
@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Consulta derivada por id de usuario
    List<Reserva> findByUsuarioId(Long usuarioId);

    // Consulta básica con JPQL: obtener reservas de un usuario mediante su email ordenadas cronológicamente
    @Query("SELECT r FROM Reserva r WHERE r.usuario.email = :email ORDER BY r.fechaCreacion DESC")
    List<Reserva> findByUsuarioEmail(@Param("email") String email);

    // Consulta JPQL: buscar reservas por estado
    @Query("SELECT r FROM Reserva r WHERE r.estado = :estado ORDER BY r.fechaEntrada ASC")
    List<Reserva> findByEstado(@Param("estado") String estado);
}
