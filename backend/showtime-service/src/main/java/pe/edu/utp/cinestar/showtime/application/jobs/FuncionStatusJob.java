package pe.edu.utp.cinestar.showtime.application.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.cinestar.showtime.domain.repositories.FuncionRepository;

@Component
public class FuncionStatusJob {

    private static final Logger log = LoggerFactory.getLogger(FuncionStatusJob.class);
    private final FuncionRepository funcionRepository;
    private final CacheManager cacheManager;

    public FuncionStatusJob(FuncionRepository funcionRepository, CacheManager cacheManager) {
        this.funcionRepository = funcionRepository;
        this.cacheManager = cacheManager;
    }

    // Se ejecuta en el segundo 0 de cada minuto
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateFuncionStatuses() {
        try {
            int enCursoCount = funcionRepository.updateToEnCurso();
            int finalizadaCount = funcionRepository.updateToFinalizada();

            if (enCursoCount > 0 || finalizadaCount > 0) {
                log.info("Cron Job ejecutado. Funciones iniciadas (EN_CURSO): {}, Funciones terminadas (FINALIZADA): {}", enCursoCount, finalizadaCount);
                
                // Evicción manual de la caché para garantizar la actualización en vivo
                if (cacheManager.getCache("showtimes") != null) {
                    cacheManager.getCache("showtimes").clear();
                    log.info("Caché 'showtimes' limpiada exitosamente por cambio de estado.");
                }
            }
        } catch (Exception e) {
            log.error("Error ejecutando el Cron Job de actualización de estados de funciones", e);
        }
    }
}
