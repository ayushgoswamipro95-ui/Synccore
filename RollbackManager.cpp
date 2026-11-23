#include "../../include/transaction/RollbackManager.h"
#include <iostream>

namespace synccore {
namespace transaction {

RollbackManager::RollbackManager(std::shared_ptr<database::DatabaseConnection> conn) {}

bool RollbackManager::executeRollback(int bookingId, const std::string& reason) {
    std::cout << "[RollbackManager] ROLLBACK booking " << bookingId << " due to: " << reason << "\n";
    return true;
}

} // namespace transaction
} // namespace synccore
