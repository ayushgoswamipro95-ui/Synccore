// Booking Summary Controller
document.addEventListener('DOMContentLoaded', () => {
    const rawSeats = sessionStorage.getItem('selectedSeats');
    if (!rawSeats) {
        if (window.Toast) Toast.error('No seats selected. Please select your seats.');
        window.location.href = 'shows.html';
        return;
    }

    const user = window.API ? window.API.getUser() : null;

    // Prefill customer name and email from authenticated user
    const nameInput = document.getElementById('cust-name-input');
    const emailInput = document.getElementById('cust-email-input');

    if (user) {
        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
    }

    const seats = JSON.parse(rawSeats);
    const seatNames = seats.map(s => s.label).join(', ');
    const subtotal = seats.reduce((acc, s) => acc + s.price, 0);
    const grandTotal = subtotal + 45;

    const movieTitle = sessionStorage.getItem('selectedMovieTitle') || 'SyncCore Screening';
    const theatre = sessionStorage.getItem('selectedTheatre') || 'IMAX Cyberplex';
    const screen = sessionStorage.getItem('selectedScreen') || 'Screen 1';
    const showDate = sessionStorage.getItem('selectedShowDate') || 'Today';
    const showTime = sessionStorage.getItem('selectedShowTime') || '18:00';

    const movieEl = document.getElementById('summary-movie');
    const showEl = document.getElementById('summary-show');
    const seatsEl = document.getElementById('summary-seats');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');

    if (movieEl) movieEl.textContent = movieTitle;
    if (showEl) showEl.textContent = `${theatre} • ${screen} • ${showDate}, ${showTime}`;
    if (seatsEl) seatsEl.textContent = seatNames;
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;

    const proceedBtn = document.getElementById('btn-proceed-payment');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            const custName = nameInput ? nameInput.value.trim() : '';
            const custEmail = emailInput ? emailInput.value.trim() : '';

            if (!custName || !custEmail) {
                if (window.Toast) Toast.error('Please enter your full name and email address.');
                return;
            }

            sessionStorage.setItem('customerName', custName);
            sessionStorage.setItem('customerEmail', custEmail);
            sessionStorage.setItem('totalAmount', grandTotal);

            window.location.href = 'payment.html';
        });
    }
});
