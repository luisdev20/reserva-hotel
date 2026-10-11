package sistemaReserva.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

// DTO para enviar la información de una reserva sin exponer entidades completas
public class ReservaResponseDTO {

    private Long id;
    private Long servicioId;
    private String servicioNombre;
    private Double servicioPrecio;
    private Long usuarioId;
    private String usuarioEmail;
    private String usuarioNombreCompleto;
    private LocalDate fechaEntrada;
    private LocalDate fechaSalida;
    private Double total;
    private String estado;
    private String notas;
    private LocalDateTime fechaCreacion;

    public ReservaResponseDTO() {
    }

    public ReservaResponseDTO(Long id, Long servicioId, String servicioNombre, Double servicioPrecio, Long usuarioId, String usuarioEmail, String usuarioNombreCompleto, LocalDate fechaEntrada, LocalDate fechaSalida, Double total, String estado, String notas, LocalDateTime fechaCreacion) {
        this.id = id;
        this.servicioId = servicioId;
        this.servicioNombre = servicioNombre;
        this.servicioPrecio = servicioPrecio;
        this.usuarioId = usuarioId;
        this.usuarioEmail = usuarioEmail;
        this.usuarioNombreCompleto = usuarioNombreCompleto;
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
        this.total = total;
        this.estado = estado;
        this.notas = notas;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getServicioId() {
        return servicioId;
    }

    public void setServicioId(Long servicioId) {
        this.servicioId = servicioId;
    }

    public String getServicioNombre() {
        return servicioNombre;
    }

    public void setServicioNombre(String servicioNombre) {
        this.servicioNombre = servicioNombre;
    }

    public Double getServicioPrecio() {
        return servicioPrecio;
    }

    public void setServicioPrecio(Double servicioPrecio) {
        this.servicioPrecio = servicioPrecio;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public String getUsuarioNombreCompleto() {
        return usuarioNombreCompleto;
    }

    public void setUsuarioNombreCompleto(String usuarioNombreCompleto) {
        this.usuarioNombreCompleto = usuarioNombreCompleto;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
