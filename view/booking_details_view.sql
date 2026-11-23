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
