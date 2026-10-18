#pragma once
#include <string>
#include <vector>
#include <memory>
#include "../models/Booking.h"
#include "../models/ShowSeat.h"
#include "../database/DatabaseConnection.h"

namespace synccore {
namespace booking {

struct BookingRequest {
    int userId = 0;
    int showId = 0;
    std::vector<int> showSeatIds;
    std::string paymentMethod = "RAZORPAY";
    std::string customerName = "Guest";
    std::string customerEmail = "";
    std::string movieTitle = "";
    std::string movieDate = "";
    std::string movieTime = "";
};

struct BookingResult {
    bool success = false;
    int bookingId = 0;
    std::string bookingReference;
    std::string message;
    double amount = 0.0;
    std::string transactionReference;
    std::string customerName = "Guest";
    std::string customerEmail = "";
    std::string movieTitle = "";
    std::string movieDate = "";
    std::string movieTime = "";
    std::string razorpayOrderId = "";
};

class BookingService {
public:
    explicit BookingService(std::shared_ptr<database::DatabaseConnection> conn);

    // Core Reservation & 2-Phase Commit Booking Lifecycle
    BookingResult createPendingReservation(const BookingRequest& req);
    BookingResult confirmBookingPayment(int bookingId, int userId, const std::string& gatewayOrderId, const std::string& gatewayPaymentId, const std::string& gatewaySignature);
    bool rollbackFailedPayment(int bookingId, int userId, const std::string& reason);
    
    // User Booking History & Cancellation
    std::vector<models::Booking> getUserBookingsDetailed(int userId);
    bool cancelBookingByUser(int bookingId, int userId, std::string& outMsg);
    models::Booking getBookingById(int bookingId);
    models::Booking getTicketDetails(int bookingId, int userId, bool isAdmin = false);
    bool verifyTicket(const std::string& ticketRef, std::string& outDetails);

    // Admin Operations
    std::vector<models::Booking> getAllBookingsAdmin();
    bool deleteBookingById(int bookingId);
    bool addNewMovie(const std::string& title, const std::string& genre, int duration, const std::string& language, const std::string& certificate, const std::string& posterUrl, const std::string& description);
    bool addScreen(int theatreId, const std::string& screenName, const std::string& screenType, int capacity, std::string& outError);
    bool addShow(int movieId, int screenId, const std::string& showDateTime, double basePrice, std::string& outError);

    // Legacy fallback compatibility
    BookingResult createBooking(const BookingRequest& req);
    bool cancelBooking(int bookingId);
    std::vector<models::Booking> getUserBookings(int userId);

private:
    std::shared_ptr<database::DatabaseConnection> conn_;
};

} // namespace booking
} // namespace synccore
