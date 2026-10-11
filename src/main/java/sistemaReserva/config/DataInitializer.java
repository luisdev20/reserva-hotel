package sistemaReserva.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import sistemaReserva.model.Categoria;
import sistemaReserva.model.Reserva;
import sistemaReserva.model.Servicio;
import sistemaReserva.model.Usuario;
import sistemaReserva.repository.CategoriaRepository;
import sistemaReserva.repository.ReservaRepository;
import sistemaReserva.repository.ServicioRepository;
import sistemaReserva.repository.UsuarioRepository;

import java.time.LocalDate;

// Precarga automática de datos para pruebas inmediatas del Hotel Andes Suites
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Precarga de Categorías
        Categoria catSuites = categoriaRepository.findByNombre("Suites")
                .orElseGet(() -> categoriaRepository.save(new Categoria("Suites", "Habitaciones exclusivas con vistas a la cordillera")));

        Categoria catBienestar = categoriaRepository.findByNombre("Bienestar y Spa")
                .orElseGet(() -> categoriaRepository.save(new Categoria("Bienestar y Spa", "Circuitos de aguas termales y relajación")));

        Categoria catGastronomia = categoriaRepository.findByNombre("Gastronomía")
                .orElseGet(() -> categoriaRepository.save(new Categoria("Gastronomía", "Experiencias culinarias andinas de altura")));

        // 2. Precarga de Servicios / Suites (Andes Suites)
        if (servicioRepository.count() == 0) {
            Servicio s1 = new Servicio(
                    "Suite Cordillera",
                    "Habitación cálida con vista parcial a la montaña, cama King y baño privado en mármol.",
                    320.0,
                    2,
                    "assets/img/suite-cordillera.jpg",
                    true,
                    catSuites
            );

            Servicio s2 = new Servicio(
                    "Suite Andina",
                    "Espacio ampliado con sala de estar independiente, chimenea ecológica y vista panorámica frontal.",
                    480.0,
                    3,
                    "assets/img/suite-andina.jpg",
                    true,
                    catSuites
            );

            Servicio s3 = new Servicio(
                    "Suite Cumbre Presidencial",
                    "Terraza privada con hidromasaje exterior y atención personalizada 24/7.",
                    750.0,
                    4,
                    "assets/img/suite-cumbre.jpg",
                    true,
                    catSuites
            );

            Servicio s4 = new Servicio(
                    "Circuito Spa & Aguas Termales",
                    "Sesión terapéutica con aguas minerales naturales andinas, sauna seco y aromaterapia.",
                    150.0,
                    2,
                    "assets/img/spa.jpg",
                    true,
                    catBienestar
            );

            Servicio s5 = new Servicio(
                    "Cena Degustación de Altura",
                    "Menú de 5 tiempos con ingredientes nativos y maridaje de vinos de altura.",
                    120.0,
                    2,
                    "assets/img/restaurante.jpg",
                    true,
                    catGastronomia
            );

            servicioRepository.save(s1);
            servicioRepository.save(s2);
            servicioRepository.save(s3);
            servicioRepository.save(s4);
            servicioRepository.save(s5);
        }

        // 3. Precarga de Usuarios de prueba
        Usuario admin = null;
        if (!usuarioRepository.existsByEmail("admin@andessuites.com")) {
            admin = new Usuario(
                    "Administrador",
                    "Principal",
                    "admin@andessuites.com",
                    passwordEncoder.encode("admin123"),
                    "987654321",
                    "ADMIN");
            admin = usuarioRepository.save(admin);
        } else {
            admin = usuarioRepository.findByEmail("admin@andessuites.com").orElse(null);
        }

        Usuario cliente = null;
        if (!usuarioRepository.existsByEmail("cliente@andessuites.com")) {
            cliente = new Usuario(
                    "Carlos",
                    "Mendoza",
                    "cliente@andessuites.com",
                    passwordEncoder.encode("cliente123"),
                    "912345678",
                    "CLIENTE");
            cliente = usuarioRepository.save(cliente);
        } else {
            cliente = usuarioRepository.findByEmail("cliente@andessuites.com").orElse(null);
        }

        // 4. Precarga de Reserva inicial de ejemplo
        if (reservaRepository.count() == 0 && cliente != null) {
            Servicio suiteAndina = servicioRepository.findAll().stream()
                    .filter(s -> s.getNombre().contains("Andina"))
                    .findFirst()
                    .orElse(null);

            if (suiteAndina != null) {
                Reserva reservaEjemplo = new Reserva(
                        LocalDate.now().plusDays(3),
                        LocalDate.now().plusDays(6),
                        1440.0,
                        "CONFIRMADA",
                        "Huésped solicita check-in temprano",
                        cliente,
                        suiteAndina
                );
                reservaRepository.save(reservaEjemplo);
            }
        }
    }
}
