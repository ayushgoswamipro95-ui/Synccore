-- Trigger 2: On booking cancellation -> restore show_seats to 'AVAILABLE'
DELIMITER $$

DROP TRIGGER IF EXISTS trg_booking_cancel_release$$

CREATE TRIGGER trg_booking_cancel_release
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'CANCELLED' AND OLD.booking_status != 'CANCELLED' THEN
        UPDATE show_seats
        SET status = 'AVAILABLE'
        WHERE show_seat_id IN (
            SELECT show_seat_id FROM booking_seats WHERE booking_id = NEW.booking_id
        );
    END IF;
END$$

DELIMITER ;
