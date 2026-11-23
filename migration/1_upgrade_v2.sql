-- SyncCore Database Migration: Upgrade to V2
-- Adds Razorpay transaction columns, screen types, user phone, and movie metadata
USE synccore_db;

-- 1. Extend screens with screen_type
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'screens' AND COLUMN_NAME = 'screen_type');
SET @query = IF(@col_exists = 0, 'ALTER TABLE screens ADD COLUMN screen_type VARCHAR(50) DEFAULT "2D";', 'SELECT "screen_type exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Extend transactions with Razorpay tracking
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'gateway_name');
SET @query = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN gateway_name VARCHAR(50) DEFAULT "RAZORPAY";', 'SELECT "gateway_name exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'gateway_order_id');
SET @query = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN gateway_order_id VARCHAR(100) NULL;', 'SELECT "gateway_order_id exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'gateway_payment_id');
SET @query = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN gateway_payment_id VARCHAR(100) NULL;', 'SELECT "gateway_payment_id exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'gateway_signature');
SET @query = IF(@col_exists = 0, 'ALTER TABLE transactions ADD COLUMN gateway_signature VARCHAR(255) NULL;', 'SELECT "gateway_signature exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE transactions MODIFY COLUMN payment_status ENUM('CREATED','PENDING','SUCCESS','FAILED','REFUNDED','INITIATED') DEFAULT 'CREATED';

-- 3. Extend users with phone
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone');
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;', 'SELECT "phone exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Extend movies with certificate and language
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'certificate');
SET @query = IF(@col_exists = 0, 'ALTER TABLE movies ADD COLUMN certificate VARCHAR(20) DEFAULT "U/A 16+";', 'SELECT "certificate exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'synccore_db' AND TABLE_NAME = 'movies' AND COLUMN_NAME = 'language');
SET @query = IF(@col_exists = 0, 'ALTER TABLE movies ADD COLUMN language VARCHAR(50) DEFAULT "English, Hindi";', 'SELECT "language exists";');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Populate seats for Screen 2 and Screen 3 if not present
INSERT IGNORE INTO seats (screen_id, row_name, seat_number, seat_label, seat_type)
SELECT 2, row_name, seat_number, seat_label, seat_type FROM seats WHERE screen_id = 1;

INSERT IGNORE INTO seats (screen_id, row_name, seat_number, seat_label, seat_type)
SELECT 3, row_name, seat_number, seat_label, seat_type FROM seats WHERE screen_id = 1;

-- 6. Update Screen names and types for default screens
UPDATE screens SET screen_name = 'Screen 1 (Laser IMAX)', screen_type = 'IMAX' WHERE screen_id = 1;
UPDATE screens SET screen_name = 'Screen 2 (Dolby Atmos)', screen_type = 'Dolby Atmos' WHERE screen_id = 2;
UPDATE screens SET screen_name = 'Screen 3 (4DX Dynamic)', screen_type = '4DX' WHERE screen_id = 3;
