-- Seed Data: users
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('ayush_admin', 'ayush@synccore.edu', 'hash_admin_123', 'Ayush Admin', 'ADMIN'),
('john_doe', 'john@example.com', 'hash_john_123', 'John Doe', 'USER'),
('sarah_connor', 'sarah@example.com', 'hash_sarah_123', 'Sarah Connor', 'USER'),
('p1_bot', 'p1@sim.local', 'hash_sim', 'Process P1 SimBot', 'SIMULATED'),
('p2_bot', 'p2@sim.local', 'hash_sim', 'Process P2 SimBot', 'SIMULATED'),
('p3_bot', 'p3@sim.local', 'hash_sim', 'Process P3 SimBot', 'SIMULATED')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
