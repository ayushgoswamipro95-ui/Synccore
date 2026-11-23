CREATE DATABASE IF NOT EXISTS synccore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE synccore_db;

-- ==================== database/schema/01_users.sql ====================
-- Table 1: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN', 'SIMULATED') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/02_movies.sql ====================
-- Table 2: movies
CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    rating VARCHAR(10) DEFAULT 'PG-13',
    poster_url VARCHAR(255),
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/03_theatres.sql ====================
-- Table 3: theatres
CREATE TABLE IF NOT EXISTS theatres (
    theatre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_screens INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/04_screens.sql ====================
-- Table 4: screens
CREATE TABLE IF NOT EXISTS screens (
    screen_id INT AUTO_INCREMENT PRIMARY KEY,
    theatre_id INT NOT NULL,
    screen_number INT NOT NULL,
    screen_name VARCHAR(50) DEFAULT 'Audi 1',
    total_capacity INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_screens_theatre FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE,
    UNIQUE KEY uk_theatre_screen (theatre_id, screen_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/05_seats.sql ====================
-- Table 5: seats (Physical Seats in a Screen)
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    screen_id INT NOT NULL,
    row_name VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    seat_label VARCHAR(10) NOT NULL, -- e.g., 'G10', 'A1'
    seat_type ENUM('STANDARD', 'PREMIUM', 'VIP') DEFAULT 'STANDARD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seats_screen FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE,
    UNIQUE KEY uk_screen_seat (screen_id, seat_label)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/06_shows.sql ====================
-- Table 6: shows
CREATE TABLE IF NOT EXISTS shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    screen_id INT NOT NULL,
    show_time DATETIME NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 250.00,
    total_seats INT NOT NULL DEFAULT 50,
    available_seats INT NOT NULL DEFAULT 50,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shows_movie FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_shows_screen FOREIGN KEY (screen_id) REFERENCES screens(screen_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/07_show_seats.sql ====================
-- Table 7: show_seats (Specific physical seat instance for a specific screening)
CREATE TABLE IF NOT EXISTS show_seats (
    show_seat_id INT AUTO_INCREMENT PRIMARY KEY,
    show_id INT NOT NULL,
    seat_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('AVAILABLE', 'LOCKED', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    lock_expires_at DATETIME NULL,
    version INT NOT NULL DEFAULT 1, -- Optimistic/Pessimistic concurrency control tracker
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_show_seats_show FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
    CONSTRAINT fk_show_seats_seat FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
    UNIQUE KEY uk_show_seat (show_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/08_bookings.sql ====================
-- Table 8: bookings (Master Booking Record)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    total_seats INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_show FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/09_booking_seats.sql ====================
-- Table 9: booking_seats (Junction: individual seats within a booking)
CREATE TABLE IF NOT EXISTS booking_seats (
    booking_seat_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    show_seat_id INT NOT NULL,
    seat_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_seats_show_seat FOREIGN KEY (show_seat_id) REFERENCES show_seats(show_seat_id) ON DELETE RESTRICT,
    UNIQUE KEY uk_booking_show_seat (show_seat_id) -- A show_seat cannot be booked twice concurrently
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/10_transactions.sql ====================
-- Table 10: transactions (ACID Financial Audit & Gateway Log)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(50) NOT NULL UNIQUE,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CARD', 'UPI', 'WALLET', 'SIMULATED_GATEWAY') DEFAULT 'SIMULATED_GATEWAY',
    payment_status ENUM('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'INITIATED',
    gateway_response_code VARCHAR(20) DEFAULT '200_OK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/11_processes.sql ====================
-- Table 11: processes (OS Simulation Process Control Blocks)
CREATE TABLE IF NOT EXISTS processes (
    process_id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(50) NOT NULL,
    simulation_run_id VARCHAR(50) NOT NULL,
    arrival_time INT NOT NULL DEFAULT 0,
    burst_time INT NOT NULL DEFAULT 10,
    priority INT NOT NULL DEFAULT 1,
    state ENUM('READY', 'RUNNING', 'WAITING', 'TERMINATED') DEFAULT 'READY',
    requested_seat_label VARCHAR(10) NOT NULL,
    target_show_id INT NOT NULL,
    start_time INT NULL,
    completion_time INT NULL,
    waiting_time INT NULL,
    turnaround_time INT NULL,
    booking_status ENUM('PENDING', 'COMMITTED', 'ROLLED_BACK') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/schema/12_resource_locks.sql ====================
-- Table 12: resource_locks (Simulation Concurrency and Mutex State)
CREATE TABLE IF NOT EXISTS resource_locks (
    lock_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'SHOW_SEAT',
    resource_identifier VARCHAR(50) NOT NULL, -- e.g., 'SHOW_101_SEAT_G10'
    lock_state ENUM('FREE', 'REQUESTED', 'ACQUIRED', 'WAITING', 'RELEASED') DEFAULT 'FREE',
    holding_process_id INT NULL,
    waiting_process_id INT NULL,
    lock_acquired_time TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_resource (resource_type, resource_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== database/views/available_seats_view.sql ====================
-- View 1: Available seats view
CREATE OR REPLACE VIEW v_available_seats AS
SELECT 
    ss.show_seat_id,
    ss.show_id,
    s.movie_id,
    m.title AS movie_title,
    t.name AS theatre_name,
    sc.screen_name,
    s.show_time,
    st.seat_label,
    st.seat_type,
    ss.price,
    ss.status
FROM show_seats ss
JOIN shows s ON ss.show_id = s.show_id
JOIN movies m ON s.movie_id = m.movie_id
JOIN screens sc ON s.screen_id = sc.screen_id
JOIN theatres t ON sc.theatre_id = t.theatre_id
JOIN seats st ON ss.seat_id = st.seat_id
WHERE ss.status = 'AVAILABLE';


-- ==================== database/views/booking_details_view.sql ====================
-- View 2: Detailed Booking View with user, movie, and seat aggregates
CREATE OR REPLACE VIEW v_booking_details AS
SELECT 
    b.booking_id,
    b.booking_reference,
    b.user_id,
    u.username,
    u.email,
    m.title AS movie_title,
    t.name AS theatre_name,
    sc.screen_name,
    s.show_time,
    b.total_seats,
    b.total_amount,
    b.booking_status,
    txn.transaction_reference,
    txn.payment_status,
    GROUP_CONCAT(st.seat_label ORDER BY st.seat_label SEPARATOR ', ') AS booked_seats,
    b.created_at
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN shows s ON b.show_id = s.show_id
JOIN movies m ON s.movie_id = m.movie_id
JOIN screens sc ON s.screen_id = sc.screen_id
JOIN theatres t ON sc.theatre_id = t.theatre_id
LEFT JOIN booking_seats bs ON b.booking_id = bs.booking_id
LEFT JOIN show_seats ss ON bs.show_seat_id = ss.show_seat_id
LEFT JOIN seats st ON ss.seat_id = st.seat_id
LEFT JOIN transactions txn ON b.booking_id = txn.booking_id
GROUP BY b.booking_id, txn.transaction_reference, txn.payment_status;


-- ==================== database/views/simulation_performance_view.sql ====================
-- View 3: Simulation Performance aggregates
CREATE OR REPLACE VIEW v_simulation_performance AS
SELECT 
    simulation_run_id,
    COUNT(process_id) AS total_processes,
    SUM(CASE WHEN booking_status = 'COMMITTED' THEN 1 ELSE 0 END) AS successful_bookings,
    SUM(CASE WHEN booking_status = 'ROLLED_BACK' THEN 1 ELSE 0 END) AS rollbacks,
    AVG(waiting_time) AS avg_waiting_time,
    AVG(turnaround_time) AS avg_turnaround_time,
    MAX(completion_time) - MIN(arrival_time) AS total_makespan,
    CASE 
        WHEN (MAX(completion_time) - MIN(arrival_time)) > 0 
        THEN COUNT(process_id) / (MAX(completion_time) - MIN(arrival_time))
        ELSE 0 
    END AS throughput_rate
FROM processes
GROUP BY simulation_run_id;


-- ==================== database/procedures/book_seat.sql ====================
-- Stored Procedure 1: Atomic seat booking transaction
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_book_seat$$

CREATE PROCEDURE sp_book_seat(
    IN p_user_id INT,
    IN p_show_id INT,
    IN p_show_seat_id INT,
    OUT p_booking_id INT,
    OUT p_status_code VARCHAR(20)
)
proc_label: BEGIN
    DECLARE v_seat_status VARCHAR(20);
    DECLARE v_seat_price DECIMAL(10, 2);
    DECLARE v_booking_ref VARCHAR(30);

    -- Declare rollback on SQLEXCEPTION
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERROR_ROLLBACK';
        SET p_booking_id = NULL;
    END;

    START TRANSACTION;

    -- 1. Check availability and lock the row with FOR UPDATE
    SELECT status, price INTO v_seat_status, v_seat_price
    FROM show_seats
    WHERE show_seat_id = p_show_seat_id AND show_id = p_show_id
    FOR UPDATE;

    IF v_seat_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'SEAT_NOT_FOUND';
        LEAVE proc_label;
    END IF;

    IF v_seat_status != 'AVAILABLE' THEN
        ROLLBACK;
        SET p_status_code = 'SEAT_ALREADY_BOOKED';
        LEAVE proc_label;
    END IF;

    -- 2. Generate unique booking reference
    SET v_booking_ref = CONCAT('BK-', UNIX_TIMESTAMP(), '-', FLOOR(RAND() * 1000));

    -- 3. Create master booking record
    INSERT INTO bookings (booking_reference, user_id, show_id, total_seats, total_amount, booking_status)
    VALUES (v_booking_ref, p_user_id, p_show_id, 1, v_seat_price, 'CONFIRMED');
    
    SET p_booking_id = LAST_INSERT_ID();

    -- 4. Create booking_seat junction record (Triggers trg_booking_seat_insert)
    INSERT INTO booking_seats (booking_id, show_seat_id, seat_price)
    VALUES (p_booking_id, p_show_seat_id, v_seat_price);

    -- 5. Record financial transaction audit
    INSERT INTO transactions (transaction_reference, booking_id, amount, payment_method, payment_status, gateway_response_code)
    VALUES (CONCAT('TXN-', v_booking_ref), p_booking_id, v_seat_price, 'SIMULATED_GATEWAY', 'SUCCESS', '200_OK');

    COMMIT;
    SET p_status_code = 'SUCCESS_COMMITTED';
END$$

DELIMITER ;


-- ==================== database/procedures/cancel_booking.sql ====================
-- Stored Procedure 2: Cancel booking and release seats
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_cancel_booking$$

CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id INT,
    OUT p_status_code VARCHAR(20)
)
proc_label: BEGIN
    DECLARE v_current_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERROR_ROLLBACK';
    END;

    START TRANSACTION;

    SELECT booking_status INTO v_current_status
    FROM bookings
    WHERE booking_id = p_booking_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'NOT_FOUND';
        LEAVE proc_label;
    END IF;

    IF v_current_status = 'CANCELLED' THEN
        ROLLBACK;
        SET p_status_code = 'ALREADY_CANCELLED';
        LEAVE proc_label;
    END IF;

    -- Update booking status (Trigger trg_booking_cancel_release will restore show_seats to AVAILABLE)
    UPDATE bookings
    SET booking_status = 'CANCELLED'
    WHERE booking_id = p_booking_id;

    -- Update transaction status to REFUNDED
    UPDATE transactions
    SET payment_status = 'REFUNDED'
    WHERE booking_id = p_booking_id;

    COMMIT;
    SET p_status_code = 'SUCCESS_CANCELLED';
END$$

DELIMITER ;


-- ==================== database/procedures/get_performance.sql ====================
-- Stored Procedure 3: Get simulation performance analytics
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_performance$$

CREATE PROCEDURE sp_get_performance(
    IN p_simulation_run_id VARCHAR(50)
)
BEGIN
    SELECT 
        simulation_run_id,
        COUNT(process_id) AS total_processes,
        SUM(CASE WHEN booking_status = 'COMMITTED' THEN 1 ELSE 0 END) AS successful_bookings,
        SUM(CASE WHEN booking_status = 'ROLLED_BACK' THEN 1 ELSE 0 END) AS rollbacks,
        COALESCE(AVG(waiting_time), 0.0) AS avg_waiting_time,
        COALESCE(AVG(turnaround_time), 0.0) AS avg_turnaround_time,
        COALESCE(MAX(completion_time) - MIN(arrival_time), 0) AS total_makespan
    FROM processes
    WHERE simulation_run_id = p_simulation_run_id
    GROUP BY simulation_run_id;
END$$

DELIMITER ;


-- ==================== database/triggers/booking_seat_trigger.sql ====================
-- Trigger 1: On booking_seats insert -> update show_seats status to 'BOOKED'
DELIMITER $$

DROP TRIGGER IF EXISTS trg_booking_seat_insert$$

CREATE TRIGGER trg_booking_seat_insert
AFTER INSERT ON booking_seats
FOR EACH ROW
BEGIN
    UPDATE show_seats
    SET status = 'BOOKED'
    WHERE show_seat_id = NEW.show_seat_id;
END$$

DELIMITER ;


-- ==================== database/triggers/booking_cancel_trigger.sql ====================
-- Trigger 2: On booking cancellation -> restore show_seats to 'AVAILABLE'
DELIMITER $$

DROP TRIGGER IF EXISTS trg_booking_cancel_release$$

CREATE TRIGGER trg_booking_cancel_release
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'CANCELLED' AND OLD.booking_status != 'CANCELLED' THEN
        UPDATE show_seats
        SET status = 'AVAILABLE'
        WHERE show_seat_id IN (
            SELECT show_seat_id FROM booking_seats WHERE booking_id = NEW.booking_id
        );
    END IF;
END$$

DELIMITER ;


-- ==================== database/triggers/seat_count_trigger.sql ====================
-- Trigger 3: Automatically maintain available seat counts on shows table
DELIMITER $$

DROP TRIGGER IF EXISTS trg_seat_count_maintain$$

CREATE TRIGGER trg_seat_count_maintain
AFTER UPDATE ON show_seats
FOR EACH ROW
BEGIN
    IF OLD.status != 'BOOKED' AND NEW.status = 'BOOKED' THEN
        UPDATE shows
        SET available_seats = GREATEST(0, available_seats - 1)
        WHERE show_id = NEW.show_id;
    ELSEIF OLD.status = 'BOOKED' AND NEW.status = 'AVAILABLE' THEN
        UPDATE shows
        SET available_seats = LEAST(total_seats, available_seats + 1)
        WHERE show_id = NEW.show_id;
    END IF;
END$$

DELIMITER ;


-- ==================== database/seed/users.sql ====================
-- Seed Data: users
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('ayush_admin', 'ayush@synccore.edu', 'hash_admin_123', 'Ayush Admin', 'ADMIN'),
('john_doe', 'john@example.com', 'hash_john_123', 'John Doe', 'USER'),
('sarah_connor', 'sarah@example.com', 'hash_sarah_123', 'Sarah Connor', 'USER'),
('p1_bot', 'p1@sim.local', 'hash_sim', 'Process P1 SimBot', 'SIMULATED'),
('p2_bot', 'p2@sim.local', 'hash_sim', 'Process P2 SimBot', 'SIMULATED'),
('p3_bot', 'p3@sim.local', 'hash_sim', 'Process P3 SimBot', 'SIMULATED')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);


-- ==================== database/seed/movies.sql ====================
-- Seed Data: movies
INSERT INTO movies (movie_id, title, description, duration_minutes, genre, rating, poster_url, release_date) VALUES
(1, 'Inception: The OS Kernel', 'A mind-bending heist through nested process states and threads.', 148, 'Sci-Fi / Thriller', 'PG-13', 'assets/images/inception.jpg', '2026-07-16'),
(2, 'The Matrix: Fork & Exec', 'A computer hacker learns the true nature of concurrent virtual memory.', 136, 'Action / Sci-Fi', 'R', 'assets/images/matrix.jpg', '2026-03-31'),
(3, 'Interstellar: Relativistic Clocks', 'Explorers travel through a wormhole to analyze distributed transaction latency.', 169, 'Adventure / Drama', 'PG-13', 'assets/images/interstellar.jpg', '2026-11-07'),
(4, 'Oppenheimer: The Atomic Commit', 'The gripping story of 2-phase commit and transactional chain reactions.', 180, 'Biography / Drama', 'R', 'assets/images/oppenheimer.jpg', '2026-07-21')
ON DUPLICATE KEY UPDATE title=VALUES(title);


-- ==================== database/seed/theatres.sql ====================
-- Seed Data: theatres and screens
INSERT INTO theatres (theatre_id, name, city, address, total_screens) VALUES
(1, 'IMAX Cyberplex', 'Tech City', 'Sector 62, Innovation Boulevard', 3),
(2, 'PVR Core Cinema', 'Metro Hub', 'Connaught Place, Central Wing', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO screens (screen_id, theatre_id, screen_number, screen_name, total_capacity) VALUES
(1, 1, 1, 'Screen 1 (Laser IMAX)', 24),
(2, 1, 2, 'Screen 2 (Dolby Atmos)', 24),
(3, 2, 1, 'Screen 1 (4DX Dynamic)', 24)
ON DUPLICATE KEY UPDATE screen_name=VALUES(screen_name);


-- ==================== database/seed/seats.sql ====================
-- Seed Data: Physical Seats for Screen 1 (Rows A to D, Numbers 1 to 6)
-- Total 24 seats per auditorium for clean simulation grid visualization
INSERT INTO seats (screen_id, row_name, seat_number, seat_label, seat_type) VALUES
-- Screen 1
(1, 'A', 1, 'A1', 'STANDARD'), (1, 'A', 2, 'A2', 'STANDARD'), (1, 'A', 3, 'A3', 'STANDARD'),
(1, 'A', 4, 'A4', 'STANDARD'), (1, 'A', 5, 'A5', 'STANDARD'), (1, 'A', 6, 'A6', 'STANDARD'),
(1, 'B', 1, 'B1', 'STANDARD'), (1, 'B', 2, 'B2', 'STANDARD'), (1, 'B', 3, 'B3', 'STANDARD'),
(1, 'B', 4, 'B4', 'STANDARD'), (1, 'B', 5, 'B5', 'STANDARD'), (1, 'B', 6, 'B6', 'STANDARD'),
(1, 'C', 1, 'C1', 'PREMIUM'),  (1, 'C', 2, 'C2', 'PREMIUM'),  (1, 'C', 3, 'C3', 'PREMIUM'),
(1, 'C', 4, 'C4', 'PREMIUM'),  (1, 'C', 5, 'C5', 'PREMIUM'),  (1, 'C', 6, 'C6', 'PREMIUM'),
(1, 'G', 10, 'G10', 'VIP'),     (1, 'G', 11, 'G11', 'VIP'),     (1, 'G', 12, 'G12', 'VIP'),
(1, 'G', 13, 'G13', 'VIP'),     (1, 'G', 14, 'G14', 'VIP'),     (1, 'G', 15, 'G15', 'VIP')
ON DUPLICATE KEY UPDATE seat_type=VALUES(seat_type);


-- ==================== database/seed/shows.sql ====================
-- Seed Data: shows and show_seats
INSERT INTO shows (show_id, movie_id, screen_id, show_time, base_price, total_seats, available_seats, status) VALUES
(101, 1, 1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 350.00, 24, 24, 'ACTIVE'),
(102, 1, 1, DATE_ADD(NOW(), INTERVAL 5 HOUR), 350.00, 24, 24, 'ACTIVE'),
(103, 2, 2, DATE_ADD(NOW(), INTERVAL 3 HOUR), 300.00, 24, 24, 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Populate show_seats for Show 101 and Show 102 from physical seats
INSERT INTO show_seats (show_id, seat_id, price, status)
SELECT 101, seat_id, 
       CASE WHEN seat_type = 'VIP' THEN 450.00 
            WHEN seat_type = 'PREMIUM' THEN 380.00 
            ELSE 300.00 END,
       'AVAILABLE'
FROM seats WHERE screen_id = 1
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO show_seats (show_id, seat_id, price, status)
SELECT 102, seat_id, 
       CASE WHEN seat_type = 'VIP' THEN 450.00 
            WHEN seat_type = 'PREMIUM' THEN 380.00 
            ELSE 300.00 END,
       'AVAILABLE'
FROM seats WHERE screen_id = 1
ON DUPLICATE KEY UPDATE status=VALUES(status);



