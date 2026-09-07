package sistemaReserva.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sistemaReserva.model.Usuario;
import sistemaReserva.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!usuarioRepository.existsByEmail("admin@andessuites.com")) {
            Usuario admin = new Usuario(
                    "Administrador",
                    "Principal",
                    "admin@andessuites.com",
                    passwordEncoder.encode("admin123"),
                    "987654321",
                    "ADMIN");
            usuarioRepository.save(admin);
        }

        if (!usuarioRepository.existsByEmail("cliente@andessuites.com")) {
            Usuario cliente = new Usuario(
                    "Carlos",
                    "Mendoza",
                    "cliente@andessuites.com",
                    passwordEncoder.encode("cliente123"),
                    "912345678",
                    "CLIENTE");
            usuarioRepository.save(cliente);
        }
    }
}
