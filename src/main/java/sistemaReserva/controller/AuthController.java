package sistemaReserva.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sistemaReserva.model.Usuario;
import sistemaReserva.repository.UsuarioRepository;
import sistemaReserva.security.JwtUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// Controlador para registro, login y consulta de usuarios
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint para registrar un usuario
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo ya esta registrado"));
        }

        if (usuario.getRol() == null || usuario.getRol().isBlank()) {
            usuario.setRol("CLIENTE");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario guardado = usuarioRepository.save(usuario);

        // Generar token JWT para el nuevo usuario
        String token = jwtUtil.generarToken(guardado.getEmail(), guardado.getRol());

        // Respuesta con token y datos basicos
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Usuario registrado correctamente");
        respuesta.put("token", token);
        respuesta.put("email", guardado.getEmail());
        respuesta.put("nombre", guardado.getNombre());
        respuesta.put("rol", guardado.getRol());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    // Endpoint para iniciar sesion y obtener token JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        Optional<Usuario> optionalUsuario = usuarioRepository.findByEmail(email);

        if (optionalUsuario.isEmpty() || !passwordEncoder.matches(password, optionalUsuario.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales incorrectas"));
        }

        Usuario usuario = optionalUsuario.get();

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol());

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("token", token);
        respuesta.put("email", usuario.getEmail());
        respuesta.put("nombre", usuario.getNombre());
        respuesta.put("apellido", usuario.getApellido());
        respuesta.put("rol", usuario.getRol());

        return ResponseEntity.ok(respuesta);
    }

    // Endpoint para consultar el perfil usando el token JWT
    @GetMapping("/perfil")
    public ResponseEntity<?> verPerfil(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Validar formato de la cabecera
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token no proporcionado"));
        }

        String token = authHeader.substring(7);

        // Validar token con JwtUtil
        if (!jwtUtil.validarToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token invalido o expirado"));
        }

        // Obtener email del token y buscar usuario
        String email = jwtUtil.obtenerEmail(token);
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);

        if (usuario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
        }

        // Ocultar contraseña en la respuesta
        Usuario u = usuario.get();
        u.setPassword(null);

        return ResponseEntity.ok(u);
    }

    // Endpoint para listar todos los usuarios (solo si el rol en el token es ADMIN)
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Validar formato de la cabecera
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token no proporcionado"));
        }

        String token = authHeader.substring(7);

        // Validar token y verificar rol
        if (!jwtUtil.validarToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token invalido"));
        }

        String rol = jwtUtil.obtenerRol(token);
        if (!"ADMIN".equals(rol)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Acceso denegado: requiere rol ADMIN"));
        }

        List<Usuario> usuarios = usuarioRepository.findAll();
        // Ocultar contraseñas antes de responder
        usuarios.forEach(u -> u.setPassword(null));

        return ResponseEntity.ok(usuarios);
    }
}
