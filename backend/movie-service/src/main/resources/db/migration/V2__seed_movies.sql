-- =======================================================================
-- MIGRATION: V2__seed_movies.sql
-- DESCRIPCIÓN: Inserta películas iniciales obtenidas desde TMDB.
-- =======================================================================

-- 1. Spider-Man: Un nuevo día (PRE-ESTRENO)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   969681, 
   'Spider-Man: Un nuevo día', 
   'A medida qué Spider-Man está en la cima de su carrera protegiendo la ciudad de Nueva York, una serie de crímenes inusuales lo arrastran a una red de misterios más grande de lo que jamás haya enfrentado.', 
   120, 
   '2026-07-29', 
   'PRE-ESTRENO', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '12+'), 
   '{
      "director": "Destin Daniel Cretton",
      "posterPath": "https://image.tmdb.org/t/p/w500/fBFjaDWfNslvrs6bJjknmG27wOS.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/vjMvFSmGUxEtqVdaZgvFee9XkZl.jpg",
      "actores": ["Tom Holland", "Zendaya", "Sadie Sink", "Jacob Batalon", "Jon Bernthal"],
      "generos": ["Acción", "Aventura", "Ciencia ficción"],
      "trailers": [
        "https://www.youtube.com/watch?v=Pw1X-57Ms-8",
        "https://www.youtube.com/watch?v=br1HPlYo8y0"
      ]
   }'::jsonb
);

-- 2. Supergirl (CARTELERA)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1081003, 
   'Supergirl', 
   'Mientras celebra su cumpleaños número 21, Kara Zor-El viaja por la galaxia con su perro Krypto, durante el cual conoce a la joven Ruthye Marye Knoll y emprende una "búsqueda asesina de venganza".', 
   108, 
   '2026-06-24', 
   'CARTELERA', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '14+'), 
   '{
      "director": "Craig Gillespie",
      "posterPath": "https://image.tmdb.org/t/p/w500/diEz9JG1UHEDTN0Yeri5sJZD7PL.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/vk5IwZNS35wh6rNmqB1ns6XuiyI.jpg",
      "actores": ["Milly Alcock", "Eve Ridley", "Matthias Schoenaerts", "Jason Momoa", "David Krumholtz"],
      "generos": ["Acción", "Aventura", "Ciencia ficción"],
      "trailers": [
        "https://www.youtube.com/watch?v=VfUVEB0IpYk"
      ]
   }'::jsonb
);

-- 3. Toy Story 5 (CARTELERA)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1084244, 
   'Toy Story 5', 
   'Cuando Woody logra regresar con Buzz, Jessie y el resto de la pandilla, descubren una nueva amenaza: la tecnología. Un nuevo tiempo de juego para los niños.', 
   102, 
   '2026-06-17', 
   'CARTELERA', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = 'APT'), 
   '{
      "director": "Andrew Stanton, McKenna Harris",
      "posterPath": "https://image.tmdb.org/t/p/w500/zkQmhKTszD48vEcjIfwAlqLnGSr.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
      "actores": ["Tom Hanks", "Tim Allen", "Joan Cusack", "Greta Lee", "Conan O''Brien"],
      "generos": ["Animación", "Familia", "Comedia", "Aventura"],
      "trailers": [
        "https://www.youtube.com/watch?v=DW8GC9SQ9Xw",
        "https://www.youtube.com/watch?v=FJiwQyXuHUA"
      ]
   }'::jsonb
);

-- 4. Scary Movie 6 (RETIRADA)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1273221, 
   'Scary Movie: Terroríficamente incorrecta', 
   'Veintiséis años después de conseguir escapar de un asesino enmascarado sospechosamente familiar, el Core Four están de vuelta en el punto de mira del asesino y ninguna película de terror está a salvo.', 
   96, 
   '2026-06-03', 
   'RETIRADA', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '18+'), 
   '{
      "director": "Michael Tiddes",
      "posterPath": "https://image.tmdb.org/t/p/w500/vUPE82BWRZwq6M5Xc9UNuf8AffK.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/xWBiXclrRmTggQHMRsIn84YHavs.jpg",
      "actores": ["Marlon Wayans", "Shawn Wayans", "Anna Faris", "Regina Hall", "Damon Wayans Jr."],
      "generos": ["Comedia", "Terror"],
      "trailers": [
        "https://www.youtube.com/watch?v=XkWa4YPXCOs",
        "https://www.youtube.com/watch?v=HMTKiPCKgpw"
      ]
   }'::jsonb
);

