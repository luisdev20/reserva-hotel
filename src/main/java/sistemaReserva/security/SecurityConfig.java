package sistemaReserva.security;

import org.h2.server.web.JakartaWebServlet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

// Configuración de Spring Security con autenticación JWT y roles
@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // Encriptador de contraseñas con BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Registro del servlet de la consola web de H2
    @Bean
    public ServletRegistrationBean<JakartaWebServlet> h2ServletRegistration() {
        ServletRegistrationBean<JakartaWebServlet> registration = new ServletRegistrationBean<>(new JakartaWebServlet());
        registration.addUrlMappings("/h2-console/*");
        return registration;
    }

    // Configuración de CORS para permitir peticiones desde Angular (localhost:4200)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Configuración de reglas de seguridad y protección de endpoints
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilitar CSRF para APIs REST con JWT
                .csrf(csrf -> csrf.disable())
                // Habilitar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Permitir visualización de la consola H2 en frames
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                // Sesiones sin estado (Stateless) porque usamos JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Reglas de autorización
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas de autenticación y consola H2
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        // Catálogo público de servicios y categorías (GET)
                        .requestMatchers(HttpMethod.GET, "/api/servicios/**", "/api/categorias/**").permitAll()
                        // Rutas exclusivas para ADMIN (crear, modificar o borrar servicios, listar usuarios y todas las reservas)
                        .requestMatchers(HttpMethod.POST, "/api/servicios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/servicios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/servicios/**").hasRole("ADMIN")
                        .requestMatchers("/api/auth/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservas").hasRole("ADMIN")
                        // Rutas para usuarios autenticados (Cliente o Admin)
                        .requestMatchers("/api/auth/perfil").authenticated()
                        .requestMatchers("/api/reservas/**").authenticated()
                        // Cualquier otra petición debe estar autenticada
                        .anyRequest().authenticated()
                )
                // Agregar filtro JWT antes del filtro de autenticación por defecto
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
