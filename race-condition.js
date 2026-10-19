// Dedicated Race Condition Demonstration with Interleaved Thread Visualization
class RaceConditionDemo {
    static async show() {
        const modalHtml = `
            <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.88rem;">
                Visualizing Concurrent Critical Section race on shared memory resource (<strong>Seat G10</strong>).
            </p>

            <div style="background:#04070e; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem;">
                <!-- Memory Cell Box -->
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:0.5rem 1rem; border-radius:var(--radius-sm); margin-bottom:1rem; border:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Shared DB State (Seat G10):</span>
                    <span id="shared-mem-state" class="font-mono" style="font-size:0.9rem; font-weight:700; color:var(--accent-emerald);">[STATUS: AVAILABLE]</span>
                </div>

                <!-- Side by Side Thread Blocks -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div style="border-right:1px solid var(--border-color); padding-right:0.75rem;">
                        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700; margin-bottom:0.5rem;">
                            Thread 1 (Process P1)
                        </div>
                        <div id="thread1-trace" class="font-mono" style="font-size:0.75rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.3rem;">
                            <span>Idle</span>
                        </div>
                    </div>
                    <div style="padding-left:0.25rem;">
                        <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-purple); font-weight:700; margin-bottom:0.5rem;">
                            Thread 2 (Process P2)
                        </div>
                        <div id="thread2-trace" class="font-mono" style="font-size:0.75rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.3rem;">
                            <span>Idle</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:flex; gap:0.75rem; margin-bottom:1rem;">
                <button class="btn btn-danger btn-sm" style="flex:1;" onclick="RaceConditionDemo.run(false)">
                    1. Run WITHOUT Mutex (Race)
                </button>
                <button class="btn btn-primary btn-sm" style="flex:1;" onclick="RaceConditionDemo.run(true)">
                    2. Run WITH Mutex Guard
                </button>
            </div>

            <div id="race-demo-summary" style="font-size:0.82rem; font-family:var(--font-mono); padding:0.75rem; border-radius:var(--radius-sm); background:#060910;">
                <span style="color:var(--text-muted);">Select a test mode above to execute instruction interleaving...</span>
            </div>
        `;

        Modal.open('⚡ Race Condition & Critical Section Interleaving Lab', modalHtml);
    }

    static run(synchronized) {
        const t1 = document.getElementById('thread1-trace');
        const t2 = document.getElementById('thread2-trace');
        const mem = document.getElementById('shared-mem-state');
        const summary = document.getElementById('race-demo-summary');

        if (!synchronized) {
            mem.textContent = '[STATUS: DOUBLE-BOOKED!]';
            mem.style.color = 'var(--accent-rose)';

            t1.innerHTML = `
                <div style="color:var(--text-primary);">1. READ G10 -> AVAILABLE</div>
                <div style="color:var(--text-muted);">&bull; Context Switch...</div>
                <div style="color:var(--text-primary);">3. WRITE G10 -> BOOKED (P1)</div>
                <div style="color:var(--accent-emerald);">4. COMMIT Transaction</div>
            `;

            t2.innerHTML = `
                <div style="color:var(--text-muted);">&bull; Waiting for CPU slice...</div>
                <div style="color:var(--text-primary);">2. READ G10 -> AVAILABLE (Stale!)</div>
                <div style="color:var(--text-primary);">4. WRITE G10 -> BOOKED (P2)</div>
                <div style="color:var(--accent-emerald);">5. COMMIT Transaction</div>
            `;

            summary.innerHTML = `
                <span style="color:var(--accent-rose); font-weight:bold;">
                    ⚠️ ANOMALY DETECTED: Lost Update / Double Booking! Both P1 and P2 committed Seat G10 because neither thread synchronized the Check-Then-Act critical section.
                </span>
            `;
            Toast.error('Race Condition occurred! Double booking anomaly.');
        } else {
            mem.textContent = '[STATUS: BOOKED by P1]';
            mem.style.color = 'var(--accent-cyan)';

            t1.innerHTML = `
                <div style="color:var(--accent-amber);">1. ACQUIRE Mutex(G10) -> OK</div>
                <div style="color:var(--text-primary);">2. READ G10 -> AVAILABLE</div>
                <div style="color:var(--text-primary);">3. WRITE G10 -> BOOKED (P1)</div>
                <div style="color:var(--accent-emerald);">4. COMMIT Transaction</div>
                <div style="color:var(--accent-cyan);">5. RELEASE Mutex(G10)</div>
            `;

            t2.innerHTML = `
                <div style="color:var(--accent-amber);">1. ACQUIRE Mutex(G10) -> BLOCKED</div>
                <div style="color:var(--text-muted);">&bull; Thread Sleeping in Lock Queue...</div>
                <div style="color:var(--accent-cyan);">&bull; Woken up by Mutex Release</div>
                <div style="color:var(--text-primary);">6. READ G10 -> BOOKED</div>
                <div style="color:var(--accent-rose);">7. ROLLBACK Transaction</div>
            `;

            summary.innerHTML = `
                <span style="color:var(--accent-emerald); font-weight:bold;">
                    ✓ SYNCHRONIZED: Mutex serialized execution. P1 booked safely while P2 waited in the lock queue and cleanly rolled back. Data integrity 100% preserved.
                </span>
            `;
            Toast.success('Synchronization verified! Critical section protected.');
        }
    }
}

window.RaceConditionDemo = RaceConditionDemo;
