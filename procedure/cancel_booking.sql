-- Stored Procedure 2: Cancel booking and release seats
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_cancel_booking$$

CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id INT,
    OUT p_status_code VARCHAR(20)
)
proc_label: BEGIN
    DECLARE v_current_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERROR_ROLLBACK';
    END;

    START TRANSACTION;

    SELECT booking_status INTO v_current_status
    FROM bookings
    WHERE booking_id = p_booking_id
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'NOT_FOUND';
        LEAVE proc_label;
    END IF;

    IF v_current_status = 'CANCELLED' THEN
        ROLLBACK;
        SET p_status_code = 'ALREADY_CANCELLED';
        LEAVE proc_label;
    END IF;

    -- Update booking status (Trigger trg_booking_cancel_release will restore show_seats to AVAILABLE)
    UPDATE bookings
    SET booking_status = 'CANCELLED'
    WHERE booking_id = p_booking_id;

    -- Update transaction status to REFUNDED
    UPDATE transactions
    SET payment_status = 'REFUNDED'
    WHERE booking_id = p_booking_id;

    COMMIT;
    SET p_status_code = 'SUCCESS_CANCELLED';
END$$

DELIMITER ;
