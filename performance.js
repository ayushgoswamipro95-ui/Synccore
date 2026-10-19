// Performance Metrics & Algorithm Benchmark Comparison
class PerformanceView {
    static update(metrics) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('kpi-waiting-time', `${metrics.avgWaitingTime} ms`);
        setVal('kpi-turnaround-time', `${metrics.avgTurnaroundTime} ms`);
        setVal('kpi-committed', metrics.successfulBookings);
        setVal('kpi-rollbacks', metrics.rollbacks);
    }

    static showAlgorithmComparison() {
        // Run simulated benchmark for FCFS, SJF, and Priority with same workload
        const fcfs = window.API.clientSimulate({ algorithm: 'FCFS', processCount: 8, contentionLevel: 'HIGH' });
        const sjf = window.API.clientSimulate({ algorithm: 'SJF', processCount: 8, contentionLevel: 'HIGH' });
        const priority = window.API.clientSimulate({ algorithm: 'PRIORITY', processCount: 8, contentionLevel: 'HIGH' });

        const modalHtml = `
            <p style="color:var(--text-secondary); margin-bottom:1.25rem; font-size:0.88rem;">
                Comparative evaluation across 8 concurrent virtual processes with high seat contention (G10):
            </p>

            <table class="data-table" style="margin-bottom:1.5rem; font-size:0.82rem;">
                <thead>
                    <tr>
                        <th>Algorithm</th>
                        <th>Avg Waiting Time</th>
                        <th>Avg Turnaround</th>
                        <th>Committed</th>
                        <th>Rollbacks</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight:700; color:var(--accent-blue);">FCFS</td>
                        <td class="font-mono">${fcfs.avgWaitingTime} ms</td>
                        <td class="font-mono">${fcfs.avgTurnaroundTime} ms</td>
                        <td class="font-mono" style="color:var(--accent-emerald); font-weight:700;">${fcfs.successfulBookings}</td>
                        <td class="font-mono" style="color:var(--accent-rose); font-weight:700;">${fcfs.rollbacks}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:700; color:var(--accent-cyan);">SJF (Optimal Wait)</td>
                        <td class="font-mono" style="color:var(--accent-cyan); font-weight:700;">${sjf.avgWaitingTime} ms</td>
                        <td class="font-mono">${sjf.avgTurnaroundTime} ms</td>
                        <td class="font-mono" style="color:var(--accent-emerald); font-weight:700;">${sjf.successfulBookings}</td>
                        <td class="font-mono" style="color:var(--accent-rose); font-weight:700;">${sjf.rollbacks}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:700; color:var(--accent-purple);">Priority</td>
                        <td class="font-mono">${priority.avgWaitingTime} ms</td>
                        <td class="font-mono">${priority.avgTurnaroundTime} ms</td>
                        <td class="font-mono" style="color:var(--accent-emerald); font-weight:700;">${priority.successfulBookings}</td>
                        <td class="font-mono" style="color:var(--accent-rose); font-weight:700;">${priority.rollbacks}</td>
                    </tr>
                </tbody>
            </table>

            <div style="background:#060910; border-radius:var(--radius-sm); padding:1rem; font-size:0.8rem; color:var(--text-secondary); line-height:1.5;">
                <strong style="color:var(--accent-cyan);">Theoretical Insight:</strong><br>
                Shortest Job First (SJF) demonstrably reduces average process waiting time compared to FCFS by preventing convoy effects. 
                However, in a transactional DBMS environment, high-burst processes can experience lock waiting time escalation if a hot seat lock is held by earlier processes.
            </div>
        `;

        Modal.open('📊 CPU Scheduling & DBMS Benchmark Comparison', modalHtml);
    }
}

window.PerformanceView = PerformanceView;
