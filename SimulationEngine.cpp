#include "../../include/simulation/SimulationEngine.h"
#include "../../include/simulation/PerformanceAnalyzer.h"
#include "../../include/os/ProcessManager.h"
#include <iostream>

namespace synccore {
namespace simulation {

SimulationEngine::SimulationEngine() : isRunning_(false) {}

void SimulationEngine::stop() {
    isRunning_ = false;
}

SimulationResult SimulationEngine::runSimulation(const SimulationConfig& config) {
    isRunning_ = true;
    SimulationResult result;
    result.runId = config.runId;
    result.algorithm = config.algorithm;

    result.eventLogs.push_back("Starting simulation run " + config.runId + " using " + config.algorithm);

    // Generate virtual processes
    std::vector<models::Process> inputProcs;
    for (int i = 1; i <= config.processCount; ++i) {
        models::Process p;
        p.processId = i;
        p.processName = "P" + std::to_string(i);
        p.simulationRunId = config.runId;
        p.arrivalTime = (i - 1) * 2;
        p.burstTime = 4 + (i % 3) * 2;
        p.remainingTime = p.burstTime;
        p.priority = (i % 3) + 1;
        p.state = models::ProcessState::READY;
        // In high contention, multiple users fight for G10
        p.requestedSeatLabel = (config.contentionLevel == "HIGH" && i <= 3) ? "G10" : ("G" + std::to_string(10 + i));
        inputProcs.push_back(p);
    }

    // Schedule using chosen algorithm
    auto scheduler = os::SchedulerManager::getInstance().getScheduler(config.algorithm);
    auto scheduledProcs = scheduler->schedule(inputProcs);

    int currentTime = 0;
    std::string heldSeat = "";
    int seatHolderPid = 0;

    for (auto& proc : scheduledProcs) {
        if (currentTime < proc.arrivalTime) {
            currentTime = proc.arrivalTime;
        }

        proc.startTime = currentTime;
        GanttChartEntry entry;
        entry.processId = proc.processId;
        entry.processName = proc.processName;
        entry.startTime = currentTime;

        // Process execution
        result.eventLogs.push_back(proc.processName + " dispatched to CPU (Burst: " + std::to_string(proc.burstTime) + ")");
        
        if (config.enableSynchronization) {
            if (heldSeat == proc.requestedSeatLabel && seatHolderPid != 0) {
                // Contention conflict! Seat already booked by another process
                result.eventLogs.push_back(proc.processName + " detected seat " + proc.requestedSeatLabel + " already LOCKED/BOOKED -> ROLLBACK");
                proc.bookingStatus = "ROLLED_BACK";
            } else {
                heldSeat = proc.requestedSeatLabel;
                seatHolderPid = proc.processId;
                result.eventLogs.push_back(proc.processName + " acquired lock on " + proc.requestedSeatLabel + " -> COMMIT");
                proc.bookingStatus = "COMMITTED";
            }
        } else {
            // Unsynchronized: race condition anomaly
            result.eventLogs.push_back(proc.processName + " booked " + proc.requestedSeatLabel + " (Unsynchronized!)");
            proc.bookingStatus = "COMMITTED";
        }

        currentTime += proc.burstTime;
        entry.endTime = currentTime;
        result.ganttChart.push_back(entry);

        proc.completionTime = currentTime;
        proc.turnaroundTime = proc.completionTime - proc.arrivalTime;
        proc.waitingTime = proc.turnaroundTime - proc.burstTime;
        proc.state = models::ProcessState::TERMINATED;

        result.processList.push_back(proc);
    }

    PerformanceAnalyzer::computeMetrics(result);
    result.eventLogs.push_back("Simulation completed successfully. Total processes: " + std::to_string(result.totalProcesses));
    isRunning_ = false;
    return result;
}

} // namespace simulation
} // namespace synccore
