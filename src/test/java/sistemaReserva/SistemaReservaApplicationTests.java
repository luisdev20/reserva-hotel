package sistemaReserva;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import sistemaReserva.controller.AuthController;
import sistemaReserva.controller.ServicioController;
import sistemaReserva.dto.*;
import sistemaReserva.service.ServicioService;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SistemaReservaApplicationTests {

    @Autowired
    private AuthController authController;

    @Autowired
    private ServicioController servicioController;

    @Autowired
    private ServicioService servicioService;

    @Test
    void testLoginAdminExitoso() {
        LoginRequestDTO request = new LoginRequestDTO("admin@andessuites.com", "admin123");
        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponseDTO body = (AuthResponseDTO) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getToken());
        assertEquals("ADMIN", body.getRol());
    }

    @Test
    void testLoginCredencialesIncorrectas() {
        LoginRequestDTO request = new LoginRequestDTO("admin@andessuites.com", "claveErronea");
        ResponseEntity<?> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testRegistroNuevoUsuario() {
        RegisterRequestDTO nuevo = new RegisterRequestDTO(
                "Lucia",
                "Torres",
                "lucia.torres@example.com",
                "password123",
                "987111222",
                "CLIENTE"
        );

        ResponseEntity<?> response = authController.register(nuevo);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        AuthResponseDTO body = (AuthResponseDTO) response.getBody();
        assertNotNull(body);
        assertEquals("lucia.torres@example.com", body.getEmail());
    }

    @Test
    void testPerfilConToken() {
        // Simular autenticación en SecurityContext
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "cliente@andessuites.com",
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENTE"))
                )
        );

        ResponseEntity<?> perfilResponse = authController.verPerfil();
        assertEquals(HttpStatus.OK, perfilResponse.getStatusCode());
        UsuarioResponseDTO usuario = (UsuarioResponseDTO) perfilResponse.getBody();
        assertNotNull(usuario);
        assertEquals("cliente@andessuites.com", usuario.getEmail());

        // Limpiar contexto
        SecurityContextHolder.clearContext();
    }

    @Test
    void testListarServicios() {
        ResponseEntity<List<ServicioDTO>> response = servicioController.listar(false);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<ServicioDTO> servicios = response.getBody();
        assertNotNull(servicios);
        assertFalse(servicios.isEmpty(), "Deben existir servicios precargados en el sistema");
    }

    @Test
    void testConsultaJpqlServiciosPorPrecio() {
        List<ServicioDTO> resultado = servicioService.buscarDisponiblesPorPrecioMax(400.0);
        assertNotNull(resultado);
        for (ServicioDTO s : resultado) {
            assertTrue(s.getPrecio() <= 400.0);
            assertTrue(s.getDisponible());
        }
    }
}
