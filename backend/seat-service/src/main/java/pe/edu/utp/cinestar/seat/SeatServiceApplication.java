package pe.edu.utp.cinestar.seat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class SeatServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeatServiceApplication.class, args);
    }

}
