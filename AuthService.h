#pragma once
#include <string>
#include <memory>
#include <unordered_map>
#include "../database/DatabaseConnection.h"
#include "../concurrency/SyncMutex.h"

namespace synccore {
namespace auth {

struct UserSession {
    int userId = 0;
    std::string username;
    std::string email;
    std::string fullName;
    std::string role;
    std::string phone;
    std::string token;
};

struct AuthResult {
    bool success = false;
    std::string message;
    std::string token;
    UserSession user;
};

class AuthService {
public:
    explicit AuthService(std::shared_ptr<database::DatabaseConnection> conn);

    AuthResult signup(const std::string& fullName, const std::string& email, const std::string& password, const std::string& phone = "");
    AuthResult login(const std::string& email, const std::string& password);
    bool logout(const std::string& token);

    bool getSession(const std::string& token, UserSession& outSession);
    bool validateEmail(const std::string& email);
    std::string normalizeEmail(const std::string& email);

    // Seed default admin and sample users if not already hashed
    void ensureDefaultAccounts();

private:
    std::shared_ptr<database::DatabaseConnection> conn_;
    std::unordered_map<std::string, UserSession> sessions_;
    concurrency::SyncMutex sessionMutex_;

    std::string generateToken(int userId);
};

} // namespace auth
} // namespace synccore
