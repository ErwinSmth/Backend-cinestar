package pe.edu.utp.cinestar.showtime.domain.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class RoomConflictException extends RuntimeException {
    public RoomConflictException(String message) {
        super(message);
    }
}
