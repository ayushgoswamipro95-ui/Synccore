// Ready Queue Visualizer
class QueueView {
    static render(processes) {
        const track = document.getElementById('ready-queue-track');
        const badge = document.getElementById('queue-count-badge');
        if (!track) return;

        track.innerHTML = '';
        if (!processes || processes.length === 0) {
            track.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Ready queue empty.</span>';
            if (badge) badge.textContent = '0 In Queue';
            return;
        }

        if (badge) badge.textContent = `${processes.length} In Queue`;

        processes.forEach((p, idx) => {
            const chip = document.createElement('div');
            chip.className = 'process-chip';
            chip.innerHTML = `
                <span style="font-weight:700; color:var(--accent-cyan);">${p.processName}${p.userName ? ` (${p.userName})` : ''}</span>
                <span style="color:var(--text-muted);">|</span>
                <span>Burst: ${p.remainingTime !== undefined ? p.remainingTime : p.burstTime}t</span>
                <span style="color:var(--text-muted);">|</span>
                <span style="color:var(--accent-amber);">Req: ${p.requestedSeat}</span>
            `;
            track.appendChild(chip);

            if (idx < processes.length - 1) {
                const arrow = document.createElement('span');
                arrow.style.color = 'var(--text-muted)';
                arrow.textContent = '→';
                track.appendChild(arrow);
            }
        });
    }
}

window.QueueView = QueueView;
