#include "../../include/transaction/TransactionService.h"
#include "../../include/transaction/CommitManager.h"
#include "../../include/transaction/RollbackManager.h"
#include <iostream>

namespace synccore {
namespace transaction {

TransactionService::TransactionService(std::shared_ptr<database::DatabaseConnection> conn)
    : conn_(conn), 
      commitMgr_(std::make_unique<CommitManager>(conn)),
      rollbackMgr_(std::make_unique<RollbackManager>(conn)) {}

models::Transaction TransactionService::recordTransaction(int bookingId, double amount, const std::string& method, bool success) {
    models::Transaction t;
    t.transactionId = 701;
    t.transactionReference = "TXN_701_SIM";
    t.bookingId = bookingId;
    t.amount = amount;
    t.paymentMethod = method;
    t.paymentStatus = success ? "SUCCESS" : "FAILED";
    t.gatewayResponseCode = success ? "200_OK" : "402_DECLINED";
    return t;
}

models::Transaction TransactionService::getTransactionByBookingId(int bookingId) {
    return recordTransaction(bookingId, 500.0, "SIMULATED_GATEWAY", true);
}

} // namespace transaction
} // namespace synccore
