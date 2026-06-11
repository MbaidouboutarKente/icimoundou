/**
 * videos.js - Galerie vidéo dynamique
 * Extraction des vidéos depuis talents.json, affichage en grille
 * Lecture en modale au clic (lazy loading des iframes)
 */

// Variables globales
let videosList = [];
const videosGrid = document.getElementById('videosGrid');
const videoModal = document.getElementById('videoModal');
const videoModalContainer = document.getElementById('videoModalContainer');
const closeVideoModalBtn = document.getElementById('closeVideoModalBtn');

// ==================== CHARGEMENT DES VIDÉOS ====================
async function loadVideos() {
    try {
        const response = await fetch('data/talents.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Extraire le tableau des talents
        let talents = [];
        if (Array.isArray(data)) {
            talents = data;
        } else if (data.talents && Array.isArray(data.talents)) {
            talents = data.talents;
        }
        
        // Filtrer les talents qui ont une vidéo
        videosList = talents.filter(talent => talent.videoUrl && talent.videoUrl.trim() !== '');
        
        // Afficher la galerie
        displayVideoGallery(videosList);
        
        // Mettre à jour le compteur
        updateVideoCount();
        
    } catch (error) {
        console.error('Erreur chargement vidéos:', error);
        displayErrorMessage('Impossible de charger les vidéos. Veuillez réessayer plus tard.');
    }
}

// ==================== AFFICHAGE DE LA GALERIE ====================
function displayVideoGallery(videos) {
    if (!videosGrid) return;
    
    if (videos.length === 0) {
        videosGrid.innerHTML = '<div class="no-results">Aucune vidéo disponible pour le moment</div>';
        return;
    }
    
    videosGrid.innerHTML = '';
    
    videos.forEach((video, index) => {
        const card = createVideoCard(video, index);
        videosGrid.appendChild(card);
    });
}

// Création d'une carte vidéo (miniature cliquable)
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-id', video.id);
    
    // Extraire l'ID de la vidéo pour générer une miniature
    const thumbnailUrl = getThumbnailUrl(video.videoUrl, video.videoType);
    
    card.innerHTML = `
        <div class="video-card-inner" onclick="openVideoModalById(${video.id})">
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" 
                     alt="${escapeHtml(video.nom)}" 
                     loading="lazy"
                     onerror="this.src='assets/images/video-placeholder.jpg'">
                <div class="play-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${escapeHtml(video.nom)}</h3>
                <p class="video-category">${getCategoryLabel(video.categorie)}</p>
                <p class="video-description">${escapeHtml(truncateText(video.bio, 80))}</p>
            </div>
        </div>
    `;
    
    return card;
}

// Récupérer l'URL de la miniature selon la plateforme
function getThumbnailUrl(videoUrl, videoType) {
    if (videoType === 'youtube') {
        // Extraire l'ID YouTube
        let videoId = '';
        if (videoUrl.includes('youtube.com/embed/')) {
            videoId = videoUrl.split('/embed/')[1]?.split('?')[0];
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('/').pop().split('?')[0];
        } else if (videoUrl.includes('v=')) {
            videoId = new URLSearchParams(videoUrl.split('?')[1]).get('v');
        }
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
    } else if (videoType === 'facebook') {
        // Facebook : utiliser une image par défaut car l'API est complexe
        return 'assets/images/facebook-placeholder.jpg';
    }
    
    // Image par défaut
    return 'assets/images/video-placeholder.jpg';
}

// Libellé de catégorie
function getCategoryLabel(categorie) {
    const labels = {
        'musique': '🎵 Musique',
        'comedie': '🎭 Comédie',
        'art': '🎨 Art',
        'traditionnel': '🏺 Traditionnel',
        'mode': '👗 Mode'
    };
    return labels[categorie] || categorie;
}

// ==================== MODALE VIDÉO (lazy loading) ====================
function openVideoModalById(videoId) {
    const video = videosList.find(v => v.id === videoId);
    if (!video || !videoModal) return;
    
    // Générer l'embed avec autoplay
    let embedHtml = '';
    
    if (video.videoType === 'youtube') {
        let embedUrl = video.videoUrl;
        if (!embedUrl.includes('autoplay')) {
            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        embedHtml = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else if (video.videoType === 'facebook') {
        let embedUrl = video.videoUrl;
        if (!embedUrl.includes('autoplay')) {
            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        embedHtml = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
        // Détection automatique
        embedHtml = `<iframe src="${video.videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
    
    if (videoModalContainer) {
        videoModalContainer.innerHTML = embedHtml;
    }
    
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Nettoyer l'iframe pour arrêter la lecture
    if (videoModalContainer) {
        videoModalContainer.innerHTML = '';
    }
}

// ==================== COMPTEUR DE VIDÉOS ====================
function updateVideoCount() {
    const videoCountElement = document.getElementById('videoCount');
    if (videoCountElement) {
        videoCountElement.textContent = `${videosList.length} vidéo${videosList.length > 1 ? 's' : ''}`;
    }
}

// ==================== FILTRAGE VIDÉOS (optionnel) ====================
function filterVideosByCategory(category) {
    if (!videosList.length) return;
    
    let filtered = videosList;
    if (category !== 'all') {
        filtered = videosList.filter(video => video.categorie === category);
    }
    
    displayVideoGallery(filtered);
    
    // Mettre à jour l'état des boutons
    const filterBtns = document.querySelectorAll('.video-filter-btn');
    filterBtns.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ==================== INITIALISATION ====================
function initVideosPage() {
    loadVideos();
    
    // Fermeture modale
    if (closeVideoModalBtn) {
        closeVideoModalBtn.addEventListener('click', closeVideoModal);
    }
    
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
    
    // Filtres vidéo (si présents)
    const videoFilters = document.querySelectorAll('.video-filter-btn');
    videoFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            filterVideosByCategory(btn.dataset.category);
        });
    });
}

// Exporter pour usage global
window.openVideoModalById = openVideoModalById;
window.closeVideoModal = closeVideoModal;
window.filterVideosByCategory = filterVideosByCategory;

// ==================== UTILITAIRES ====================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function displayErrorMessage(message) {
    if (videosGrid) {
        videosGrid.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    }
}

// Lancer l'initialisation si on est sur la page vidéos
if (document.getElementById('videosGrid')) {
    document.addEventListener('DOMContentLoaded', initVideosPage);
}