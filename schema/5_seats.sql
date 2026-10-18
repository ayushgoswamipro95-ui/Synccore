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