-- 5. Minions & Monstruos (PRE-ESTRENO)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1315772, 
   'Minions & Monstruos', 
   'Esta es la historia desenfrenada, ridícula y totalmente real de cómo los Minions conquistaron Hollywood, se convirtieron en estrellas de cine, perdieron todo, desataron monstruos sobre el mundo y luego unieron fuerzas para intentar salvar al planeta del caos que ellos mismos crearon.', 
   90, 
   '2026-06-24', 
   'PRE-ESTRENO', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = 'APT'), 
   '{
      "director": "Pierre Coffin",
      "posterPath": "https://image.tmdb.org/t/p/w500/9THY3T4kn5D2rZhwwQ6t7XQtHtv.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/xMoXsOgF0hBP7iVj7ZPIrFtTeL3.jpg",
      "actores": ["Pierre Coffin", "Trey Parker", "Allison Janney", "Christoph Waltz", "Jeff Bridges"],
      "generos": ["Aventura", "Animación", "Comedia", "Familia", "Fantasía"],
      "trailers": []
   }'::jsonb
);

-- 6. El día de la revelación (CARTELERA)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1275779, 
   'El día de la revelación', 
   'Si descubrieras que no estamos solos, si alguien te abriera los ojos y te lo demostrase, ¿te asustarías?', 
   145, 
   '2026-06-10', 
   'CARTELERA', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '14+'), 
   '{
      "director": "Steven Spielberg",
      "posterPath": "https://image.tmdb.org/t/p/w500/pigU63pWFuXkq2MBc865GpFG4UP.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/s6ly8laenkHWlIBRkLSfIuEMLC6.jpg",
      "actores": ["Emily Blunt", "Josh O''Connor", "Colin Firth", "Colman Domingo", "Eve Hewson"],
      "generos": ["Ciencia ficción", "Suspense"],
      "trailers": [
        "https://www.youtube.com/watch?v=ATWBZGpQCSQ",
        "https://www.youtube.com/watch?v=PsV5T707MtM"
      ]
   }'::jsonb
);

-- 7. La Odisea (PRE-ESTRENO)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1368337, 
   'La Odisea', 
   'Una adaptación del poema épico de Homero del mismo nombre, sigue a Odiseo en su peligroso viaje a casa después de la Guerra de Troya, mostrando sus encuentros con Polifemo, las sirenas, Circe y terminando con su reunión con su esposa, Penélope.', 
   172, 
   '2026-07-15', 
   'PRE-ESTRENO', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '14+'), 
   '{
      "director": "Christopher Nolan",
      "posterPath": "https://image.tmdb.org/t/p/w500/tcYM55YaRob9UrPf9vW2lrBpIY8.jpg",
      "backdropPath": "https://image.tmdb.org/t/p/w1280/m3Pom6pbD51bBv3syz8NMHda3fz.jpg",
      "actores": ["Matt Damon", "Tom Holland", "Anne Hathaway", "Robert Pattinson", "Lupita Nyong''o"],
      "generos": ["Aventura", "Acción", "Fantasía"],
      "trailers": [
        "https://www.youtube.com/watch?v=7GciuQJFsWE"
      ]
   }'::jsonb
);

-- 8. Cantuta: La Orden Secreta (CARTELERA)
INSERT INTO peliculas (tmdb_id, titulo, sinopsis, duracion_min, fecha_estreno, estado, restriccion_id, metadata)
VALUES (
   1717087, 
   'Cantuta: La Orden Secreta', 
   '', 
   76, 
   '2026-06-18', 
   'CARTELERA', 
   (SELECT restriccion_id FROM restriccion_edad WHERE codigo = '16+'), 
   '{
      "director": "Alejandro Nieto-Polo",
      "posterPath": "https://image.tmdb.org/t/p/w500/uhF2PczfuuDwj1dj58PvnyRgJkU.jpg",
      "actores": ["Hansell Hoffmann", "Paolo Carbajal", "Fernando Pasco"],
      "generos": ["Terror", "Drama"],
      "trailers": []
   }'::jsonb
);
