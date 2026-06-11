/**
 * talents.js - Gestion de la page talents.html
 * Filtrage, grille dynamique, modale vidéo
 */

// Variables globales
let allTalents = [];
let currentTalentId = null;

// Éléments DOM
const talentsGrid = document.getElementById('talentsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('talentModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModalBtn');

// ==================== CHARGEMENT DES TALENTS ====================
async function loadTalents() {
    try {
        const response = await fetch('data/talents.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Support des deux structures
        if (Array.isArray(data)) {
            allTalents = data;
        } else if (data.talents && Array.isArray(data.talents)) {
            allTalents = data.talents;
        } else {
            throw new Error('Format JSON invalide');
        }
        
        // Afficher tous les talents au chargement
        displayTalents(allTalents);
        
    } catch (error) {
        console.error('Erreur chargement talents:', error);
        displayErrorMessage('Impossible de charger les talents. Veuillez réessayer plus tard.');
    }
}

// ==================== AFFICHAGE DE LA GRILLE ====================
function displayTalents(talents) {
    if (!talentsGrid) return;
    
    if (talents.length === 0) {
        talentsGrid.innerHTML = '<div class="no-results">Aucun talent trouvé dans cette catégorie</div>';
        return;
    }
    
    talentsGrid.innerHTML = '';
    
    talents.forEach(talent => {
        const card = createTalentCard(talent);
        talentsGrid.appendChild(card);
    });
    
    // Réinitialiser les animations sur les nouvelles cartes
    if (typeof revealAnimatedElements !== 'undefined') {
        revealAnimatedElements();
    }
}

// Création d'une carte talent
function createTalentCard(talent) {
    const card = document.createElement('div');
    card.className = 'talent-card';
    card.setAttribute('data-id', talent.id);
    card.setAttribute('data-category', talent.categorie);
    
    const categoryLabels = {
        'musique': 'Musique',
        'comedie': 'Comédie',
        'art': 'Art',
        'traditionnel': 'Traditionnel',
        'mode': 'Mode'
    };
    const categoryDisplay = categoryLabels[talent.categorie] || talent.categorie;
    
    // Troncature de la bio (50 mots max)
    const bioShort = truncateWords(talent.bio, 50);
    
    card.innerHTML = `
        <div class="talent-card-inner" onclick="openModal(${talent.id})">
            <div class="talent-img-wrapper">
                <img src="${talent.photo || 'assets/images/placeholder.jpg'}" 
                     alt="${escapeHtml(talent.nom)}" 
                     class="talent-img"
                     loading="lazy"
                     onerror="this.src='assets/images/placeholder.jpg'">
                <span class="talent-category-badge">${categoryDisplay}</span>
            </div>
            <div class="talent-info">
                <h3 class="talent-name">${escapeHtml(talent.nom)}</h3>
                <p class="talent-bio">${escapeHtml(bioShort)}</p>
            </div>
        </div>
    `;
    
    return card;
}

// Troncature d'un texte à X mots
function truncateWords(text, maxWords) {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
}

// ==================== FILTRAGE ====================
function filterTalents(category) {
    if (!allTalents.length) return;
    
    let filteredTalents;
    
    if (category === 'all') {
        filteredTalents = allTalents;
    } else {
        filteredTalents = allTalents.filter(talent => talent.categorie === category);
    }
    
    displayTalents(filteredTalents);
    
    // Mettre à jour l'état actif des boutons
    filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ==================== MODALE ====================
function openModal(talentId) {
    const talent = allTalents.find(t => t.id === talentId);
    if (!talent) return;
    
    currentTalentId = talentId;
    
    if (!modal || !modalContent) return;
    
    // Générer le contenu de la modale
    const categoryLabels = {
        'musique': 'Musique',
        'comedie': 'Comédie',
        'art': 'Art',
        'traditionnel': 'Traditionnel',
        'mode': 'Mode'
    };
    
    // Générer l'embed vidéo selon le type
    let videoEmbed = '';
    if (talent.videoUrl) {
        if (talent.videoType === 'youtube') {
            videoEmbed = `<iframe src="${talent.videoUrl}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else if (talent.videoType === 'facebook') {
            videoEmbed = `<iframe src="${talent.videoUrl}&autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            // Détection automatique
            if (talent.videoUrl.includes('youtube.com/embed')) {
                videoEmbed = `<iframe src="${talent.videoUrl}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
                videoEmbed = `<iframe src="${talent.videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            }
        }
    }
    
    modalContent.innerHTML = `
        <div class="modal-layout">
            <div class="modal-video">
                ${videoEmbed || '<div class="no-video">Vidéo non disponible</div>'}
            </div>
            <div class="modal-info">
                <div class="modal-header">
                    <img src="${talent.photo || 'assets/images/placeholder.jpg'}" 
                         alt="${escapeHtml(talent.nom)}"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    <div class="modal-header-text">
                        <h2>${escapeHtml(talent.nom)}</h2>
                        <span class="modal-category">${categoryLabels[talent.categorie] || talent.categorie}</span>
                    </div>
                </div>
                <div class="modal-bio">
                    <h3>Biographie</h3>
                    <p>${escapeHtml(talent.bio)}</p>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Nettoyer le contenu vidéo (arrêter la lecture)
    if (modalContent) {
        modalContent.innerHTML = '';
    }
    currentTalentId = null;
}

// ==================== INITIALISATION ====================
function initTalentsPage() {
    // Charger les talents
    loadTalents();
    
    // Ajouter les écouteurs sur les boutons de filtre
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterTalents(category);
        });
    });
    
    // Modale : fermeture
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    // Fermeture avec touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Exporter les fonctions pour usage global
window.openModal = openModal;
window.closeModal = closeModal;
window.filterTalents = filterTalents;

// Lancer l'initialisation si on est sur la page talents
if (document.getElementById('talentsGrid')) {
    document.addEventListener('DOMContentLoaded', initTalentsPage);
}

// ==================== UTILITAIRES ====================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function displayErrorMessage(message) {
    if (talentsGrid) {
        talentsGrid.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    }
}