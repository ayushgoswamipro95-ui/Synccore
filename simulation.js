// Advanced, Highly-Intuitive OS & DBMS Concurrency Simulator
class SimulationController {
    constructor() {
        this.clock = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.timer = null;
        this.speedMs = 600;

        this.targetSeat = 'G10'; // User-selected target contention seat
        this.allocatedWinner = null;
        this.cancelledUsers = [];

        this.processes = [];
        this.readyQueue = [];
        this.runningProcess = null;
        this.completedProcesses = [];
        this.ganttEntries = [];

        this.initSeatPicker();
        this.setupEventListeners();
        this.setNarrative(
            '🎯 Step 1: Select a Seat & Start Simulation',
            `Seat <strong>${this.targetSeat}</strong> is currently selected. Click any seat on the left to change it, then click "▶" to watch multiple virtual users race for it!`,
            '🎯'
        );
    }

    initSeatPicker() {
        const grid = document.getElementById('sim-interactive-seat-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const rows = [
            { name: 'A', count: 6, start: 1 },
            { name: 'B', count: 6, start: 1 },
            { name: 'C', count: 6, start: 1 },
            { name: 'G', count: 6, start: 10 } // VIP G10-G15
        ];

        rows.forEach(r => {
            const rowEl = document.createElement('div');
            rowEl.className = 'sim-seat-row';

            for (let i = 0; i < r.count; i++) {
                const seatLabel = `${r.name}${r.start + i}`;
                const btn = document.createElement('button');
                btn.className = 'sim-seat-btn';
                btn.textContent = seatLabel;
                btn.dataset.seat = seatLabel;

                if (seatLabel === this.targetSeat) {
                    btn.classList.add('target-selected');
                }

                btn.addEventListener('click', () => {
                    if (this.isRunning) {
                        Toast.error('Please reset simulation before changing the target seat.');
                        return;
                    }
                    this.setTargetSeat(seatLabel);
                });

                rowEl.appendChild(btn);
            }
            grid.appendChild(rowEl);
        });
    }

    setTargetSeat(seatLabel) {
        this.targetSeat = seatLabel;
        document.querySelectorAll('.sim-seat-btn').forEach(b => {
            b.classList.remove('target-selected', 'allocated-winner', 'rejected-locked');
            if (b.dataset.seat === seatLabel) {
                b.classList.add('target-selected');
            }
        });

        const badge = document.getElementById('selected-seat-badge');
        if (badge) badge.textContent = `Seat ${seatLabel}`;

        const kpi = document.getElementById('kpi-target-seat');
        if (kpi) kpi.textContent = seatLabel;

        this.setNarrative(
            `🎯 Target Seat Set to ${seatLabel}`,
            `Virtual users will now contend specifically for Seat <strong>${seatLabel}</strong>. Press "▶" to simulate concurrent booking!`,
            '🎯'
        );
        Toast.info(`Contention seat updated to ${seatLabel}`);
    }

    setNarrative(title, descHtml, icon = '📢') {
        const titleEl = document.getElementById('narrative-step-title');
        const descEl = document.getElementById('narrative-main-text');
        const iconEl = document.getElementById('narrative-icon');

        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.innerHTML = descHtml;
        if (iconEl) iconEl.textContent = icon;
    }

