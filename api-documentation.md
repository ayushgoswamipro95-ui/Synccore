# SyncCore Backend API Documentation

The native C++ Winsock2 REST HTTP interface serves both the customer-facing cinema booking platform and the OS/DBMS concurrency simulation engine on port `8080`.

## Base URL
`http://localhost:8080/api`

---

## 1. System Health & Metadata
- **`GET /api/status`**
  - **Description**: Returns server state, connected MySQL 8.4 InnoDB database status, version metadata, and active Razorpay public key ID.
  - **Response**:
    ```json
    {
      "status": "ONLINE",
      "version": "1.0.0",
      "database": "CONNECTED",
      "engine": "MySQL 8.4 InnoDB",
      "schema": "synccore_db",
      "razorpayKeyId": "rzp_test_synccore_demo"
    }
    ```

---

## 2. Authentication & User Management
All authenticated endpoints accept a Bearer token in the `Authorization` header: `Authorization: Bearer <token>`.

### Customer Signup
- **`POST /api/auth/signup`**
  - **Payload**:
    ```json
    {
      "fullName": "Ayush Sharma",
      "email": "ayush@gmail.com",
      "password": "SecurePassword123",
      "phone": "9876543210"
    }
    ```
  - **Validation**: Email normalization (lowercase, whitespace trimmed), regex validation, SHA-256 salted password hashing (`salt$hash`).
  - **Response**:
    ```json
    {
      "success": true,
      "token": "token_u7_1791615023_8b5e09d8ff2a",
      "user": {
        "id": 7,
        "name": "Ayush Sharma",
        "email": "ayush@gmail.com",
        "role": "USER",
        "phone": "9876543210"
      },
      "message": "Account registered successfully!"
    }
    ```

### Customer Login
- **`POST /api/auth/login`**
  - **Payload**:
    ```json
    {
      "email": "ayush@gmail.com",
      "password": "SecurePassword123"
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "token": "token_u7_1791615039_8b5e09d8ff2a",
      "user": { ... },
      "message": "Login successful!"
    }
    ```

### Admin Login
- **`POST /api/admin/login`**
  - **Payload**: `{"username": "Admin", "password": "123"}`

---

## 3. Movies & Schedule Selection (Real Date Flow)
Arbitrary free-form dates are disallowed. Showtimes and dates are loaded strictly from active scheduled screenings.

- **`GET /api/movies`**: Retrieve all current cinema listings with certificates and languages.
- **`GET /api/movies/dates?movieId={movieId}`**: Retrieve distinct dates where shows exist for the given film.
- **`GET /api/shows?movieId={movieId}&date={YYYY-MM-DD}`**: Retrieve scheduled shows grouped by theatre and screen with auditorium type (e.g. IMAX, Dolby Atmos).
- **`GET /api/screens?theatreId={theatreId}`**: Retrieve all auditoriums belonging to a theatre.
- **`GET /api/theatres`**: List all partner cinema locations.
- **`GET /api/seats?showId={showId}`**: Retrieve real-time seat status matrix (`AVAILABLE`, `LOCKED`, `BOOKED`).

---

## 4. Razorpay Payment & Booking Flow (ACID 2-Phase Commit)

### Step 1: Create Razorpay Order
- **`POST /api/payment/create-order`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Payload**:
    ```json
    {
      "showId": 101,
      "seats": ["G10", "G11"],
      "customerName": "Ayush Sharma",
      "customerEmail": "ayush@gmail.com",
      "movieTitle": "Inception: The OS Kernel",
      "movieDate": "2026-10-15",
      "movieTime": "19:00"
    }
    ```
  - **Backend Action**:
    - Validates authenticated user.
    - Locks seats using pessimistic `SELECT ... FOR UPDATE` with `status = 'LOCKED'`.
    - Computes trusted price from MySQL database.
    - Generates Razorpay Order via backend HTTPS CLI / API.
    - Stores pending order in `transactions` table.
  - **Response**:
    ```json
    {
      "success": true,
      "orderId": "order_test_1791615091_BK-715087",
      "keyId": "rzp_test_synccore_demo",
      "amount": 70000,
      "currency": "INR",
      "bookingId": 8,
      "bookingReference": "BK-715087",
      "totalAmount": 700.0,
      "customerName": "Ayush Sharma",
      "customerEmail": "ayush@gmail.com"
    }
    ```

