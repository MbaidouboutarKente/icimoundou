let allTalents = [];
let currentFilter = 'all';

// Charger les talents
async function loadTalents() {
    try {
        const response = await fetch('data/talents.json');
        const data = await response.json();
        allTalents = data.talents;
        initSlider();      // slider accueil
        displayFeaturedTalents(); // 4 talents du moment
        if (document.getElementById('talentsGrid')) {
            filterTalents('all');
        }
    } catch (error) {
        console.error('Erreur chargement talents:', error);
    }
}

// SLIDER (accueil)
function initSlider() {
    const sliderTrack = document.getElementById('sliderTrack');
    if (!sliderTrack) return;
    const firstThree = allTalents.slice(0, 3);
    sliderTrack.innerHTML = '';
    firstThree.forEach(talent => {
        const card = document.createElement('div');
        card.className = 'slider-card';
        card.innerHTML = `
            <img src="${talent.photo}" alt="${talent.nom}" loading="lazy">
            <h3>${talent.nom}</h3>
            <p>${talent.categorie}</p>
            <button class="btn btn-outline watch-video" data-id="${talent.id}">Voir vidéo</button>
        `;
        sliderTrack.appendChild(card);
    });
    // Gestion des clics vidéo slider
    document.querySelectorAll('.watch-video').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const talent = allTalents.find(t => t.id === id);
            if (talent) openVideoModal(talent);
        });
    });
    let currentIndex = 0;
    const total = firstThree.length;
    function updateSlider() {
        const offset = -currentIndex * 100;
        sliderTrack.style.transform = `translateX(${offset}%)`;
        updateDots();
    }
    function updateDots() {
        const dotsContainer = document.getElementById('sliderDots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateSlider();
            });
            dotsContainer.appendChild(dot);
        }
    }
    window.nextSlide = () => {
        currentIndex = (currentIndex + 1) % total;
        updateSlider();
    };
    window.prevSlide = () => {
        currentIndex = (currentIndex - 1 + total) % total;
        updateSlider();
    };
    const nextBtn = document.querySelector('.slider-btn.next');
    const prevBtn = document.querySelector('.slider-btn.prev');
    if (nextBtn) nextBtn.onclick = () => window.nextSlide();
    if (prevBtn) prevBtn.onclick = () => window.prevSlide();
    updateSlider();
}

// Affichage 4 talents du moment
function displayFeaturedTalents() {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;
    const featured = allTalents.slice(0, 4);
    featuredGrid.innerHTML = '';
    featured.forEach(talent => {
        const card = document.createElement('div');
        card.className = 'talent-card';
        card.innerHTML = `
            <img src="${talent.photo}" alt="${talent.nom}" loading="lazy">
            <div class="info">
                <h3>${talent.nom}</h3>
                <p class="category">${talent.categorie}</p>
                <p class="bio">${talent.bio.substring(0, 80)}...</p>
            </div>
        `;
        card.addEventListener('click', () => openVideoModal(talent));
        featuredGrid.appendChild(card);
    });
}

// Ouvre modale vidéo (depuis index, talents)
function openVideoModal(talent) {
    const modal = document.getElementById('videoModal') || document.getElementById('talentModal');
    if (!modal) return;
    let iframe, nameSpan, bioP;
    if (modal.id === 'videoModal') {
        iframe = document.getElementById('modalVideoIframe');
        nameSpan = document.getElementById('modalTalentName');
        bioP = document.getElementById('modalTalentBio');
    } else {
        iframe = document.getElementById('modalVideo');
        nameSpan = document.getElementById('modalNom');
        bioP = document.getElementById('modalBio');
        const modalImg = document.getElementById('modalPhoto');
        const modalCat = document.getElementById('modalCategorie');
        if (modalImg) modalImg.src = talent.photo;
        if (modalCat) modalCat.innerText = talent.categorie;
    }
    if (nameSpan) nameSpan.innerText = talent.nom;
    if (bioP) bioP.innerText = talent.bio;
    let embedUrl = '';
    if (talent.videoType === 'youtube') {
        embedUrl = talent.videoUrl.includes('embed') ? talent.videoUrl : talent.videoUrl.replace('watch?v=', 'embed/');
    } else if (talent.videoType === 'facebook') {
        embedUrl = talent.videoUrl;
    }
    if (iframe) iframe.src = embedUrl;
    modal.style.display = 'flex';
}

// Filtrage pour talents.html
async function filterTalents(category) {
    currentFilter = category;
    const grid = document.getElementById('talentsGrid');
    if (!grid) return;
    let filtered = allTalents;
    if (category !== 'all') {
        filtered = allTalents.filter(t => t.categorie === category);
    }
    grid.innerHTML = '';
    if (filtered.length === 0) {
        grid.innerHTML = '<p>Aucun talent dans cette catégorie.</p>';
        return;
    }
    filtered.forEach(talent => {
        const card = document.createElement('div');
        card.className = 'talent-card';
        card.innerHTML = `
            <img src="${talent.photo}" alt="${talent.nom}" loading="lazy">
            <div class="info">
                <h3>${talent.nom}</h3>
                <p class="category">${talent.categorie}</p>
                <p class="bio">${talent.bio.substring(0, 100)}</p>
            </div>
        `;
        card.addEventListener('click', () => openTalentModal(talent));
        grid.appendChild(card);
    });
}

function openTalentModal(talent) {
    const modal = document.getElementById('talentModal');
    if (!modal) return;
    document.getElementById('modalPhoto').src = talent.photo;
    document.getElementById('modalNom').innerText = talent.nom;
    document.getElementById('modalCategorie').innerText = talent.categorie;
    document.getElementById('modalBio').innerText = talent.bio;
    let embed = '';
    if (talent.videoType === 'youtube') {
        embed = talent.videoUrl.includes('embed') ? talent.videoUrl : talent.videoUrl.replace('watch?v=', 'embed/');
    } else {
        embed = talent.videoUrl;
    }
    document.getElementById('modalVideo').src = embed;
    modal.style.display = 'flex';
}

// Initialisation filtres
function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    if (btns.length) {
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.dataset.category;
                filterTalents(cat);
            });
        });
    }
}

// Fermeture modales
document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            const iframe = modal.querySelector('iframe');
            if (iframe) iframe.src = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    loadTalents();
    initFilters();
});