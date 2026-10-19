// Global App Orchestrator
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[SyncCore] Frontend App initialized.');
    
    // Check backend status
    if (window.API) {
        const status = await window.API.getStatus();
        console.log('[SyncCore] Backend State:', status);
    }
});
