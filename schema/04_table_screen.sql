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
