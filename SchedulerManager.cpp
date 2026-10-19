#include "../../include/os/SchedulerManager.h"

namespace synccore {
namespace os {

SchedulerManager::SchedulerManager()
    : fcfs_(std::make_shared<FCFSScheduler>()),
      sjf_(std::make_shared<SJFScheduler>()),
      priority_(std::make_shared<PriorityScheduler>()) {}

std::shared_ptr<IScheduler> SchedulerManager::getScheduler(const std::string& name) {
    if (name == "SJF") return sjf_;
    if (name == "PRIORITY") return priority_;
    return fcfs_; // Default to FCFS
}

} // namespace os
} // namespace synccore
