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
