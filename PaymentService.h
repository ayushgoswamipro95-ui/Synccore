#pragma once
#include <string>

namespace synccore {
namespace booking {

class PaymentService {
public:
    struct PaymentResult {
        bool success = false;
        std::string transactionRef;
        std::string responseCode;
        std::string message;
    };

    PaymentResult processSimulatedPayment(int bookingId, double amount, const std::string& method);
    PaymentResult refundPayment(const std::string& transactionRef);
};

} // namespace booking
} // namespace synccore
