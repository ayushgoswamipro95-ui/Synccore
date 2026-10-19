// Modal Dialog Manager
class ModalManager {
    static open(title, contentHtml) {
        let overlay = document.getElementById('global-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-modal-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0, 0, 0, 0.7)';
            overlay.style.backdropFilter = 'blur(6px)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '9998';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="glass-panel" style="max-width: 550px; width: 90%; padding: 2rem; position: relative;">
                <h3 style="margin-bottom: 1rem;">${title}</h3>
                <div>${contentHtml}</div>
                <button class="btn btn-secondary btn-sm" style="position: absolute; top: 1rem; right: 1rem;" onclick="ModalManager.close()">✕</button>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    static close() {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) overlay.style.display = 'none';
    }
}

window.Modal = ModalManager;