    setupEventListeners() {
        const btnPlay = document.getElementById('btn-play');
        const btnPause = document.getElementById('btn-pause');
        const btnStep = document.getElementById('btn-step');
        const btnReset = document.getElementById('btn-reset-sim');
        const btnClear = document.getElementById('btn-clear-logs');
        const btnCompare = document.getElementById('btn-compare-algos');
        const speedSelect = document.getElementById('sim-speed-select');
        const algoSelect = document.getElementById('sim-algorithm');

        if (btnPlay) btnPlay.addEventListener('click', () => this.startOrResume());
        if (btnPause) btnPause.addEventListener('click', () => this.pause());
        if (btnStep) btnStep.addEventListener('click', () => this.step());
        if (btnReset) btnReset.addEventListener('click', () => this.reset());
        if (btnCompare) btnCompare.addEventListener('click', () => PerformanceView.showAlgorithmComparison());
        
        if (algoSelect) {
            algoSelect.addEventListener('change', (e) => {
                const kpiAlgo = document.getElementById('kpi-algo-name');
                if (kpiAlgo) kpiAlgo.textContent = e.target.value;
                if (!this.isRunning) this.reset();
            });
        }

        if (btnClear) {
            btnClear.addEventListener('click', () => {
                const log = document.getElementById('sim-event-log');
                if (log) log.innerHTML = '<div class="log-entry">[SYSTEM] Log buffer flushed.</div>';
            });
        }

        if (speedSelect) {
            speedSelect.addEventListener('change', (e) => {
                this.speedMs = parseInt(e.target.value);
                const badge = document.getElementById('sim-speed-badge');
                if (badge) badge.textContent = `${(600 / this.speedMs).toFixed(1)}x Speed`;
                if (this.isRunning && !this.isPaused) {
                    clearInterval(this.timer);
                    this.timer = setInterval(() => this.tick(), this.speedMs);
                }
            });
        }

        const btnRace = document.getElementById('btn-race-demo');
        if (btnRace) btnRace.addEventListener('click', () => RaceConditionDemo.show());

        const btnDeadlock = document.getElementById('btn-deadlock-demo');
        if (btnDeadlock) btnDeadlock.addEventListener('click', () => DeadlockDemo.show());
    }

