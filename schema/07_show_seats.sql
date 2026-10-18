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
