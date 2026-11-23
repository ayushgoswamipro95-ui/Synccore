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
