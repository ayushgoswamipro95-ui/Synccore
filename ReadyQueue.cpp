#include "../../include/os/ReadyQueue.h"

namespace synccore {
namespace os {

void ReadyQueue::push(const Process& proc) {
    concurrency::SyncLockGuard lock(mutex_);
    queue_.push_back(proc);
}

bool ReadyQueue::pop(Process& outProc) {
    concurrency::SyncLockGuard lock(mutex_);
    if (queue_.empty()) return false;
    outProc = queue_.front();
    queue_.pop_front();
    return true;
}

bool ReadyQueue::peek(Process& outProc) const {
    concurrency::SyncLockGuard lock(mutex_);
    if (queue_.empty()) return false;
    outProc = queue_.front();
    return true;
}

bool ReadyQueue::empty() const {
    concurrency::SyncLockGuard lock(mutex_);
    return queue_.empty();
}

size_t ReadyQueue::size() const {
    concurrency::SyncLockGuard lock(mutex_);
    return queue_.size();
}

void ReadyQueue::clear() {
    concurrency::SyncLockGuard lock(mutex_);
    queue_.clear();
}

std::vector<Process> ReadyQueue::getAll() const {
    concurrency::SyncLockGuard lock(mutex_);
    return std::vector<Process>(queue_.begin(), queue_.end());
}

} // namespace os
} // namespace synccore
