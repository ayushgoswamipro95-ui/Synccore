-- Table 11: processes (OS Simulation Process Control Blocks)
CREATE TABLE IF NOT EXISTS processes (
    process_id INT AUTO_INCREMENT PRIMARY KEY,
    process_name VARCHAR(50) NOT NULL,
    simulation_run_id VARCHAR(50) NOT NULL,
    arrival_time INT NOT NULL DEFAULT 0,
    burst_time INT NOT NULL DEFAULT 10,
    priority INT NOT NULL DEFAULT 1,
    state ENUM('READY', 'RUNNING', 'WAITING', 'TERMINATED') DEFAULT 'READY',
    requested_seat_label VARCHAR(10) NOT NULL,
    target_show_id INT NOT NULL,
    start_time INT NULL,
    completion_time INT NULL,
    waiting_time INT NULL,
    turnaround_time INT NULL,
    booking_status ENUM('PENDING', 'COMMITTED', 'ROLLED_BACK') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
