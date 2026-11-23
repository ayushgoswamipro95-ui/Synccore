-- Seed Data: movies
INSERT INTO movies (movie_id, title, description, duration_minutes, genre, rating, poster_url, release_date) VALUES
(1, 'Inception: The OS Kernel', 'A mind-bending heist through nested process states and threads.', 148, 'Sci-Fi / Thriller', 'PG-13', 'assets/images/inception.jpg', '2026-07-16'),
(2, 'The Matrix: Fork & Exec', 'A computer hacker learns the true nature of concurrent virtual memory.', 136, 'Action / Sci-Fi', 'R', 'assets/images/matrix.jpg', '2026-03-31'),
(3, 'Interstellar: Relativistic Clocks', 'Explorers travel through a wormhole to analyze distributed transaction latency.', 169, 'Adventure / Drama', 'PG-13', 'assets/images/interstellar.jpg', '2026-11-07'),
(4, 'Oppenheimer: The Atomic Commit', 'The gripping story of 2-phase commit and transactional chain reactions.', 180, 'Biography / Drama', 'R', 'assets/images/oppenheimer.jpg', '2026-07-21')
ON DUPLICATE KEY UPDATE title=VALUES(title);
