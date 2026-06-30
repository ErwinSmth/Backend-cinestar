package pe.edu.utp.cinestar.showtime.domain.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class SeatGenerationFailedException extends RuntimeException {
    public SeatGenerationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public SeatGenerationFailedException(String message) {
        super(message);
    }
}
