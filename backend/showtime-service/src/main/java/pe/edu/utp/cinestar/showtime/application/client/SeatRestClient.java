package pe.edu.utp.cinestar.showtime.application.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import pe.edu.utp.cinestar.showtime.domain.exceptions.SeatGenerationFailedException;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class SeatRestClient {

    @Value("${seat.service.url:http://seat-service:8084/api/v1}")
    private String seatServiceUrl;

    private final RestTemplate restTemplate;

    public SeatRestClient() {
        this.restTemplate = new RestTemplate();
    }

    public void preGenerateSeats(Long funcionId, Integer capacidad) {
        URI uri = UriComponentsBuilder.fromUriString(seatServiceUrl + "/seats/generate")
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("funcion_id", funcionId);
        body.put("capacidad", capacidad);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.POST, requestEntity, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new SeatGenerationFailedException("El Seat Service respondió con status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new SeatGenerationFailedException("Error de orquestación al pre-generar butacas para la función " + funcionId, e);
        }
    }
    
    public void cancelSeats(Long funcionId) {
        URI uri = UriComponentsBuilder.fromUriString(seatServiceUrl + "/seats/cancel/" + funcionId)
                .build()
                .toUri();

        try {
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.DELETE, null, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new SeatGenerationFailedException("El Seat Service respondió con status: " + response.getStatusCode() + " al cancelar");
            }
        } catch (Exception e) {
            throw new SeatGenerationFailedException("Error de orquestación al cancelar butacas para la función " + funcionId, e);
        }
    }
}
