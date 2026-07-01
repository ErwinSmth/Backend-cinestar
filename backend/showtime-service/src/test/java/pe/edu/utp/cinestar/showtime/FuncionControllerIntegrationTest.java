package pe.edu.utp.cinestar.showtime;

import com.github.tomakehurst.wiremock.client.WireMock;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import pe.edu.utp.cinestar.showtime.model.dto.ProgramarFuncionRequest;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class FuncionControllerIntegrationTest extends IntegrationTestBase {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ProgramarFuncionRequest buildValidRequest(OffsetDateTime time) {
        ProgramarFuncionRequest req = new ProgramarFuncionRequest();
        req.setMovieId(10L);
        req.setSalaId(1L); // Asume que la Sala 1 existe (V1__create_showtime_schema inserta proyecciones, deberíamos insertar una sala si no existe en el script init)
        req.setProyeccionId(1); // 2D
        req.setFechaInicio(time);
        req.setDuracionMin(120);
        req.setPrecioTicket(BigDecimal.valueOf(15.50));
        return req;
    }

    private void ensureSalaExists() {
        // Asegurar que exista la sala 1 por si Flyway no la crea (el script inicial solo crea tabla y proyecciones)
        jdbcTemplate.execute("INSERT INTO salas (sala_id, nombre, capacidad, estado) VALUES (1, 'Sala 1', 100, 'ACTIVA') ON CONFLICT (sala_id) DO NOTHING;");
    }

    @Test
    @DisplayName("Scenario 1: Programación exitosa y Pre-generación orquestada")
    void testSuccessfulScheduling() {
        ensureSalaExists();
        OffsetDateTime startTime = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).withHour(14).withMinute(0);
        ProgramarFuncionRequest request = buildValidRequest(startTime);

        // Mocking Seat Service (Éxito)
        stubFor(post(urlEqualTo("/api/v1/seats/generate"))
                .willReturn(aResponse()
                        .withStatus(201)));

        given()
                .contentType(ContentType.JSON)
                .header("X-User-Role", "ROLE_ADMINISTRADOR") // Simulando Auth Filter
                .header("X-User-Id", "admin123")
                .body(request)
        .when()
                .post("/api/v1/showtimes")
        .then()
                .statusCode(201);

        // Verificamos en BD
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM funcion WHERE movie_id = 10", Integer.class);
        assertEquals(1, count, "La función debería haberse guardado en la BD.");

        // Verificamos que SeatService fue llamado
        verify(1, postRequestedFor(urlEqualTo("/api/v1/seats/generate")));
    }

    @Test
    @DisplayName("Scenario 2: Solapamiento de horarios (Anti-Overlap)")
    void testOverlapFails() {
        ensureSalaExists();
        OffsetDateTime startTime = OffsetDateTime.now(ZoneOffset.UTC).plusDays(2).withHour(15).withMinute(0);
        
        // Insertamos manualmente una función previa (15:00 a 17:30)
        jdbcTemplate.update("INSERT INTO funcion (movie_id, sala_id, proyeccion_id, fecha_inicio, fecha_fin, precio_ticket, status) " +
                "VALUES (10, 1, 1, ?, ?, 15.50, 'PROGRAMADA')", 
                startTime, startTime.plusMinutes(150));

        // Intentamos insertar a las 16:00 (dentro del mismo bloque)
        ProgramarFuncionRequest request = buildValidRequest(startTime.plusMinutes(60));

        given()
                .contentType(ContentType.JSON)
                .header("X-User-Role", "ROLE_ADMINISTRADOR")
                .header("X-User-Id", "admin123")
                .body(request)
        .when()
                .post("/api/v1/showtimes")
        .then()
                .statusCode(409)
                .body("status", equalTo(409))
                .body("error", equalTo("Conflict"));
        
        // Wiremock NUNCA debe haber sido llamado, ya que la validación falla antes.
        verify(0, postRequestedFor(urlEqualTo("/api/v1/seats/generate")));
    }

    @Test
    @DisplayName("Scenario 3: Fallo de Orquestación (Rollback Transaccional)")
    void testSeatServiceFailureCausesRollback() {
        ensureSalaExists();
        OffsetDateTime startTime = OffsetDateTime.now(ZoneOffset.UTC).plusDays(3).withHour(20).withMinute(0);
        ProgramarFuncionRequest request = buildValidRequest(startTime);

        // Mocking Seat Service (Fallo Crítico 500)
        stubFor(post(urlEqualTo("/api/v1/seats/generate"))
                .willReturn(aResponse()
                        .withStatus(500)));

        given()
                .contentType(ContentType.JSON)
                .header("X-User-Role", "ROLE_ADMINISTRADOR")
                .header("X-User-Id", "admin123")
                .body(request)
        .when()
                .post("/api/v1/showtimes")
        .then()
                .statusCode(500)
                .body("status", equalTo(500));

        // Verificamos el ROLLBACK en la BD (la función de esta película no debe existir para el día 3)
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM funcion WHERE movie_id = 10 AND fecha_inicio = ?", Integer.class, startTime);
        assertEquals(0, count, "No debería existir la función en BD por el Rollback automático.");
    }
}
