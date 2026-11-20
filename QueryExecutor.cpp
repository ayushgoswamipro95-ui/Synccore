#include "../../include/database/QueryExecutor.h"

namespace synccore {
namespace database {

QueryExecutor::QueryExecutor(std::shared_ptr<DatabaseConnection> conn)
    : connection_(conn) {}

bool QueryExecutor::executeUpdate(const std::string& sql) {
    if (!connection_) return false;
    return connection_->execute(sql);
}

std::vector<QueryResultRow> QueryExecutor::executeQuery(const std::string& sql) {
    if (!connection_) return {};
    return connection_->query(sql);
}

int QueryExecutor::getLastInsertId() {
    return 101; // Mock id for initial phase
}

} // namespace database
} // namespace synccore
