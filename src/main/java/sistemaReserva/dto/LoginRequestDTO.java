package sistemaReserva.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// DTO para recibir los datos de inicio de sesión
public class LoginRequestDTO {

    @NotBlank(message = "El email es requerido")
    @Email(message = "El formato de correo no es valido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;

    public LoginRequestDTO() {
    }

    public LoginRequestDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
