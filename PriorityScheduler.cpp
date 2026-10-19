#include "../../include/os/SchedulerManager.h"
#include <algorithm>

namespace synccore {
namespace os {

std::vector<Process> PriorityScheduler::schedule(const std::vector<Process>& processes) {
    std::vector<Process> scheduled = processes;
    std::sort(scheduled.begin(), scheduled.end(), [](const Process& a, const Process& b) {
        if (a.priority == b.priority) {
            return a.arrivalTime < b.arrivalTime;
        }
        return a.priority > b.priority; // higher numerical value = higher priority
    });
    return scheduled;
}

} // namespace os
} // namespace synccore