    log(msg, type = '') {
        const eventLog = document.getElementById('sim-event-log');
        if (!eventLog) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[T=${this.clock}] ${msg}`;
        eventLog.appendChild(entry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }

    initWorkload() {
        const count = parseInt(document.getElementById('sim-process-count').value || 3);
        const algo = document.getElementById('sim-algorithm').value || 'FCFS';

        this.processes = [];
        this.readyQueue = [];
        this.runningProcess = null;
        this.completedProcesses = [];
        this.ganttEntries = [];
        this.clock = 0;
        this.allocatedWinner = null;
        this.cancelledUsers = [];

        // All competing users want THIS EXACT target seat!
        for (let i = 1; i <= count; i++) {
            const burst = (i === 1) ? 3 : ((i === 2) ? 2 : 4);
            const priority = (i === 3) ? 3 : 1; // P3 is VIP under priority
            const arrival = (i - 1) * 2; // P1 arrives at 0, P2 at 2, P3 at 4

            const proc = {
                processId: i,
                processName: `P${i}`,
                userName: `User 0${i}`,
                arrivalTime: arrival,
                burstTime: burst,
                remainingTime: burst,
                priority: priority,
                requestedSeat: this.targetSeat,
                state: 'NEW',
                startTime: -1,
                completionTime: 0,
                waitingTime: 0,
                turnaroundTime: 0,
                bookingStatus: 'PENDING'
            };
            this.processes.push(proc);
        }

        this.log(`Instantiated: ${count} virtual users contending for Seat ${this.targetSeat} using ${algo}`);
        this.updateUI();
    }

    startOrResume() {
        if (!this.isRunning && this.processes.length === 0) {
            this.initWorkload();
        }

        this.isRunning = true;
        this.isPaused = false;

        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-pause').disabled = false;
        document.getElementById('sim-status-badge').textContent = 'Status: RUNNING';
        document.getElementById('sim-status-badge').className = 'badge badge-running font-mono';

        clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), this.speedMs);
    }

    pause() {
        this.isPaused = true;
        clearInterval(this.timer);

        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = true;
        document.getElementById('sim-status-badge').textContent = 'Status: PAUSED';
        document.getElementById('sim-status-badge').className = 'badge badge-waiting font-mono';
        this.setNarrative('⏸ Simulation Paused', 'Simulation is paused. Press "▶" to resume or "⏭" to step 1 tick forward.', '⏸');
    }

    step() {
        if (this.processes.length === 0) {
            this.initWorkload();
        }
        this.pause();
        this.tick();
    }

    reset() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        this.clock = 0;
        this.processes = [];
        this.readyQueue = [];
        this.runningProcess = null;
        this.completedProcesses = [];
        this.ganttEntries = [];
        this.allocatedWinner = null;
        this.cancelledUsers = [];

        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = true;
        document.getElementById('sim-status-badge').textContent = 'Status: READY';
        document.getElementById('sim-status-badge').className = 'badge badge-ready font-mono';

        // Reset target seat styling
        document.querySelectorAll('.sim-seat-btn').forEach(b => {
            b.classList.remove('allocated-winner', 'rejected-locked');
            if (b.dataset.seat === this.targetSeat) {
                b.classList.add('target-selected');
            }
        });

        // Reset podium
        document.getElementById('podium-winner-name').textContent = 'None Yet';
        document.getElementById('podium-winner-desc').textContent = 'Waiting for simulation to execute...';
        document.getElementById('podium-cancelled-list').textContent = 'None';
        document.getElementById('podium-cancelled-desc').textContent = 'Processes that arrive after seat is allocated.';

        this.setNarrative(
            '🔄 Simulator Reset',
            `Select a seat or change algorithm (${document.getElementById('sim-algorithm').value}), then click "▶" to start.`,
            '🎯'
        );

        this.updateUI();
        this.log('Simulation reset to initial state.');
        Toast.info('Simulator reset.');
    }

    sortReadyQueue(algo) {
        if (algo === 'SJF') {
            this.readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        } else if (algo === 'PRIORITY') {
            this.readyQueue.sort((a, b) => b.priority - a.priority);
        } else {
            // FCFS: First Come First Served strictly by arrival time
            this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        }
    }

    tick() {
        const algo = document.getElementById('sim-algorithm').value;
        this.clock++;

        // 1. Process Arrivals into Ready Queue
        this.processes.forEach(p => {
            if (p.state === 'NEW' && p.arrivalTime <= this.clock) {
                p.state = 'READY';
                this.readyQueue.push(p);
                this.log(`${p.processName} (${p.userName}) arrived at tick ${this.clock} -> Joined Ready Queue.`, 'dispatch');
            }
        });

        this.sortReadyQueue(algo);

        // 2. Dispatch to CPU if CPU is free
        if (!this.runningProcess && this.readyQueue.length > 0) {
            this.runningProcess = this.readyQueue.shift();
            this.runningProcess.state = 'RUNNING';
            if (this.runningProcess.startTime === -1) {
                this.runningProcess.startTime = this.clock;
            }

            // CRUCIAL OS / DBMS CHECK: Is the seat already allocated to someone else?
            if (this.allocatedWinner && this.allocatedWinner.processId !== this.runningProcess.processId) {
                // THE SEAT IS ALREADY ALLOCATED! Under FCFS, subsequent users CANNOT book!
                this.runningProcess.bookingStatus = 'ROLLED_BACK';
                this.runningProcess.state = 'TERMINATED';
                this.runningProcess.completionTime = this.clock;
                this.runningProcess.turnaroundTime = this.runningProcess.completionTime - this.runningProcess.arrivalTime;
                this.runningProcess.waitingTime = this.runningProcess.turnaroundTime;

                this.cancelledUsers.push(this.runningProcess.processName);

                this.log(
                    `❌ BOOKING CANCELLED: ${this.runningProcess.processName} (${this.runningProcess.userName}) requested Seat ${this.targetSeat}, but it was ALREADY BOOKED by ${this.allocatedWinner.processName}! [ROLLBACK]`,
                    'rollback'
                );

                this.setNarrative(
                    `❌ Booking Cancelled for ${this.runningProcess.processName}`,
                    `<strong>${this.runningProcess.processName} (${this.runningProcess.userName})</strong> requested Seat <strong>${this.targetSeat}</strong>, but under ${algo}, the seat was already won by <strong>${this.allocatedWinner.processName}</strong>. Transaction ROLLBACK triggered!`,
                    '❌'
                );

                this.completedProcesses.push(this.runningProcess);
                this.runningProcess = null; // CPU free for next process
                this.updateUI();
                return;
            } else {
                // Seat is still AVAILABLE: acquire lock
                this.log(
                    `🔒 LOCK ACQUIRED: ${this.runningProcess.processName} acquired row lock on Seat ${this.targetSeat} -> START TRANSACTION`,
                    'lock'
                );

                this.setNarrative(
                    `⚙️ CPU Executing ${this.runningProcess.processName} (${algo})`,
                    `<strong>${this.runningProcess.processName}</strong> entered CPU Core. Row lock acquired on Seat <strong>${this.targetSeat}</strong>. Processing simulated payment...`,
                    '🔒'
                );
            }
        }

        // 3. Process Execution Tick
        if (this.runningProcess) {
            this.runningProcess.remainingTime--;

            // Extend Gantt block
            let lastGantt = this.ganttEntries[this.ganttEntries.length - 1];
            if (lastGantt && lastGantt.processId === this.runningProcess.processId) {
                lastGantt.endTime = this.clock;
            } else {
                this.ganttEntries.push({
                    processId: this.runningProcess.processId,
                    processName: this.runningProcess.processName,
                    startTime: this.clock - 1,
                    endTime: this.clock
                });
            }

            // Burst Completion
            if (this.runningProcess.remainingTime <= 0) {
                this.runningProcess.completionTime = this.clock;
                this.runningProcess.turnaroundTime = this.runningProcess.completionTime - this.runningProcess.arrivalTime;
                this.runningProcess.waitingTime = this.runningProcess.turnaroundTime - this.runningProcess.burstTime;
                this.runningProcess.state = 'TERMINATED';
                this.runningProcess.bookingStatus = 'COMMITTED';

                // First one to complete secures the seat permanently!
                this.allocatedWinner = this.runningProcess;

                // Visually mark seat as ALLOCATED
                document.querySelectorAll('.sim-seat-btn').forEach(b => {
                    if (b.dataset.seat === this.targetSeat) {
                        b.classList.remove('target-selected');
                        b.classList.add('allocated-winner');
                    }
                });

                this.log(
                    `🎉 COMMIT SUCCESS: Seat ${this.targetSeat} officially ALLOCATED to ${this.runningProcess.processName} (${this.runningProcess.userName})!`,
                    'commit'
                );

                this.setNarrative(
                    `🎉 Seat ${this.targetSeat} Allocated to ${this.runningProcess.processName}!`,
                    `<strong>${this.runningProcess.processName} (${this.runningProcess.userName})</strong> completed payment! Seat <strong>${this.targetSeat}</strong> is now SOLD OUT. All subsequent users requesting this seat will be cancelled.`,
                    '🏆'
                );

                this.completedProcesses.push(this.runningProcess);
                this.runningProcess = null;
            }
        }

        // 4. Check if all processes have completed
        const allDone = this.processes.every(p => p.state === 'TERMINATED');
        if (allDone && this.readyQueue.length === 0 && !this.runningProcess) {
            clearInterval(this.timer);
            this.isRunning = false;
            document.getElementById('btn-play').disabled = false;
            document.getElementById('btn-pause').disabled = true;
            document.getElementById('sim-status-badge').textContent = 'Status: COMPLETED';
            document.getElementById('sim-status-badge').className = 'badge badge-ready font-mono';

            const winnerName = this.allocatedWinner ? `${this.allocatedWinner.processName} (${this.allocatedWinner.userName})` : 'None';
            const cancelledStr = this.cancelledUsers.length > 0 ? this.cancelledUsers.join(', ') : 'None';

            let algoReason = '';
            if (algo === 'FCFS') {
                algoReason = `Because FCFS gives priority to the earliest arrival, P1 arrived first at tick 0 and booked the seat. Other users arrived later and were rejected.`;
            } else if (algo === 'SJF') {
                algoReason = `Under SJF, the user with the shortest burst time was scheduled first and captured the seat.`;
            } else if (algo === 'PRIORITY') {
                algoReason = `Under Priority Scheduling, the highest-priority VIP user jumped ahead and secured the seat.`;
            }

            this.setNarrative(
                `🏁 Simulation Complete: Winner is ${winnerName}`,
                `<strong>Outcome:</strong> Seat <strong>${this.targetSeat}</strong> was awarded to <strong>${winnerName}</strong>. Bookings for <strong>${cancelledStr}</strong> were cancelled (Rollback).<br><br><em>${algoReason}</em>`,
                '🏆'
            );

            Toast.success(`Simulation finished! Winner: ${winnerName}`);
        }

        this.updateUI();
    }

    updateUI() {
        // 1. Clock Display
        document.getElementById('sim-clock-display').textContent = this.clock;
        const ganttCount = document.getElementById('gantt-tick-count');
        if (ganttCount) ganttCount.textContent = this.clock;

        // 2. Winner / Cancelled Podium
        if (this.allocatedWinner) {
            document.getElementById('podium-winner-name').textContent = `${this.allocatedWinner.processName} (${this.allocatedWinner.userName})`;
            document.getElementById('podium-winner-desc').textContent = `Seat ${this.targetSeat} allocated & committed!`;
        }

        if (this.cancelledUsers.length > 0) {
            document.getElementById('podium-cancelled-list').textContent = this.cancelledUsers.join(', ');
            document.getElementById('podium-cancelled-desc').textContent = `Bookings cancelled because Seat ${this.targetSeat} was already sold out.`;
        }

        // 3. CPU Core Box
        const cpuBox = document.getElementById('cpu-core-visualizer');
        const cpuText = document.getElementById('cpu-status-text');
        const cpuBadge = document.getElementById('cpu-load-badge');
        const cpuBar = document.getElementById('cpu-load-bar');
        const cpuProc = document.getElementById('cpu-active-proc');

        if (this.runningProcess) {
            cpuBox.className = 'glass-panel cpu-core-box active';
            cpuText.textContent = `Processing ${this.runningProcess.processName} (${this.runningProcess.userName}) | Target: ${this.targetSeat} | Burst remaining: ${this.runningProcess.remainingTime}t`;
            cpuBadge.textContent = '85% Load (ACTIVE)';
            cpuBadge.className = 'badge badge-running font-mono';
            cpuBar.style.width = '85%';
            cpuProc.textContent = `Active: [${this.runningProcess.processName}]`;
            cpuProc.style.color = 'var(--accent-emerald)';
        } else {
            cpuBox.className = 'glass-panel cpu-core-box';
            cpuText.textContent = 'CPU Idle. Ready to dispatch processes from Ready Queue.';
            cpuBadge.textContent = '0% Load (IDLE)';
            cpuBadge.className = 'badge badge-terminated font-mono';
            cpuBar.style.width = '0%';
            cpuProc.textContent = 'Active: [IDLE]';
            cpuProc.style.color = 'var(--text-muted)';
        }

        // 4. Ready Queue
        QueueView.render(this.readyQueue);

        // 5. PCB Table Monitor
        ProcessView.render(this.processes);

        // 6. Gantt Chart
        SchedulerView.updateGantt(this.ganttEntries);

        // 7. Performance KPIs
        const done = this.processes.filter(p => p.state === 'TERMINATED');
        const commits = done.filter(p => p.bookingStatus === 'COMMITTED').length;
        const rollbacks = done.filter(p => p.bookingStatus === 'ROLLED_BACK').length;

        document.getElementById('kpi-committed').textContent = commits;
        document.getElementById('kpi-rollbacks').textContent = rollbacks;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.simController = new SimulationController();
});
