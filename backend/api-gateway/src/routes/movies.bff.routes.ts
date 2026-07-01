import { Router, type Request, type Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();

// Lógica reutilizable del BFF para agregar banderas
const fetchMoviesAndAggregate = async (movieServicePath: string, req: Request, res: Response) => {
    try {
        // Ejecutamos ambas peticiones en paralelo (movie-service y showtime-service)
        // Pasamos también el query string si existe (ej. ?genre=Accion)
        const queryString = req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : '';
        const basePath = movieServicePath === '/' ? '' : movieServicePath;
        const urlMovies = `${env.MOVIE_SERVICE_URL}/api/v1/movies${basePath}${queryString}`;
        const urlActiveMovies = `${env.SHOWTIME_SERVICE_URL}/api/v1/showtimes/movies/active`;

        const [moviesResponse, activeMoviesResponse] = await Promise.all([
            axios.get(urlMovies),
            axios.get(urlActiveMovies)
        ]);

        const movies = moviesResponse.data;
        // activeMoviesResponse.data es un array de numbers: [1, 5, 8]
        const activeMovieIds = new Set<number>(activeMoviesResponse.data);

        // Inyectamos los flags (Ocultamiento Inteligente y Hero Banner Reactivo)
        const enrichedMovies = movies.map((movie: any) => {
            const hasActive = activeMovieIds.has(movie.id);
            return {
                ...movie,
                hasActivePresale: movie.estado === 'PRE-ESTRENO' ? hasActive : false,
                hasActiveShowtimes: movie.estado === 'CARTELERA' ? hasActive : false
            };
        });

        res.json(enrichedMovies);
    } catch (error: any) {
        console.error('[BFF Error] Falló la agregación de películas:', error.message);
        // Si hay error, caemos en modo degradado devolviendo error 502 Bad Gateway
        res.status(502).json({
            timestamp: new Date().toISOString(),
            status: 502,
            error: 'Bad Gateway',
            message: 'Error al contactar los microservicios internos',
            path: req.path
        });
    }
};

// GET /api/v1/movies -> Cartelera
router.get('/', (req, res) => {
    fetchMoviesAndAggregate('/', req, res);
});

// GET /api/v1/movies/pre-estreno -> Próximos estrenos
router.get('/pre-estreno', (req, res) => {
    fetchMoviesAndAggregate('/pre-estreno', req, res);
});

export default router;