### Step 2: Server-Side Signature Verification & Commit
- **`POST /api/payment/verify`**
  - **Payload**:
    ```json
    {
      "bookingId": 8,
      "razorpayOrderId": "order_test_1791615091_BK-715087",
      "razorpayPaymentId": "pay_test_payment_998877",
      "razorpaySignature": "3f8b..."
    }
    ```
  - **Backend Action**:
    - Verifies HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
    - If valid: marks booking `CONFIRMED`, transaction `SUCCESS`, seats `BOOKED`.
    - If invalid: rolls back transaction, restores seats to `AVAILABLE`, marks booking `FAILED`.
  - **Response**:
    ```json
    {
      "success": true,
      "bookingReference": "BK-715087",
      "bookingId": 8,
      "totalAmount": 700.0,
      "customerName": "Ayush Sharma",
      "movieTitle": "Inception: The OS Kernel",
      "movieDate": "2026-10-15",
      "movieTime": "19:00",
      "transactionId": "pay_test_payment_998877",
      "message": "Payment verified and booking confirmed!"
    }
    ```

### Razorpay Webhooks
- **`POST /api/payment/webhook`**: Server webhook endpoint for asynchronous payment status notifications.

---

## 5. User Bookings & E-Tickets

### User Booking History
- **`GET /api/my-bookings`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Description**: Returns bookings belonging exclusively to the authenticated user ID (categorized on the frontend into Upcoming, Past, and Cancelled).

### User Booking Cancellation
- **`POST /api/bookings/cancel`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Payload**: `{"bookingId": 8}`
  - **Description**: Verifies booking ownership, marks booking as `CANCELLED`, releases locked/booked seats back to `AVAILABLE`.

### Ticket Inspection
- **`GET /api/ticket?id={bookingId}`**: Returns formatted ticket metadata with booking reference for E-Ticket rendering and QR code generation.

### Admin Ticket Verification
- **`GET /api/admin/verify-ticket?ref={bookingReference}`**
  - **Description**: Cinema gate admission verification.
  - **Response**:
    ```json
    {
      "valid": true,
      "details": "VALID TICKET: Inception: The OS Kernel on 2026-10-15 19:00 for Ayush Sharma"
    }
    ```

---

## 6. Admin Auditorium & Show Management
- **`POST /api/admin/movie`**: Register new film in catalog (`title`, `genre`, `duration`, `certificate`, `language`, `poster`, `description`). Button text is strictly `Save Movie` (rating field removed).
- **`POST /api/admin/screen`**: Register a new screen for a theatre (`theatreId`, `screenName`, `screenType`, `capacity`) with automatic physical seat generation.
- **`POST /api/admin/show`**: Schedule a movie screening (`movieId`, `screenId`, `showDate`, `showTime`, `basePrice`) with collision rejection on same screen & time and automatic `show_seats` instantiation.
- **`POST /api/admin/delete-booking`**: Administrative booking cancellation.
- *(Note: Old database purge/cleanup endpoint `POST /api/admin/purge-bookings` has been permanently removed).*

---

## 7. OS & DBMS Concurrency Simulation
- **`GET /api/simulation/race`**: Demonstrates race condition outcome with and without synchronization.
- **`GET /api/simulation/deadlock`**: Demonstrates Wait-For-Graph DFS cycle detection and recovery.
- **`POST /api/simulation/run`**: Executes concurrent multi-threaded workload comparing CPU scheduling algorithms (FCFS, SJF, Priority) under high contention.
