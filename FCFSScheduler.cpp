#include "../../include/os/SchedulerManager.h"
#include <algorithm>

namespace synccore {
namespace os {

std::vector<Process> FCFSScheduler::schedule(const std::vector<Process>& processes) {
    std::vector<Process> scheduled = processes;
    std::sort(scheduled.begin(), scheduled.end(), [](const Process& a, const Process& b) {
        return a.arrivalTime < b.arrivalTime;
    });
    return scheduled;
}

} // namespace os
} // namespace synccore
