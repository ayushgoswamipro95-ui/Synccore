// Dynamic Seat Lock & Mutex Status Visualizer
class LockView {
    static render(locks) {
        const container = document.getElementById('lock-grid');
        if (!container) return;

        container.innerHTML = '';
        const seats = ['G10', 'G11', 'G12', 'G13', 'G14', 'G15'];

        seats.forEach(seat => {
            const lockInfo = locks && locks[seat] ? locks[seat] : { state: 'FREE', holder: 0, waiting: [] };
            const card = document.createElement('div');
            card.className = 'lock-card';

            if (lockInfo.state === 'ACQUIRED') {
                if (lockInfo.waiting && lockInfo.waiting.length > 0) {
                    card.className = 'lock-card conflict';
                } else {
                    card.className = 'lock-card acquired';
                }
            } else {
                card.className = 'lock-card free';
            }

            let holderHtml = '<span style="color:var(--text-muted); font-size:0.75rem;">FREE</span>';
            if (lockInfo.state === 'ACQUIRED') {
                holderHtml = `<span style="color:var(--accent-amber); font-weight:700; font-size:0.78rem;">🔒 HELD BY P${lockInfo.holder}</span>`;
            }

            let waitingHtml = '';
            if (lockInfo.waiting && lockInfo.waiting.length > 0) {
                waitingHtml = `<div style="color:var(--accent-rose); font-size:0.7rem; margin-top:0.2rem; font-weight:600;">Blocked: ${lockInfo.waiting.map(w => 'P' + w).join(', ')}</div>`;
            }

            card.innerHTML = `
                <div class="font-mono" style="font-weight:700; font-size:1.1rem; color:var(--text-primary);">${seat}</div>
                <div style="margin-top:0.35rem;">${holderHtml}</div>
                ${waitingHtml}
            `;
            container.appendChild(card);
        });
    }
}

window.LockView = LockView;
