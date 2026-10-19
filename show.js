// Real-World Show & Date Scheduling Controller
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('movieId') || '1');

    // 1. Fetch movie details
    const movies = await window.API.getMovies();
    const movie = movies.find(m => m.id === movieId) || movies[0];

    // Populate header
    document.getElementById('movie-title-header').textContent = movie.title;
    const posterEl = document.getElementById('movie-header-poster');
    if (posterEl) posterEl.src = movie.poster;
    const certEl = document.getElementById('movie-header-cert');
    if (certEl) certEl.textContent = movie.certificate || 'U/A';
    const langEl = document.getElementById('movie-header-lang');
    if (langEl) langEl.textContent = movie.languages || 'English';
    const durEl = document.getElementById('movie-header-duration');
    if (durEl) durEl.textContent = `${movie.duration} • ${movie.genre}`;
    const descEl = document.getElementById('movie-header-desc');
    if (descEl) descEl.textContent = movie.description || 'Experience state-of-the-art cinema with ACID isolated seat reservation.';

    sessionStorage.setItem('selectedMovieId', movie.id);
    sessionStorage.setItem('selectedMovieTitle', movie.title);
    sessionStorage.setItem('selectedMoviePoster', movie.poster);

    // 2. Fetch available show dates strictly from MySQL backend
    const datesContainer = document.getElementById('dates-pills-container');
    const showsContainer = document.getElementById('shows-list');

    const availableDates = await window.API.getMovieDates(movie.id);

    if (!availableDates || availableDates.length === 0) {
        datesContainer.innerHTML = '<span style="color:var(--text-muted);">No scheduled dates found.</span>';
        showsContainer.innerHTML = `
            <div class="glass-panel" style="padding: 3rem 2rem; text-align: center;">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📅</div>
                <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Currently No Shows Available</h3>
                <p style="color: var(--text-secondary); max-width: 460px; margin: 0 auto 1.5rem auto; font-size: 0.9rem;">
                    This film does not have any active screenings scheduled yet. You can schedule new shows using the Admin Portal.
                </p>
                <div style="display:flex; justify-content:center; gap:1rem;">
                    <a href="../index.html" class="btn btn-secondary">Browse Other Movies</a>
                    <a href="admin.html" class="btn btn-primary" style="color:#fff;">🛡️ Admin Schedule Shows</a>
                </div>
            </div>
        `;
        return;
    }

    datesContainer.innerHTML = '';
    let selectedDate = availableDates[0];

    // Helper to format date string nicely e.g. "15 OCT"
    const formatDatePill = (dateStr) => {
        try {
            const d = new Date(dateStr);
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            return {
                day: days[d.getDay()],
                dateNum: d.getDate(),
                month: months[d.getMonth()]
            };
        } catch (e) {
            return { day: 'DATE', dateNum: dateStr.substr(8, 2), month: 'SCHED' };
        }
    };

    availableDates.forEach((dt, idx) => {
        const info = formatDatePill(dt);
        const btn = document.createElement('button');
        btn.className = `pill-btn ${idx === 0 ? 'active' : ''}`;
        btn.dataset.date = dt;
        btn.innerHTML = `<span style="font-size:0.7rem; text-transform:uppercase; color:var(--text-muted); display:block;">${info.day}</span><span style="font-weight:800; font-size:0.95rem;">${info.dateNum} ${info.month}</span>`;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#dates-pills-container .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDate = dt;
            renderShowsForDate(selectedDate);
        });

        datesContainer.appendChild(btn);
    });

    // 3. Render shows for selected date
    async function renderShowsForDate(dateStr) {
        showsContainer.innerHTML = '<div style="color:var(--text-muted); padding:2rem; text-align:center;">Loading screenings for ' + dateStr + '...</div>';
        
        const shows = await window.API.getShows(movie.id, dateStr);

        if (!shows || shows.length === 0) {
            showsContainer.innerHTML = `
                <div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--text-muted);">
                    No screenings scheduled for <strong>${dateStr}</strong>. Please select another date.
                </div>
            `;
            return;
        }

        // Group shows by Theatre
        const theatreMap = {};
        shows.forEach(s => {
            const tKey = s.theatreName || 'SyncCore Cinema';
            if (!theatreMap[tKey]) {
                theatreMap[tKey] = {
                    name: s.theatreName,
                    city: s.theatreCity,
                    shows: []
                };
            }
            theatreMap[tKey].shows.push(s);
        });

        showsContainer.innerHTML = '';

        Object.keys(theatreMap).forEach(tKey => {
            const tData = theatreMap[tKey];
            const card = document.createElement('div');
            card.className = 'glass-panel';
            card.style.padding = '1.75rem';

            let showButtonsHtml = '';
            tData.shows.forEach(sh => {
                const screenBadge = `<span class="badge badge-ready font-mono" style="font-size:0.7rem; margin-left:0.5rem;">${sh.screenType || '2D'}</span>`;
                showButtonsHtml += `
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:1rem; min-width:210px; display:flex; flex-direction:column; gap:0.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.85rem; font-weight:700; color:#fff;">${sh.screenName}</span>
                            ${screenBadge}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-muted);">
                            <span>Starting at ₹${parseFloat(sh.basePrice || 350).toFixed(0)}</span>
                            <span style="color:var(--accent-emerald); font-weight:600;">${sh.availableSeats || 24} left</span>
                        </div>
                        <a href="seats.html?showId=${sh.showId}&movieId=${movie.id}" 
                           class="btn btn-secondary btn-sm btn-select-slot" 
                           data-show-id="${sh.showId}"
                           data-theatre="${sh.theatreName}"
                           data-screen="${sh.screenName}"
                           data-date="${sh.showDate}"
                           data-time="${sh.showTime}"
                           data-price="${sh.basePrice}"
                           style="border-color:var(--accent-cyan); color:var(--accent-cyan); font-weight:700; text-align:center; margin-top:0.35rem;">
                            🎟️ ${sh.showTime} Showtime &rarr;
                        </a>
                    </div>
                `;
            });

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
                    <div>
                        <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.25rem;">
                            ${tData.name}
                        </h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">
                            ${tData.city || 'Innovation Boulevard, Delhi-NCR'} &bull; Dolby Atmos Sound & Laser Projection
                        </p>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${showButtonsHtml}
                </div>
            `;

            showsContainer.appendChild(card);
        });

        // Store selected show information when clicked
        document.querySelectorAll('.btn-select-slot').forEach(btn => {
            btn.addEventListener('click', () => {
                sessionStorage.setItem('selectedShowId', btn.dataset.showId);
                sessionStorage.setItem('selectedTheatre', btn.dataset.theatre);
                sessionStorage.setItem('selectedScreen', btn.dataset.screen);
                sessionStorage.setItem('selectedShowDate', btn.dataset.date);
                sessionStorage.setItem('selectedShowTime', btn.dataset.time);
                sessionStorage.setItem('selectedBasePrice', btn.dataset.price);
            });
        });
    }

    renderShowsForDate(selectedDate);
});
