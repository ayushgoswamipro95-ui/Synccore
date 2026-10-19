// Seat Selection Interactive Controller
document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('seat-layout-grid');
    const selectedDisplay = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price-display');
    const proceedBtn = document.getElementById('btn-proceed-booking');

    if (!gridContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const showId = urlParams.get('showId') || sessionStorage.getItem('selectedShowId') || '101';
    const movieName = sessionStorage.getItem('selectedMovieTitle') || 'Inception';
    const theatreName = sessionStorage.getItem('selectedTheatre') || 'IMAX Cyberplex';
    const screenName = sessionStorage.getItem('selectedScreen') || 'Screen 1';
    const showDate = sessionStorage.getItem('selectedShowDate') || 'Today';
    const showTime = sessionStorage.getItem('selectedShowTime') || '18:00';

    sessionStorage.setItem('selectedShowId', showId);

    const showBadge = document.getElementById('show-badge');
    if (showBadge) showBadge.textContent = `${movieName} • Show #${showId}`;

    const subTitle = document.getElementById('seat-page-subtitle');
    if (subTitle) {
        subTitle.textContent = `${theatreName} • ${screenName} • ${showDate} ${showTime}`;
    }

    const seats = await window.API.getSeats(showId);
    let selectedSeats = [];

    // Group seats by row
    const rowMap = {};
    seats.forEach(s => {
        if (!rowMap[s.row]) rowMap[s.row] = [];
        rowMap[s.row].push(s);
    });

    gridContainer.innerHTML = '';

    Object.keys(rowMap).forEach(rowKey => {
        const rowEl = document.createElement('div');
        rowEl.className = 'seat-row';

        const rowLabel = document.createElement('div');
        rowLabel.className = 'row-identifier';
        rowLabel.textContent = rowKey;
        rowEl.appendChild(rowLabel);

        rowMap[rowKey].forEach(seat => {
            const seatEl = document.createElement('div');
            seatEl.className = `seat ${seat.status.toLowerCase()}`;
            seatEl.textContent = seat.label;
            seatEl.dataset.seatLabel = seat.label;
            seatEl.dataset.price = seat.price;
            seatEl.dataset.showSeatId = seat.showSeatId || seat.id;

            if (seat.status === 'AVAILABLE') {
                seatEl.addEventListener('click', () => {
                    if (seatEl.classList.contains('selected')) {
                        seatEl.classList.remove('selected');
                        selectedSeats = selectedSeats.filter(s => s.label !== seat.label);
                    } else {
                        seatEl.classList.add('selected');
                        selectedSeats.push(seat);
                    }
                    updateSelectionSummary();
                });
            }

            rowEl.appendChild(seatEl);
        });

        gridContainer.appendChild(rowEl);
    });

    function updateSelectionSummary() {
        if (selectedSeats.length === 0) {
            selectedDisplay.textContent = 'None';
            priceDisplay.textContent = '₹0.00';
            proceedBtn.disabled = true;
        } else {
            selectedDisplay.textContent = selectedSeats.map(s => s.label).join(', ');
            const total = selectedSeats.reduce((acc, s) => acc + s.price, 0);
            priceDisplay.textContent = `₹${total.toFixed(2)}`;
            proceedBtn.disabled = false;
        }
    }

    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            if (selectedSeats.length === 0) return;

            // Enforce user authentication before proceeding
            window.requireAuth(() => {
                sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
                window.location.href = 'booking.html';
            });
        });
    }
});
