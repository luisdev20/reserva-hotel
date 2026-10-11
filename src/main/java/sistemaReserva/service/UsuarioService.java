package sistemaReserva.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sistemaReserva.dto.AuthResponseDTO;
import sistemaReserva.dto.LoginRequestDTO;
import sistemaReserva.dto.RegisterRequestDTO;
import sistemaReserva.dto.UsuarioResponseDTO;
import sistemaReserva.model.Usuario;
import sistemaReserva.repository.UsuarioRepository;
import sistemaReserva.security.JwtUtil;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Capa de servicio para la gestión de usuarios y autenticación
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Registro de un nuevo usuario
    public AuthResponseDTO registrar(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        String rol = (dto.getRol() == null || dto.getRol().isBlank()) ? "CLIENTE" : dto.getRol().toUpperCase();

        Usuario nuevoUsuario = new Usuario(
                dto.getNombre(),
                dto.getApellido(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getTelefono(),
                rol
        );

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        String token = jwtUtil.generarToken(guardado.getEmail(), guardado.getRol());

        return new AuthResponseDTO(
                token,
                guardado.getId(),
                guardado.getEmail(),
                guardado.getNombre(),
                guardado.getApellido(),
                guardado.getRol(),
                "Usuario registrado exitosamente"
        );
    }

    // Inicio de sesión y verificación de credenciales
    public AuthResponseDTO login(LoginRequestDTO dto) {
        Optional<Usuario> optUsuario = usuarioRepository.findByEmail(dto.getEmail());

        if (optUsuario.isEmpty() || !passwordEncoder.matches(dto.getPassword(), optUsuario.get().getPassword())) {
            throw new IllegalArgumentException("Credenciales incorrectas (correo o contraseña)");
        }

        Usuario usuario = optUsuario.get();
        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol());

        return new AuthResponseDTO(
                token,
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getRol(),
                "Inicio de sesión exitoso"
        );
    }

    // Obtener perfil por email del usuario autenticado
    public UsuarioResponseDTO obtenerPerfilPorEmail(String email) {
        Usuario u = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con email: " + email));

        return new UsuarioResponseDTO(u.getId(), u.getNombre(), u.getApellido(), u.getEmail(), u.getTelefono(), u.getRol());
    }

    // Listar todos los usuarios para el panel de administración
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(u -> new UsuarioResponseDTO(u.getId(), u.getNombre(), u.getApellido(), u.getEmail(), u.getTelefono(), u.getRol()))
                .collect(Collectors.toList());
    }
}
