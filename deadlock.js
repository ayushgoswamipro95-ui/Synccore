// Controlled Educational Deadlock Simulation with SVG Wait-For-Graph
class DeadlockDemo {
    static async show() {
        const modalHtml = `
            <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.88rem;">
                Visualizing Coffman's 4 Deadlock Conditions: Mutual Exclusion, Hold & Wait, No Preemption, and <strong>Circular Wait</strong>.
            </p>

            <!-- SVG Wait-For-Graph Visualization -->
            <div style="background:#04070e; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem; display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:0.5rem; font-weight:600;">
                    Live Resource Allocation / Wait-For-Graph (WFG)
                </div>
                <svg id="deadlock-wfg-svg" width="380" height="180" viewBox="0 0 380 180" style="overflow:visible;">
                    <!-- Definitions for Arrow Markers -->
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00e5ff" />
                        </marker>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                        </marker>
                    </defs>

                    <!-- Process P1 (Circle) -->
                    <circle cx="70" cy="90" r="28" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
                    <text x="70" y="95" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono" font-size="14" font-weight="bold">P1</text>

                    <!-- Seat G10 (Square) -->
                    <rect x="160" y="25" width="60" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
                    <text x="190" y="50" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono" font-size="13" font-weight="bold">G10</text>

                    <!-- Seat G11 (Square) -->
                    <rect x="160" y="115" width="60" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
                    <text x="190" y="140" text-anchor="middle" fill="#f59e0b" font-family="JetBrains Mono" font-size="13" font-weight="bold">G11</text>

                    <!-- Process P2 (Circle) -->
                    <circle cx="310" cy="90" r="28" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" />
                    <text x="310" y="95" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono" font-size="14" font-weight="bold">P2</text>

                    <!-- Initial Dependency Lines -->
                    <path id="edge-p1-g10" d="M 98 80 L 160 52" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)" />
                    <path id="edge-p2-g11" d="M 282 100 L 220 128" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)" />

                    <!-- Circular Wait Contention Lines -->
                    <path id="edge-p1-g11" d="M 98 100 L 160 128" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4" stroke-width="2" />
                    <path id="edge-p2-g10" d="M 282 80 L 220 52" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4" stroke-width="2" />
                </svg>
                <div id="wfg-status-label" class="badge badge-ready font-mono" style="margin-top:0.75rem;">Graph Status: Acyclic (Normal)</div>
            </div>

            <div style="display:flex; gap:0.75rem; margin-bottom:1rem;">
                <button class="btn btn-danger btn-sm" style="flex:1;" onclick="DeadlockDemo.triggerCycle()">
                    1. Create Circular Wait
                </button>
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="DeadlockDemo.recover()">
                    2. Resolve via Preemption
                </button>
            </div>

            <div id="deadlock-demo-log" style="background:#060910; border-radius:var(--radius-sm); padding:0.85rem; font-family:var(--font-mono); font-size:0.78rem; min-height:90px; max-height:120px; overflow-y:auto; display:flex; flex-direction:column; gap:0.3rem;">
                <span style="color:var(--text-muted);">Simulator ready. Click "Create Circular Wait" to trigger deadlock.</span>
            </div>
        `;

        Modal.open('🛑 Deadlock Detection (Wait-For-Graph DFS Analyzer)', modalHtml);
    }

    static triggerCycle() {
        const out = document.getElementById('deadlock-demo-log');
        const statusBadge = document.getElementById('wfg-status-label');
        const edgeP1G11 = document.getElementById('edge-p1-g11');
        const edgeP2G10 = document.getElementById('edge-p2-g10');

        if (edgeP1G11) {
            edgeP1G11.setAttribute('stroke', '#f43f5e');
            edgeP1G11.setAttribute('stroke-width', '3');
            edgeP1G11.setAttribute('marker-end', 'url(#arrow-red)');
        }
        if (edgeP2G10) {
            edgeP2G10.setAttribute('stroke', '#f43f5e');
            edgeP2G10.setAttribute('stroke-width', '3');
            edgeP2G10.setAttribute('marker-end', 'url(#arrow-red)');
        }

        if (statusBadge) {
            statusBadge.textContent = 'DEADLOCK DETECTED (Circular Wait Cycle: P1 ⇄ P2)';
            statusBadge.className = 'badge badge-deadlock font-mono';
        }

        if (out) {
            out.innerHTML = `
                <div style="color:var(--accent-amber);">[P1] Holds lock on G10, blocked waiting for G11</div>
                <div style="color:var(--accent-amber);">[P2] Holds lock on G11, blocked waiting for G10</div>
                <div style="color:var(--accent-rose); font-weight:bold;">
                    [DFS KERNEL] Cycle detected in WFG: P1 ➔ G11 ➔ P2 ➔ G10 ➔ P1. CPU stalled.
                </div>
            `;
        }
        Toast.error('Deadlock Confirmed! Circular Wait detected by Kernel.');
    }

    static recover() {
        const out = document.getElementById('deadlock-demo-log');
        const statusBadge = document.getElementById('wfg-status-label');
        const edgeP1G11 = document.getElementById('edge-p1-g11');
        const edgeP2G10 = document.getElementById('edge-p2-g10');

        if (edgeP1G11) {
            edgeP1G11.setAttribute('stroke', 'rgba(255,255,255,0.15)');
            edgeP1G11.removeAttribute('marker-end');
        }
        if (edgeP2G10) {
            edgeP2G10.setAttribute('stroke', 'rgba(255,255,255,0.15)');
            edgeP2G10.removeAttribute('marker-end');
        }

        if (statusBadge) {
            statusBadge.textContent = 'Deadlock Resolved (Acyclic)';
            statusBadge.className = 'badge badge-running font-mono';
        }

        if (out) {
            out.innerHTML += `
                <div style="color:var(--accent-cyan);">[KERNEL] Selected Victim: P2 (aborted). Locks released.</div>
                <div style="color:var(--accent-emerald); font-weight:bold;">[P1] Unblocked! Booked G11 and committed transaction cleanly.</div>
            `;
            out.scrollTop = out.scrollHeight;
        }
        Toast.success('Deadlock recovered cleanly via victim preemption.');
    }
}

window.DeadlockDemo = DeadlockDemo;
