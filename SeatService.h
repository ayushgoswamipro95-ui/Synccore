#pragma once
#include <string>
#include <vector>
#include <memory>
#include "../models/ShowSeat.h"
#include "../database/DatabaseConnection.h"

namespace synccore {
namespace booking {

class SeatService {
public:
    explicit SeatService(std::shared_ptr<database::DatabaseConnection> conn);

    std::vector<models::ShowSeat> getSeatsForShow(int showId);
    bool checkSeatAvailability(int showSeatId);
    bool lockSeat(int showSeatId, int lockDurationSeconds = 300);
    bool releaseSeat(int showSeatId);

private:
    std::shared_ptr<database::DatabaseConnection> conn_;
};

} // namespace booking
} // namespace synccore
