#include "../../include/os/SchedulerManager.h"
#include <algorithm>

namespace synccore {
namespace os {

std::vector<Process> SJFScheduler::schedule(const std::vector<Process>& processes) {
    std::vector<Process> scheduled = processes;
    std::sort(scheduled.begin(), scheduled.end(), [](const Process& a, const Process& b) {
        if (a.burstTime == b.burstTime) {
            return a.arrivalTime < b.arrivalTime;
        }
        return a.burstTime < b.burstTime;
    });
    return scheduled;
}

} // namespace os
} // namespace synccore
