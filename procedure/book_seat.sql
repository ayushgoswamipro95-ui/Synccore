-- Stored Procedure 1: Atomic seat booking transaction
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_book_seat$$

CREATE PROCEDURE sp_book_seat(
    IN p_user_id INT,
    IN p_show_id INT,
    IN p_show_seat_id INT,
    OUT p_booking_id INT,
    OUT p_status_code VARCHAR(20)
)
proc_label: BEGIN
    DECLARE v_seat_status VARCHAR(20);
    DECLARE v_seat_price DECIMAL(10, 2);
    DECLARE v_booking_ref VARCHAR(30);

    -- Declare rollback on SQLEXCEPTION
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'ERROR_ROLLBACK';
        SET p_booking_id = NULL;
    END;

    START TRANSACTION;

    -- 1. Check availability and lock the row with FOR UPDATE
    SELECT status, price INTO v_seat_status, v_seat_price
    FROM show_seats
    WHERE show_seat_id = p_show_seat_id AND show_id = p_show_id
    FOR UPDATE;

    IF v_seat_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'SEAT_NOT_FOUND';
        LEAVE proc_label;
    END IF;

    IF v_seat_status != 'AVAILABLE' THEN
        ROLLBACK;
        SET p_status_code = 'SEAT_ALREADY_BOOKED';
        LEAVE proc_label;
    END IF;

    -- 2. Generate unique booking reference
    SET v_booking_ref = CONCAT('BK-', UNIX_TIMESTAMP(), '-', FLOOR(RAND() * 1000));

    -- 3. Create master booking record
    INSERT INTO bookings (booking_reference, user_id, show_id, total_seats, total_amount, booking_status)
    VALUES (v_booking_ref, p_user_id, p_show_id, 1, v_seat_price, 'CONFIRMED');
    
    SET p_booking_id = LAST_INSERT_ID();

    -- 4. Create booking_seat junction record (Triggers trg_booking_seat_insert)
    INSERT INTO booking_seats (booking_id, show_seat_id, seat_price)
    VALUES (p_booking_id, p_show_seat_id, v_seat_price);

    -- 5. Record financial transaction audit
    INSERT INTO transactions (transaction_reference, booking_id, amount, payment_method, payment_status, gateway_response_code)
    VALUES (CONCAT('TXN-', v_booking_ref), p_booking_id, v_seat_price, 'SIMULATED_GATEWAY', 'SUCCESS', '200_OK');

    COMMIT;
    SET p_status_code = 'SUCCESS_COMMITTED';
END$$

DELIMITER ;
