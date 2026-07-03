package pe.edu.utp.cinestar.auth_service.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Set;

// Componente de seguridad encargado del ciclo de vida de los JWT
// Fabrica tokens con credenciales, y valida que no hayan sido alterados en el camino
// asi como descifra la identidad del portador
@Slf4j // anotacion de lombok para usar en logs para errores
@Component // anotacion de spring para utilidades
public class JwtProvider {

    // Llave secreta y tiempo de vida util del jwt desde el archivo .properties
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Hashea la llave secreta
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Genera un nuevo jwt empaquetando la informacion del usuario
    public String generateToken(String email, Long userId, Set<String> roles) {
        return Jwts.builder()
                .setSubject(email)// propietario del token
                .claim("upn", email) // Nombre principal de usuario requerido por SmallRye JWT
                .claim("userId", userId) // Inyectamos el ID numerico
                .claim("groups", roles) // SmallRye usa 'groups' por defecto en lugar de 'roles'
                .claim("roles", roles) // Se mantiene para el validador del API Gateway
                .setIssuer("cinestar-auth") // Obligatorio según configuración de Quarkus
                .setIssuedAt(new Date())
                // calcula el momento en el que el token deja ser valido
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact(); // serializa todo esto en base64 para poder ser enviado
    }

    // Valida que el token recibido no haya sido alterado, expirado o falsificado
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);// intenta descifrar y validar la llave
            return true; // si no hay excepciones, el token es valido
        } catch (JwtException e) {
            log.error("Token JWT inválido: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Token JWT vacío o nulo: {}", e.getMessage());
        }
        return false;
    }

    // metodo a ser usado luego por el Filtro de Token despues de validar el jwt
    // para dejar ingresar al sistema al usuario con ese correo
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // usa la llave para descifrar
                .build()
                .parseClaimsJws(token) // abre el token
                .getBody() // obtiene los datos del token
                .getSubject(); // retorna el email
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("roles", List.class);
    }
}
