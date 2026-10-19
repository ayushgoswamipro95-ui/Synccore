// Live Process Control Block (PCB) Monitor Table View
class ProcessView {
    static render(processes) {
        const tbody = document.getElementById('pcb-table-body');
        if (!tbody) return;

        if (!processes || processes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center; color:var(--text-muted); padding:1.5rem;">
                        No active processes. Press "▶" to instantiate simulation workload.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';
        processes.forEach(p => {
            const tr = document.createElement('tr');
            
            let stateBadgeClass = 'badge-ready';
            if (p.state === 'RUNNING') stateBadgeClass = 'badge-running';
            else if (p.state === 'WAITING') stateBadgeClass = 'badge-waiting';
            else if (p.state === 'TERMINATED') stateBadgeClass = 'badge-terminated';

            let dbmsBadge = '<span style="color:var(--text-muted);">PENDING</span>';
            if (p.bookingStatus === 'COMMITTED') {
                dbmsBadge = '<span style="color:var(--accent-emerald); font-weight:700;">✓ COMMITTED</span>';
            } else if (p.bookingStatus === 'ROLLED_BACK') {
                dbmsBadge = '<span style="color:var(--accent-rose); font-weight:700;">✕ ROLLED_BACK</span>';
            }

            tr.innerHTML = `
                <td class="font-mono" style="font-weight:700;">${p.processName}</td>
                <td>${p.userName || 'User 0' + p.processId}</td>
                <td><span class="badge ${stateBadgeClass}">${p.state}</span></td>
                <td class="font-mono" style="color:var(--accent-cyan); font-weight:700;">${p.requestedSeat}</td>
                <td class="font-mono">${p.burstTime}t</td>
                <td class="font-mono" style="font-weight:700;">${p.remainingTime !== undefined ? p.remainingTime : 0}t</td>
                <td class="font-mono">${p.arrivalTime}t</td>
                <td class="font-mono">${p.waitingTime || 0}t</td>
                <td class="font-mono">${p.turnaroundTime || 0}t</td>
                <td>${dbmsBadge}</td>
            `;

            if (p.state === 'RUNNING') {
                tr.style.background = 'rgba(16, 185, 129, 0.08)';
            } else if (p.state === 'WAITING') {
                tr.style.background = 'rgba(245, 158, 11, 0.08)';
            }

            tbody.appendChild(tr);
        });
    }
}

window.ProcessView = ProcessView;
