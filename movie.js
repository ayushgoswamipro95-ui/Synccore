// Movie Catalog Module
document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('movies-list');
    if (!listContainer) return;

    const movies = await window.API.getMovies();
    listContainer.innerHTML = '';

    movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.5rem';
        card.innerHTML = `
            <span class="badge badge-ready" style="margin-bottom:0.5rem;">${m.genre}</span>
            <h3 style="font-size:1.2rem; margin-bottom:0.5rem;">${m.title}</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">Duration: ${m.duration} mins</p>
            <a href="shows.html?movieId=${m.id}" class="btn btn-primary" style="width:100%;">View Showtimes</a>
        `;
        listContainer.appendChild(card);
    });
});
