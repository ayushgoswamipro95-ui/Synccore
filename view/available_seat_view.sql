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
