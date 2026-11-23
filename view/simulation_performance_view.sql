-- View 3: Simulation Performance aggregates
CREATE OR REPLACE VIEW v_simulation_performance AS
SELECT 
    simulation_run_id,
    COUNT(process_id) AS total_processes,
    SUM(CASE WHEN booking_status = 'COMMITTED' THEN 1 ELSE 0 END) AS successful_bookings,
    SUM(CASE WHEN booking_status = 'ROLLED_BACK' THEN 1 ELSE 0 END) AS rollbacks,
    AVG(waiting_time) AS avg_waiting_time,
    AVG(turnaround_time) AS avg_turnaround_time,
    MAX(completion_time) - MIN(arrival_time) AS total_makespan,
    CASE 
        WHEN (MAX(completion_time) - MIN(arrival_time)) > 0 
        THEN COUNT(process_id) / (MAX(completion_time) - MIN(arrival_time))
        ELSE 0 
    END AS throughput_rate
FROM processes
GROUP BY simulation_run_id;
