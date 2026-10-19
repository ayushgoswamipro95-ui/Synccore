// Chart Visualizer for Gantt Timelines and Metrics
class ChartRenderer {
    static renderGantt(containerId, entries) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (!entries || entries.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted); padding:1rem;">No execution timeline yet.</span>';
            return;
        }

        const totalDuration = entries[entries.length - 1].endTime;
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

        entries.forEach((e, idx) => {
            const duration = e.endTime - e.startTime;
            const pct = (duration / (totalDuration || 1)) * 100;
            const block = document.createElement('div');
            block.className = 'gantt-block';
            block.style.width = `${pct}%`;
            block.style.backgroundColor = colors[idx % colors.length];
            block.title = `${e.processName}: [${e.startTime} - ${e.endTime}ms]`;
            block.textContent = e.processName;
            container.appendChild(block);
        });
    }
}

window.ChartRenderer = ChartRenderer;
