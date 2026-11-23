-- Seed Data: theatres and screens
INSERT INTO theatres (theatre_id, name, city, address, total_screens) VALUES
(1, 'IMAX Cyberplex', 'Tech City', 'Sector 62, Innovation Boulevard', 3),
(2, 'PVR Core Cinema', 'Metro Hub', 'Connaught Place, Central Wing', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO screens (screen_id, theatre_id, screen_number, screen_name, total_capacity) VALUES
(1, 1, 1, 'Screen 1 (Laser IMAX)', 24),
(2, 1, 2, 'Screen 2 (Dolby Atmos)', 24),
(3, 2, 1, 'Screen 1 (4DX Dynamic)', 24)
ON DUPLICATE KEY UPDATE screen_name=VALUES(screen_name);
