package pe.edu.utp.cinestar.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pe.edu.utp.cinestar.auth_service.exception.BadRequestException;
import pe.edu.utp.cinestar.auth_service.model.dto.AuthResponse;
import pe.edu.utp.cinestar.auth_service.model.dto.LoginRequest;
import pe.edu.utp.cinestar.auth_service.model.dto.RegisterRequest;
import pe.edu.utp.cinestar.auth_service.model.entity.RoleEntity;
import pe.edu.utp.cinestar.auth_service.model.entity.UserEntity;
import pe.edu.utp.cinestar.auth_service.repository.RoleRepository;
import pe.edu.utp.cinestar.auth_service.repository.UserRepository;
import pe.edu.utp.cinestar.auth_service.security.JwtProvider;

import java.util.Set;
import java.util.stream.Collectors;

// Servicio encargado de gestionar la logica de autenticacion y registro de usuarios
// Actua como la capa de negocio que coordina la persistencia, encriptacion y generacion de tokens
@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtProvider jwtProvider;
        private final AuthenticationManager authenticationManager;

        // metodo para registrar un nuevo usuario
        // realiza validaciones de existencia, encripta la contraseña y asigna roles por
        // defecto
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("El correo electrónico ya está registrado");
                }

                // asignacion del rol por defecto
                RoleEntity role = roleRepository.findByNombre("ROLE_CLIENTE")
                                .orElseThrow(() -> new RuntimeException(
                                                "Rol 'ROLE_CLIENTE' no encontrado en la base de datos"));

                // creacion y mapeo del objeto request a una entidad usuario, aqui se hashea la
                // clave
                UserEntity user = UserEntity.builder()
                                .nombres(request.getNombres())
                                .apellidos(request.getApellidos())
                                .email(request.getEmail())
                                .contrasena(passwordEncoder.encode(request.getContrasena()))
                                .roles(Set.of(role))
                                .build();

                userRepository.save(user);

                // convertimos el set de roles a set de string (nombre de los roles) para el
                // token
                Set<String> roleNames = user.getRoles().stream()
                                .map(RoleEntity::getNombre)
                                .collect(Collectors.toSet());

                // generamos el jwt que el frontend almacenara
                String token = jwtProvider.generateToken(user.getEmail(), user.getUserId(), roleNames);

                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .roles(roleNames)
                                .build();
        }

        // valida las credenciales del usuario y emite un nuevo jwt
        // delega la verificacion de credenciales al AuthenticationManager de Spring
        // Security
        public AuthResponse login(LoginRequest request) {

                // este metodo usa el CustomUserDetailsService para verificar las credenciales
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getContrasena()));

                // si la autenticacion es exitosa recuperamos el usuario completo
                UserEntity user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                Set<String> roleNames = user.getRoles().stream()
                                .map(RoleEntity::getNombre)
                                .collect(Collectors.toSet());

                // generamos el jwt para esta sesion
                String token = jwtProvider.generateToken(user.getEmail(), user.getUserId(), roleNames);

                return AuthResponse.builder()
                                .token(token)
                                .email(user.getEmail())
                                .roles(roleNames)
                                .build();
        }
}
