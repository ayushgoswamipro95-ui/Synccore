-- Trigger 3: Automatically maintain available seat counts on shows table
DELIMITER $$

DROP TRIGGER IF EXISTS trg_seat_count_maintain$$

CREATE TRIGGER trg_seat_count_maintain
AFTER UPDATE ON show_seats
FOR EACH ROW
BEGIN
    IF OLD.status != 'BOOKED' AND NEW.status = 'BOOKED' THEN
        UPDATE shows
        SET available_seats = GREATEST(0, available_seats - 1)
        WHERE show_id = NEW.show_id;
    ELSEIF OLD.status = 'BOOKED' AND NEW.status = 'AVAILABLE' THEN
        UPDATE shows
        SET available_seats = LEAST(total_seats, available_seats + 1)
        WHERE show_id = NEW.show_id;
    END IF;
END$$

DELIMITER ;
