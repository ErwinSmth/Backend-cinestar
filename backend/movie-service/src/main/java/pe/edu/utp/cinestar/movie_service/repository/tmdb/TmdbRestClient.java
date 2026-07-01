package pe.edu.utp.cinestar.movie_service.repository.tmdb;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.net.URI;

@Service
public class TmdbRestClient {

    @Value("${tmdb.api.url}")
    private String apiUrl;

    @Value("${tmdb.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public TmdbRestClient(com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    private HttpEntity<String> getHttpEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);
        headers.set("accept", "application/json");
        return new HttpEntity<>(headers);
    }

    public JsonNode searchMovies(String query, String language) {
        URI uri = UriComponentsBuilder.fromUriString(apiUrl + "/search/movie")
                .queryParam("query", query)
                .queryParam("language", language)
                .build()
                .encode()
                .toUri();

        ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, getHttpEntity(), String.class);
        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Error parseando respuesta JSON de TMDB", e);
        }
    }

    public JsonNode getMovieDetails(int movieId, String appendToResponse, String language) {
        URI uri = UriComponentsBuilder.fromUriString(apiUrl + "/movie/" + movieId)
                .queryParam("append_to_response", appendToResponse)
                .queryParam("language", language)
                .queryParam("include_image_language", "es,en,null")
                .build()
                .encode()
                .toUri();

        ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, getHttpEntity(), String.class);
        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Error parseando respuesta JSON de TMDB", e);
        }
    }
}
