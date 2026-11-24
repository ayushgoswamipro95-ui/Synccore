#include "../../include/database/DatabaseConnection.h"
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <sstream>
#include <vector>

#ifdef _WIN32
extern "C" {
    FILE* _popen(const char* command, const char* mode);
    int _pclose(FILE* stream);
}
#endif

namespace synccore {
namespace database {

DatabaseConnection::DatabaseConnection(const config::DatabaseConfig& cfg)
    : config_(cfg), connected_(false), inTransaction_(false) {}

DatabaseConnection::~DatabaseConnection() {
    disconnect();
}

bool DatabaseConnection::connect() {
    std::cout << "[DB] Initializing connection to MySQL host: " << config_.host 
              << ":" << config_.port << ", schema: " << config_.schema << std::endl;

    // Test live connection to MySQL 8.4
    std::string testCmd = "\"\"C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe\" -h " 
        + config_.host + " -P " + std::to_string(config_.port) 
        + " -u " + config_.user + " -p\"" + config_.password + "\" " 
        + config_.schema + " -e \"SELECT 1;\"\" >nul 2>nul";

    int ret = std::system(testCmd.c_str());
    if (ret == 0) {
        connected_ = true;
        std::cout << "[DB] MySQL Connection established successfully to '" << config_.schema << "'!" << std::endl;
        return true;
    } else {
        lastError_ = "Failed to connect to MySQL Server at " + config_.host + ":" + std::to_string(config_.port);
        std::cerr << "[DB ERROR] " << lastError_ << std::endl;
        connected_ = false;
        return false;
    }
}

void DatabaseConnection::disconnect() {
    if (connected_) {
        std::cout << "[DB] Closing MySQL connection session." << std::endl;
        connected_ = false;
        inTransaction_ = false;
    }
}

bool DatabaseConnection::isConnected() const {
    return connected_;
}

bool DatabaseConnection::execute(const std::string& sql) {
    if (!connected_) {
        lastError_ = "Not connected to database";
        return false;
    }

    std::cout << "[DB EXEC] " << sql << std::endl;
    std::string cmd = "\"\"C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe\" -h " 
        + config_.host + " -P " + std::to_string(config_.port) 
        + " -u " + config_.user + " -p" + config_.password + " " 
        + config_.schema + " -e \"" + sql + "\"\"";

    FILE* pipe = _popen(cmd.c_str(), "r");
    if (!pipe) return false;
    char buf[256];
    std::string out = "";
    while (fgets(buf, sizeof(buf), pipe)) {
        out += buf;
    }
    int code = _pclose(pipe);
    if (code != 0 && !out.empty()) {
        std::cout << "[DB ERROR " << code << "] " << out << std::endl;
    }
    return (code == 0);
}

std::vector<QueryResultRow> DatabaseConnection::query(const std::string& sql) {
    std::vector<QueryResultRow> rows;
    if (!connected_) {
        lastError_ = "Not connected to database";
        return rows;
    }

    std::cout << "[DB QUERY] " << sql << std::endl;
    std::string cmd = "\"\"C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe\" -h " 
        + config_.host + " -P " + std::to_string(config_.port) 
        + " -u " + config_.user + " -p" + config_.password + " " 
        + config_.schema + " --batch --raw -e \"" + sql + "\"\" 2>nul";

    FILE* pipe = _popen(cmd.c_str(), "r");
    if (!pipe) return rows;

    char buffer[1024];
    std::vector<std::string> lines;
    std::string currentLine;
    while (fgets(buffer, sizeof(buffer), pipe) != NULL) {
        currentLine += buffer;
        size_t pos;
        while ((pos = currentLine.find('\n')) != std::string::npos) {
            std::string line = currentLine.substr(0, pos);
            if (!line.empty() && line.back() == '\r') line.pop_back();
            lines.push_back(line);
            currentLine.erase(0, pos + 1);
        }
    }
    if (!currentLine.empty()) lines.push_back(currentLine);
    _pclose(pipe);

    if (lines.empty()) return rows;

    // Header row contains column names
    std::vector<std::string> headers;
    std::stringstream ssHeader(lines[0]);
    std::string colName;
    while (std::getline(ssHeader, colName, '\t')) {
        headers.push_back(colName);
    }

    // Subsequent rows contain data
    for (size_t i = 1; i < lines.size(); ++i) {
        QueryResultRow row;
        std::stringstream ssRow(lines[i]);
        std::string val;
        size_t colIdx = 0;
        while (std::getline(ssRow, val, '\t')) {
            if (colIdx < headers.size()) {
                row.columns[headers[colIdx]] = val;
            }
            colIdx++;
        }
        rows.push_back(row);
    }

    return rows;
}

bool DatabaseConnection::beginTransaction() {
    if (!connected_ || inTransaction_) return false;
    std::cout << "[DB TRANSACTION] START TRANSACTION" << std::endl;
    bool res = execute("START TRANSACTION;");
    inTransaction_ = res;
    return res;
}

bool DatabaseConnection::commit() {
    if (!connected_ || !inTransaction_) return false;
    std::cout << "[DB TRANSACTION] COMMIT" << std::endl;
    bool res = execute("COMMIT;");
    inTransaction_ = false;
    return res;
}

bool DatabaseConnection::rollback() {
    if (!connected_ || !inTransaction_) return false;
    std::cout << "[DB TRANSACTION] ROLLBACK" << std::endl;
    bool res = execute("ROLLBACK;");
    inTransaction_ = false;
    return res;
}

std::string DatabaseConnection::getLastError() const {
    return lastError_;
}

} // namespace database
} // namespace synccore
