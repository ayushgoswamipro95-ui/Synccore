#include "../../include/os/ProcessManager.h"

namespace synccore {
namespace os {

Process ProcessManager::createProcess(const std::string& name, const std::string& runId, 
                                     int burstTime, int priority, const std::string& seatLabel) {
    concurrency::SyncLockGuard lock(mutex_);
    Process p;
    p.processId = nextPid_++;
    p.processName = name;
    p.simulationRunId = runId;
    p.burstTime = burstTime;
    p.remainingTime = burstTime;
    p.priority = priority;
    p.state = ProcessState::READY;
    p.requestedSeatLabel = seatLabel;
    processes_[p.processId] = p;
    return p;
}

bool ProcessManager::updateProcessState(int processId, ProcessState state) {
    concurrency::SyncLockGuard lock(mutex_);
    auto it = processes_.find(processId);
    if (it == processes_.end()) return false;
    it->second.state = state;
    return true;
}

bool ProcessManager::getProcess(int processId, Process& outProc) const {
    concurrency::SyncLockGuard lock(mutex_);
    auto it = processes_.find(processId);
    if (it == processes_.end()) return false;
    outProc = it->second;
    return true;
}

std::vector<Process> ProcessManager::getAllProcesses() const {
    concurrency::SyncLockGuard lock(mutex_);
    std::vector<Process> list;
    for (const auto& kv : processes_) {
        list.push_back(kv.second);
    }
    return list;
}

void ProcessManager::reset() {
    concurrency::SyncLockGuard lock(mutex_);
    processes_.clear();
    nextPid_ = 1;
}

} // namespace os
} // namespace synccore
