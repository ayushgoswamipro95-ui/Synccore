# SyncCore Team Collaboration & Contribution Guide

This guide ensures 4 team developers can work simultaneously on SyncCore without code collisions or merge conflicts.

## 1. Team Responsibilities & Module Ownership

| Developer | Core Responsibility | Directory Scopes |
| :--- | :--- | :--- |
| **Developer 1 (Frontend)** | Cinema Booking Flow & Simulation Dashboards | `frontend/`, `frontend/css/`, `frontend/js/` |
| **Developer 2 (OS Systems)** | Process Modeling & CPU Schedulers | `backend/src/os/`, `backend/include/os/` |
| **Developer 3 (DBMS & ACID)** | Database Models, Queries & Transactions | `backend/src/database/`, `backend/src/transaction/`, `database/` |
| **Developer 4 (Concurrency)** | Mutexes, Locks, Deadlock, Engine & Networking | `backend/src/concurrency/`, `backend/src/deadlock/`, `backend/src/simulation/`, `backend/src/main.cpp` |

---

## 2. Coding Conventions

### C++ Conventions
- Use standard C++14.
- Header guards or `#pragma once` on all headers.
- Class definitions in `backend/include/<module>/<Class>.h`.
- Implementations in `backend/src/<module>/<Class>.cpp`.
- Clean error handling with exceptions or result status structs.
- Never place `using namespace std;` inside headers.

### JavaScript Conventions
- Modular ES6 files with clear class or object namespaces.
- Keep UI rendering isolated from backend API communication (`frontend/js/api.js`).

### SQL Conventions
- SQL keywords in uppercase (`SELECT`, `INSERT`, `BEGIN`, `COMMIT`, `ROLLBACK`).
- Foreign keys with explicit `ON DELETE CASCADE` or `RESTRICT`.
