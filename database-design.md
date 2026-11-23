# SyncCore Database Design

## 1. Relational Schema Architecture

SyncCore utilizes a 3NF normalized relational schema optimized for high concurrency and strict ACID guarantees under MySQL 8.x InnoDB (`synccore_db`).

### Core Tables (12 Total):

1. **`users`**: System customers, registered administrators, and simulated virtual booking agents (`user_id`, `name`, `email`, `password_hash`, `role`, `phone`, `created_at`).
2. **`movies`**: Catalog of films with titles, durations, genres, certificates, languages, poster URLs, and synopsis.
3. **`theatres`**: Physical cinema complexes with locations and city mappings.
4. **`screens`**: Individual auditoriums within a theatre, supporting multiple screens per theatre (`screen_id`, `theatre_id`, `screen_number`, `screen_name`, `screen_type`, `total_capacity`).
5. **`seats`**: Fixed physical layout of seats inside each screen (`seat_id`, `screen_id`, `seat_row`, `seat_number`, `seat_type`, `seat_label`).
6. **`shows`**: Scheduled screenings associating a movie, screen, start date/time, and pricing (`show_id`, `movie_id`, `screen_id`, `show_time`, `base_price`, `available_seats`, `total_seats`).
7. **`show_seats`**: **Temporal Seat Allocation**: Represents a physical seat's state for a specific screening (`show_seat_id`, `show_id`, `seat_id`, `status`, `price`, `locked_by`, `lock_time`). States: `AVAILABLE`, `LOCKED`, `BOOKED`.
8. **`bookings`**: Booking-level master records containing user ID, show ID, booking reference (`BK-XXXXXX`), total amount, and booking status (`CONFIRMED`, `PENDING`, `CANCELLED`).
9. **`booking_seats`**: Many-to-many junction mapping individual `show_seats` to a `booking`.
10. **`transactions`**: Payment audit logs supporting Razorpay integration (`transaction_id`, `booking_id`, `amount`, `payment_method`, `status`, `gateway_name`, `gateway_order_id`, `gateway_payment_id`, `gateway_signature`, `created_at`).
11. **`processes`**: OS simulation processes executing concurrent reservations (`READY`, `RUNNING`, `WAITING`, `TERMINATED`).
12. **`resource_locks`**: In-memory and DB tracking of granular seat locks held or awaited by processes.

---

## 2. Distinction: `seats` vs `show_seats`

- **Physical Seat (`seats`)**: Exists permanently inside an auditorium (e.g., Seat G10 in Screen 2).
- **Show Seat (`show_seats`)**: Represents the state of that physical seat for a specific temporal screening (Show #101 vs Show #102).
  - Seat G10 can be `BOOKED` for Show #101 at 6:00 PM, while remaining completely `AVAILABLE` for Show #102 at 9:00 PM.

---

## 3. Database Objects

### 3.1 Triggers
- `trg_booking_seat_status`: On inserting into `booking_seats`, automatically transitions corresponding `show_seats` to `BOOKED`.
- `trg_booking_cancel_status`: On updating `bookings.status = 'CANCELLED'`, automatically restores associated `show_seats` to `AVAILABLE`.
- `trg_seat_count_maintain`: Synchronously updates available seat counters on the `shows` table.

### 3.2 Views
- `v_available_seats`: Pre-filtered view displaying available seats with screen and pricing metadata.
- `v_booking_details`: Consolidated report linking user, movie, showtime, and booked seat labels.
- `v_simulation_performance`: Analytical aggregates for simulation runs (throughput, collision rates, lock wait durations).

### 3.3 Stored Procedures & Locking
- `sp_book_seats`: Handles transactional seat validation, row-level `SELECT ... FOR UPDATE`, insertion of booking records, and commit logic.
- `sp_cancel_booking`: Manages booking cancellations and releases locks.
- `sp_get_performance`: Gathers process scheduling metrics and lock wait statistics.
- *(Note: Old database purge/cleanup procedure `sp_purge_old_bookings` has been permanently removed).*

---

## 4. Schema Enhancements & Upgrades (Migration 01)
Database migration `database/migrations/01_upgrade_v2.sql` adds:
- `ALTER TABLE screens ADD COLUMN screen_type VARCHAR(50) DEFAULT '2D';`
- `ALTER TABLE transactions ADD COLUMN gateway_name VARCHAR(50) DEFAULT 'RAZORPAY', ADD COLUMN gateway_order_id VARCHAR(100) NULL, ADD COLUMN gateway_payment_id VARCHAR(100) NULL, ADD COLUMN gateway_signature VARCHAR(255) NULL;`
- `ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;`
- `ALTER TABLE movies ADD COLUMN certificate VARCHAR(20) DEFAULT 'U/A 16+', ADD COLUMN language VARCHAR(100) DEFAULT 'English, Hindi';`
