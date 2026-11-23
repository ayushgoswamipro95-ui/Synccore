-- Stored Procedure 3: Get simulation performance analytics
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_performance$$

CREATE PROCEDURE sp_get_performance(
    IN p_simulation_run_id VARCHAR(50)
)
BEGIN
    SELECT 
        simulation_run_id,
        COUNT(process_id) AS total_processes,
        SUM(CASE WHEN booking_status = 'COMMITTED' THEN 1 ELSE 0 END) AS successful_bookings,
        SUM(CASE WHEN booking_status = 'ROLLED_BACK' THEN 1 ELSE 0 END) AS rollbacks,
        COALESCE(AVG(waiting_time), 0.0) AS avg_waiting_time,
        COALESCE(AVG(turnaround_time), 0.0) AS avg_turnaround_time,
        COALESCE(MAX(completion_time) - MIN(arrival_time), 0) AS total_makespan
    FROM processes
    WHERE simulation_run_id = p_simulation_run_id
    GROUP BY simulation_run_id;
END$$

DELIMITER ;
