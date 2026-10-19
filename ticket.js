/**
 * SyncCore Cinema — Universal E-Ticket Component
 * Renders an official boarding-pass style cinema ticket modal with QR code
 * and print/PDF download capabilities.
 */

(function () {
    // Ensure CSS is loaded
    if (!document.getElementById('ticket-styles-link')) {
        const link = document.createElement('link');
        link.id = 'ticket-styles-link';
        link.rel = 'stylesheet';
        // Handle relative paths depending on current directory
        const prefix = window.location.pathname.includes('/pages/') ? '../' : './';
        link.href = prefix + 'css/ticket.css';
        document.head.appendChild(link);
    }

    /**
     * Open and display the official ticket modal
     * @param {Object} data - Ticket details
     */
    window.openTicket = async function (data) {
        if (!data) return;

        // If data is just a booking ID number, fetch full ticket from API
        if (typeof data === 'number' || (typeof data === 'string' && !isNaN(data))) {
            if (window.API && window.API.getTicket) {
                const fetched = await window.API.getTicket(data);
                if (fetched && fetched.bookingId) {
                    data = fetched;
                }
            }
        }

        const bRef = data.bookingReference || (data.bookingId ? 'BK-' + data.bookingId : 'BK-827341');
        const mTitle = data.movieTitle || 'SyncCore Presentation';
        
        // Handle poster path
        let poster = data.posterUrl || '../assets/posters/inception.jpg';
        if (window.location.pathname.includes('/pages/') && !poster.startsWith('../') && !poster.startsWith('http') && !poster.startsWith('/')) {
            poster = '../' + poster;
        }

        const theatre = data.theatreName || 'SyncCore Cinemas';
        const screen = data.screenName || 'Screen 1 (Laser 4K)';
        const date = data.movieDate || data.showDate || new Date().toISOString().split('T')[0];
        const time = data.movieTime || data.showTime || '19:00';
        const seats = data.seats || data.seatsString || 'G10';
        const totalAmount = parseFloat(data.totalAmount || 350).toFixed(2);
        const currentUser = (window.API && window.API.getUser()) || (window.SyncCoreAuth && window.SyncCoreAuth.getUser());
        const customerName = data.customerName || currentUser?.name || currentUser?.fullName || 'Customer';
        const customerEmail = data.customerEmail || currentUser?.email || 'customer@synccore.com';
        const bookingStatus = data.bookingStatus || 'CONFIRMED';
        const paymentStatus = data.paymentStatus || 'PAID';

        // Split seat badges
        const seatBadgesHtml = seats.split(',')
            .map(s => `<span class="seat-pill">${s.trim()}</span>`)
            .join(' ');

        // Remove any existing ticket modal
        let existingModal = document.getElementById('synccore-ticket-modal');
        if (existingModal) existingModal.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'synccore-ticket-modal';
        modalOverlay.className = 'ticket-modal-overlay';

        modalOverlay.innerHTML = `
            <div class="ticket-modal-content">
                <div class="ticket-actions-bar">
                    <span style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;">
                        Official Admission E-Pass
                    </span>
                    <div class="ticket-actions-group">
                        <button id="btn-print-ticket" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #10b981, #059669); color:#fff;">
                            🖨️ Download / Print Ticket (PDF)
                        </button>
                        <button id="btn-close-ticket" class="btn btn-secondary btn-sm" style="color:#e2e8f0;">
                            ✕ Close
                        </button>
                    </div>
                </div>

                <!-- Printable Ticket Card -->
                <div id="synccore-ticket-print-target" class="cinema-ticket-card">
                    <div class="ticket-header">
                        <div class="ticket-brand">
                            <span class="ticket-brand-dot"></span>
                            <span>SyncCore Cinema</span>
                        </div>
                        <div class="ticket-badge-official">
                            <span>✓</span> Verified Ticket
                        </div>
                    </div>

                    <div class="ticket-body">
                        <div class="ticket-poster-wrap">
                            <img src="${poster}" alt="${mTitle}" onerror="this.src='../assets/posters/inception.jpg'">
                        </div>
                        <div class="ticket-main-info">
                            <div>
                                <h2 class="ticket-movie-title">${mTitle}</h2>
                                <div class="ticket-theatre-title">📍 ${theatre}</div>
                                <div class="ticket-screen-title">🎬 ${screen}</div>
                            </div>

                            <div class="ticket-grid-details">
                                <div class="ticket-detail-item">
                                    <span class="ticket-detail-label">Date</span>
                                    <span class="ticket-detail-val">${date}</span>
                                </div>
                                <div class="ticket-detail-item">
                                    <span class="ticket-detail-label">Showtime</span>
                                    <span class="ticket-detail-val">${time}</span>
                                </div>
                                <div class="ticket-detail-item">
                                    <span class="ticket-detail-label">Reference</span>
                                    <span class="ticket-detail-val font-mono" style="color:#00e5ff;">${bRef}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 0 1.75rem;">
                        <div class="ticket-seats-bar">
                            <div style="display:flex; align-items:center; gap:0.6rem;">
                                <span style="font-size:0.78rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Reserved Seats:</span>
                                <div class="ticket-seat-badges">${seatBadgesHtml}</div>
                            </div>
                            <div style="text-align:right;">
                                <span style="font-size:0.75rem; color:#94a3b8; margin-right:0.4rem;">Total Paid:</span>
                                <span class="font-mono" style="font-weight:800; color:#10b981; font-size:1.05rem;">₹${totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Perforated Cutout Line -->
                    <div class="ticket-perforation">
                        <div class="ticket-cutout-left"></div>
                        <div class="ticket-dashed-line"></div>
                        <div class="ticket-cutout-right"></div>
                    </div>

                    <!-- Ticket Stub with QR Code -->
                    <div class="ticket-stub">
                        <div class="ticket-stub-user">
                            <div>
                                <span style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700;">Ticket Holder</span>
                                <div style="font-weight:700; color:#fff; font-size:0.95rem;">${customerName}</div>
                                <div style="font-size:0.8rem; color:#94a3b8;">${customerEmail}</div>
                            </div>
                            <div style="display:flex; gap:0.6rem; align-items:center; margin-top:0.4rem;">
                                <span style="font-size:0.72rem; padding:0.2rem 0.5rem; border-radius:4px; background:rgba(16,185,129,0.15); color:#10b981; font-weight:700;">${paymentStatus}</span>
                                <span style="font-size:0.72rem; padding:0.2rem 0.5rem; border-radius:4px; background:rgba(0,229,255,0.15); color:#00e5ff; font-weight:700;">${bookingStatus}</span>
                            </div>
                            <div class="ticket-footer-legal">
                                Scan at cinema gate turnstile. Valid for single entry only.<br>
                                Powered by SyncCore Pessimistic ACID Kernel.
                            </div>
                        </div>

                        <div class="ticket-qr-container">
                            <div id="qrcode-canvas-target"></div>
                            <div class="ticket-qr-label">${bRef}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Generate QR Code into container
        const qrBox = document.getElementById('qrcode-canvas-target');
        if (qrBox) {
            qrBox.innerHTML = '';
            if (typeof QRCode !== 'undefined') {
                try {
                    new QRCode(qrBox, {
                        text: bRef,
                        width: 114,
                        height: 114,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } catch (e) {
                    qrBox.innerHTML = renderFallbackQR(bRef);
                }
            } else {
                qrBox.innerHTML = renderFallbackQR(bRef);
            }
        }

        // Close handlers
        document.getElementById('btn-close-ticket').onclick = () => modalOverlay.remove();
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) modalOverlay.remove();
        };

        // Print / PDF download handler
        document.getElementById('btn-print-ticket').onclick = () => {
            window.print();
        };
    };

    /**
     * Fallback QR SVG if canvas QR fails
     */
    function renderFallbackQR(text) {
        return `
            <svg width="114" height="114" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white"/>
                <!-- Corner finder 1 -->
                <rect x="10" y="10" width="25" height="25" fill="black"/>
                <rect x="15" y="15" width="15" height="15" fill="white"/>
                <rect x="18" y="18" width="9" height="9" fill="black"/>
                <!-- Corner finder 2 -->
                <rect x="65" y="10" width="25" height="25" fill="black"/>
                <rect x="70" y="15" width="15" height="15" fill="white"/>
                <rect x="73" y="18" width="9" height="9" fill="black"/>
                <!-- Corner finder 3 -->
                <rect x="10" y="65" width="25" height="25" fill="black"/>
                <rect x="15" y="70" width="15" height="15" fill="white"/>
                <rect x="18" y="73" width="9" height="9" fill="black"/>
                <!-- Data blocks simulated -->
                <rect x="42" y="12" width="6" height="6" fill="black"/>
                <rect x="52" y="18" width="6" height="6" fill="black"/>
                <rect x="42" y="28" width="16" height="6" fill="black"/>
                <rect x="12" y="42" width="6" height="16" fill="black"/>
                <rect x="25" y="42" width="6" height="6" fill="black"/>
                <rect x="42" y="42" width="16" height="16" fill="black"/>
                <rect x="68" y="42" width="8" height="8" fill="black"/>
                <rect x="80" y="52" width="8" height="8" fill="black"/>
                <rect x="42" y="68" width="8" height="14" fill="black"/>
                <rect x="55" y="80" width="12" height="8" fill="black"/>
                <rect x="72" y="68" width="16" height="16" fill="black"/>
            </svg>
        `;
    }
})();
