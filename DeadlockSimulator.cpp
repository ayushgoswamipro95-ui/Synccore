#include "../../include/deadlock/DeadlockSimulator.h"

namespace synccore {
namespace deadlock {

DeadlockSimulator::DeadlockSimulator()
    : detector_(std::make_unique<DeadlockDetector>()) {
    reset();
}

void DeadlockSimulator::reset() {
    detector_->clear();
    currentState_.isDeadlocked = false;
    currentState_.process1Holding = "NONE";
    currentState_.process1Requesting = "NONE";
    currentState_.process2Holding = "NONE";
    currentState_.process2Requesting = "NONE";
    currentState_.logEvents.clear();
    currentState_.statusMessage = "Simulator Idle";
}

DeadlockSimulationState DeadlockSimulator::triggerDeadlockScenario(const std::string& resA, const std::string& resB) {
    reset();

    currentState_.process1Holding = resA;
    currentState_.process1Requesting = resB;
    currentState_.process2Holding = resB;
    currentState_.process2Requesting = resA;

    currentState_.logEvents.push_back("P1 acquires lock on Seat " + resA);
    currentState_.logEvents.push_back("P2 acquires lock on Seat " + resB);
    currentState_.logEvents.push_back("P1 requests lock on Seat " + resB + " -> BLOCKED by P2");
    currentState_.logEvents.push_back("P2 requests lock on Seat " + resA + " -> BLOCKED by P1");

    // Add edges to Wait-For-Graph: P1 waits for P2, P2 waits for P1
    detector_->addEdge(1, 2);
    detector_->addEdge(2, 1);

    auto result = detector_->detectDeadlock();
    currentState_.isDeadlocked = result.hasDeadlock;
    currentState_.statusMessage = result.description;
    currentState_.logEvents.push_back("ANALYZER: " + result.description);

    return currentState_;
}

DeadlockSimulationState DeadlockSimulator::recoverFromDeadlock(int victimProcessId) {
    if (!currentState_.isDeadlocked) return currentState_;

    currentState_.logEvents.push_back("RECOVERY TRIGGERED: Selecting P" + std::to_string(victimProcessId) + " as victim process");
    currentState_.logEvents.push_back("P" + std::to_string(victimProcessId) + " rolled back, releasing all held locks");

    detector_->clear();
    currentState_.isDeadlocked = false;
    currentState_.statusMessage = "Deadlock resolved. Victim P" + std::to_string(victimProcessId) + " aborted and restarted.";
    currentState_.logEvents.push_back(currentState_.statusMessage);

    return currentState_;
}

} // namespace deadlock
} // namespace synccore
