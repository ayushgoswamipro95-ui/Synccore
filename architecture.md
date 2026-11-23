# SyncCore System Architecture

## 1. High-Level Architecture Overview

SyncCore separates responsibilities across three distinct tiers:

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Tier                        │
│   (HTML5 + Modern CSS3 + Modular Vanilla JavaScript)   │
│   - Normal Cinema Booking Web Application              │
│   - OS / DBMS Concurrency Simulation Dashboard         │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON HTTP API
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend Tier                         │
│                    (C++14)                             │
│   ┌────────────────────────────────────────────────┐   │
│   │ Networking & HTTP Dispatcher                  │   │
│   └───────────────────────┬────────────────────────┘   │
│                           ▼                            │
│   ┌───────────────────────┬────────────────────────┐   │
│   │ Booking Engine        │ OS Simulation Engine   │   │
│   │ - Seat Allocation     │ - Process Control Block│   │
│   │ - Payment Simulation  │ - ReadyQueue           │   │
│   │ - Transaction Flow    │ - Schedulers           │   │
│   └───────────┬───────────┴───────────┬────────────┘   │
│               ▼                       ▼                │
│   ┌────────────────────────────────────────────────┐   │
│   │ Concurrency & Synchronization Control          │   │
│   │ - MutexManager & SemaphoreManager              │   │
│   │ - CriticalSection Guard                        │   │
│   │ - DeadlockDetector (Resource Graph / WFG)      │   │
│   └───────────────────────┬────────────────────────┘   │
│                           ▼                            │
│   ┌────────────────────────────────────────────────┐   │
│   │ DBMS Persistence & Connection Layer            │   │
│   │ - DatabaseConnection Pool                      │   │
│   │ - QueryExecutor & TransactionManager           │   │
│   └───────────────────────┬────────────────────────┘   │
└───────────────────────────┼────────────────────────────┘
                            │ Native Protocol / TCP
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Database Tier                        │
│                     (MySQL)                            │
│   - 12 Relational Tables (InnoDB ACID Engine)          │
│   - Row-level pessimistic locking (`FOR UPDATE`)       │
│   - Automated Triggers, Views & Stored Procedures      │
└────────────────────────────────────────────────────────┘
```

## 2. Key Modules & Responsibilities

### 2.1 Backend Modules (`backend/src/`)
- **`database/`**: Wraps raw socket/driver calls to MySQL, manages connection pools, and enforces `START TRANSACTION`, `COMMIT`, and `ROLLBACK`.
- **`booking/`**: Handles domain logic for movies, showtimes, physical seats vs show-specific seats, and simulated payment workflows.
- **`os/`**: Simulates the operating system kernel: `Process` (PCB with burst, arrival, state), `ReadyQueue`, and scheduler algorithms (`FCFS`, `SJF`, `Priority`).
- **`concurrency/`**: Models OS concurrency primitives (Mutexes, Semaphores, Critical Sections) and seat contention locks. Demonstrates Race Conditions when locks are bypassed.
- **`deadlock/`**: Implements Wait-For-Graph (WFG) analysis and Cycle Detection algorithms (DFS / Tarjan's) to identify and recover from circular lock waits.
- **`simulation/`**: Drives multi-agent virtual user requests, tracks execution timings (Turnaround, Waiting, Throughput), and generates analytical metrics.

### 2.2 Frontend Modules (`frontend/js/`)
- **`booking/`**: Client controllers for seat selection grids, dynamic price calculations, and checkout states.
- **`simulation/`**: Real-time visualization engines for the Ready Queue, CPU execution slots, Gantt charts, Lock status grids, and Deadlock warning monitors.
- **`components/`**: Reusable UI widgets: Modal dialogs, Toast notifications, SVG/Canvas performance charts, and reactive Navigation bars.
