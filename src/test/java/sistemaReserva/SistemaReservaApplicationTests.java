package sistemaReserva;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import sistemaReserva.controller.AuthController;
import sistemaReserva.model.Usuario;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

// Pruebas directas de los endpoints de autenticacion
@SpringBootTest
class SistemaReservaApplicationTests {

    @Autowired
    private AuthController authController;

    @Test
    void testLoginAdminExitoso() {
        // Probar inicio de sesion con admin precargado
        ResponseEntity<?> response = authController.login(Map.of(
                "email", "admin@andessuites.com",
                "password", "admin123"
        ));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body.get("token"));
        assertEquals("ADMIN", body.get("rol"));
    }

    @Test
    void testLoginCredencialesIncorrectas() {
        // Probar login con clave incorrecta
        ResponseEntity<?> response = authController.login(Map.of(
                "email", "admin@andessuites.com",
                "password", "claveErronea"
        ));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testRegistroNuevoUsuario() {
        // Probar registro de un cliente nuevo
        Usuario nuevo = new Usuario(
                "Lucia",
                "Torres",
                "lucia.torres@example.com",
                "password123",
                "987111222",
                "CLIENTE"
        );

        ResponseEntity<?> response = authController.register(nuevo);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testPerfilConToken() {
        // 1. Obtener token
        ResponseEntity<?> loginResponse = authController.login(Map.of(
                "email", "cliente@andessuites.com",
                "password", "cliente123"
        ));
        Map<?, ?> body = (Map<?, ?>) loginResponse.getBody();
        String token = (String) body.get("token");

        // 2. Consultar perfil con el token
        ResponseEntity<?> perfilResponse = authController.verPerfil("Bearer " + token);
        assertEquals(HttpStatus.OK, perfilResponse.getStatusCode());
        Usuario usuario = (Usuario) perfilResponse.getBody();
        assertEquals("cliente@andessuites.com", usuario.getEmail());
    }
}
