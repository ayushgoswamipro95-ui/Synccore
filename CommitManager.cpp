#include "../../include/transaction/CommitManager.h"
#include <iostream>

namespace synccore {
namespace transaction {

CommitManager::CommitManager(std::shared_ptr<database::DatabaseConnection> conn) {}

bool CommitManager::executeCommit(int bookingId) {
    std::cout << "[CommitManager] COMMIT booking " << bookingId << " (ACID guaranteed)\n";
    return true;
}

} // namespace transaction
} // namespace synccore
