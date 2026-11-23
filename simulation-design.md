# SyncCore OS & DBMS Concurrency Simulation Design

## 1. Operating System Concepts Modelled

### 1.1 Process Control Block (PCB)
Each booking request in simulation mode is instantiated as a lightweight OS Process:
- **`process_id`**: Unique integer identifier (e.g., `P1`, `P2`).
- **`process_name`**: User or agent label (e.g., `User01_Bot`).
- **`arrival_time`**: Timestamp in simulation clock ticks when the process enters the Ready Queue.
- **`burst_time`**: Required CPU ticks to execute validation, lock acquisition, DB write, and commit.
- **`priority`**: Numerical priority (higher value = earlier execution under priority scheduling).
- **`state`**: `READY` → `RUNNING` → `WAITING` (blocked on lock) → `TERMINATED`.
- **`requested_seat`**: Show-seat target(s) for the simulated booking.

### 1.2 CPU Scheduling Algorithms
1. **First-Come, First-Served (FCFS)**:
   - Non-preemptive scheduling strictly ordered by `arrival_time`.
2. **Shortest Job First (SJF)**:
   - Prioritizes jobs with minimum estimated `burst_time` to minimize average waiting time.
3. **Priority Scheduling**:
   - Dispatches processes based on priority ranking (e.g., VIP vs Regular booking processes).

---

## 2. Synchronization & Critical Section

### 2.1 The Seat Booking Critical Section
```
// CRITICAL SECTION PSEUDOCODE
AcquireLock(seat_id);
if (CheckSeatAvailable(seat_id)) {
    SimulateDelay(latency); // IO or payment delay
    SetSeatStatus(seat_id, BOOKED);
    CommitTransaction();
} else {
    RollbackTransaction();
}
ReleaseLock(seat_id);
```

### 2.2 Race Condition Demonstration
- **Without Synchronization**: Multiple threads enter the critical section concurrently. Both observe the seat as `AVAILABLE`, both execute booking inserts, resulting in catastrophic double-booking anomalies and data inconsistency.
- **With Synchronization**: Mutex / 2-Phase Locking serializes requests. The second process transitions to `WAITING` until the first process commits, upon which the second process wakes up, observes status `BOOKED`, and cleanly rolls back.

---

## 3. Deadlock Simulation & Detection

### 3.1 Circular Wait Scenario
- Process `P1` acquires Lock on Seat `G10` and requests Seat `G11`.
- Process `P2` acquires Lock on Seat `G11` and requests Seat `G10`.
- Neither can make progress, satisfying all 4 Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait).

### 3.2 Wait-For-Graph (WFG) & Cycle Detection
SyncCore dynamically maintains a directed graph $G = (V, E)$ where vertices are active processes and directed edges represent lock dependencies ($P_i \to P_j$ meaning $P_i$ is waiting for a resource held by $P_j$). When a cycle is detected via Depth-First Search, a `DEADLOCK_DETECTED` alert is broadcast with automated victim termination and lock release recovery.
