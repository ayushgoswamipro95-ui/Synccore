#include "../../include/database/TransactionManager.h"
#include <iostream>

namespace synccore {
namespace database {

TransactionManager::TransactionManager(std::shared_ptr<DatabaseConnection> conn)
    : connection_(conn), inTransaction_(false) {}

bool TransactionManager::beginTransaction() {
    if (!connection_) return false;
    inTransaction_ = connection_->beginTransaction();
    return inTransaction_;
}

bool TransactionManager::commit() {
    if (!connection_ || !inTransaction_) return false;
    bool res = connection_->commit();
    inTransaction_ = false;
    return res;
}

bool TransactionManager::rollback() {
    if (!connection_ || !inTransaction_) return false;
    bool res = connection_->rollback();
    inTransaction_ = false;
    return res;
}

bool TransactionManager::isActive() const {
    return inTransaction_;
}

bool TransactionManager::executeInTransaction(const std::function<bool()>& action) {
    if (!beginTransaction()) return false;
    try {
        if (action()) {
            return commit();
        } else {
            rollback();
            return false;
        }
    } catch (...) {
        rollback();
        throw;
    }
}

} // namespace database
} // namespace synccore
