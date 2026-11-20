#include "../../include/deadlock/DeadlockDetector.h"
#include <sstream>

namespace synccore {
namespace deadlock {

void DeadlockDetector::addEdge(int waitingProcessId, int holdingProcessId) {
    waitGraph_[waitingProcessId].insert(holdingProcessId);
}

void DeadlockDetector::removeEdge(int waitingProcessId, int holdingProcessId) {
    auto it = waitGraph_.find(waitingProcessId);
    if (it != waitGraph_.end()) {
        it->second.erase(holdingProcessId);
    }
}

void DeadlockDetector::clear() {
    waitGraph_.clear();
}

bool DeadlockDetector::dfs(int current, std::map<int, bool>& visited, std::map<int, bool>& inStack,
                           std::vector<int>& path, std::vector<int>& cycle) {
    visited[current] = true;
    inStack[current] = true;
    path.push_back(current);

    auto it = waitGraph_.find(current);
    if (it != waitGraph_.end()) {
        for (int neighbor : it->second) {
            if (!visited[neighbor]) {
                if (dfs(neighbor, visited, inStack, path, cycle)) return true;
            } else if (inStack[neighbor]) {
                // Cycle detected
                cycle.clear();
                bool foundStart = false;
                for (int node : path) {
                    if (node == neighbor) foundStart = true;
                    if (foundStart) cycle.push_back(node);
                }
                cycle.push_back(neighbor);
                return true;
            }
        }
    }

    path.pop_back();
    inStack[current] = false;
    return false;
}

DeadlockInfo DeadlockDetector::detectDeadlock() {
    DeadlockInfo info;
    std::map<int, bool> visited;
    std::map<int, bool> inStack;
    std::vector<int> path;
    std::vector<int> cycle;

    for (const auto& kv : waitGraph_) {
        int node = kv.first;
        if (!visited[node]) {
            if (dfs(node, visited, inStack, path, cycle)) {
                info.hasDeadlock = true;
                info.cycleProcessIds = cycle;
                std::ostringstream ss;
                ss << "Circular Wait Cycle Detected: ";
                for (size_t i = 0; i < cycle.size(); ++i) {
                    ss << "P" << cycle[i] << (i + 1 < cycle.size() ? " -> " : "");
                }
                info.description = ss.str();
                return info;
            }
        }
    }

    info.hasDeadlock = false;
    info.description = "No deadlock detected in Wait-For-Graph.";
    return info;
}

} // namespace deadlock
} // namespace synccore
