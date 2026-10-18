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
