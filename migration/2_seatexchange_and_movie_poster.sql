-- SyncCore Database Migration: Upgrade v3
-- Adds seat exchange requests table, modifies movies poster_url to MEDIUMTEXT, updates admin names
USE synccore_db;

ALTER TABLE movies MODIFY COLUMN poster_url MEDIUMTEXT;

CREATE TABLE IF NOT EXISTS seat_exchange_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_user_id INT NOT NULL,
    requester_booking_id INT NOT NULL,
    target_user_id INT NOT NULL,
    target_booking_id INT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

UPDATE users SET full_name = 'Admin' WHERE full_name = 'System Administrator';
