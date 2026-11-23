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
