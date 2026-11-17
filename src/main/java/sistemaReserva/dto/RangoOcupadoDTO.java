package sistemaReserva.dto;

import java.time.LocalDate;

// Rango de fechas en el que una suite ya está reservada.
// Se usa para bloquear días en el calendario del frontend.
public class RangoOcupadoDTO {

    private LocalDate fechaEntrada;
    private LocalDate fechaSalida;

    public RangoOcupadoDTO() {
    }

    public RangoOcupadoDTO(LocalDate fechaEntrada, LocalDate fechaSalida) {
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
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
}
