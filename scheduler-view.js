// Scheduler Visualizer
class SchedulerView {
    static updateGantt(ganttEntries) {
        if (window.ChartRenderer) {
            window.ChartRenderer.renderGantt('gantt-timeline', ganttEntries);
        }
    }
}

window.SchedulerView = SchedulerView;
