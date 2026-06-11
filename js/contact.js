/**
 * contact.js - Gestion du formulaire de contact
 * Validation côté client, envoi vers Formspree/EmailJS
 */

// Configuration (à modifier selon votre service)
const FORM_CONFIG = {
    // Option 1: Formspree (gratuit, sans backend)
    useFormspree: true,
    formspreeEndpoint: 'https://formspree.io/f/XXXXXXXX', // REMPLACER PAR VOTRE ID
    
    // Option 2: EmailJS (décommentez si utilisation)
    // useEmailJS: false,
    // emailJS: {
    //     serviceId: 'service_xxx',
    //     templateId: 'template_xxx',
    //     publicKey: 'user_xxx'
    // }
};

// Éléments du DOM
const contactForm = document.getElementById('contactForm');
const nomInput = document.getElementById('nom');
const emailInput = document.getElementById('email');
const telephoneInput = document.getElementById('telephone');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// ==================== VALIDATION ====================
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function validatePhone(phone) {
    if (!phone) return true; // Téléphone optionnel
    // Accepte les numéros internationaux et locaux
    const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,6}[-\s.]?[0-9]{1,6}$/;
    return regex.test(phone);
}

function validateForm() {
    let isValid = true;
    let errorMessages = [];
    
    // Validation nom
    if (!nomInput || !nomInput.value.trim()) {
        isValid = false;
        errorMessages.push('Le nom est requis');
        showFieldError(nomInput, 'Le nom est requis');
    } else {
        clearFieldError(nomInput);
    }
    
    // Validation email
    if (!emailInput || !emailInput.value.trim()) {
        isValid = false;
        errorMessages.push('L\'email est requis');
        showFieldError(emailInput, 'L\'email est requis');
    } else if (!validateEmail(emailInput.value.trim())) {
        isValid = false;
        errorMessages.push('L\'email n\'est pas valide');
        showFieldError(emailInput, 'Format email invalide (ex: nom@domaine.com)');
    } else {
        clearFieldError(emailInput);
    }
    
    // Validation téléphone (optionnel)
    if (telephoneInput && telephoneInput.value.trim()) {
        if (!validatePhone(telephoneInput.value.trim())) {
            isValid = false;
            errorMessages.push('Le numéro de téléphone n\'est pas valide');
            showFieldError(telephoneInput, 'Format invalide (ex: +235 XX XX XX XX)');
        } else {
            clearFieldError(telephoneInput);
        }
    } else if (telephoneInput) {
        clearFieldError(telephoneInput);
    }
    
    // Validation message
    if (!messageInput || !messageInput.value.trim()) {
        isValid = false;
        errorMessages.push('Le message est requis');
        showFieldError(messageInput, 'Le message est requis');
    } else if (messageInput.value.trim().length < 10) {
        isValid = false;
        errorMessages.push('Le message doit contenir au moins 10 caractères');
        showFieldError(messageInput, 'Minimum 10 caractères');
    } else {
        clearFieldError(messageInput);
    }
    
    return { isValid, errorMessages };
}

// Afficher une erreur sous un champ
function showFieldError(field, message) {
    if (!field) return;
    field.classList.add('error');
    
    let errorDiv = field.parentNode.querySelector('.field-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.75rem';
    errorDiv.style.marginTop = '4px';
}

function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// ==================== ENVOI DU FORMULAIRE ====================
async function sendFormWithFormspree(formData) {
    try {
        const response = await fetch(FORM_CONFIG.formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            return { success: true, message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' };
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.error || 'Erreur lors de l\'envoi. Veuillez réessayer.' };
        }
    } catch (error) {
        console.error('Erreur envoi Formspree:', error);
        return { success: false, message: 'Erreur réseau. Veuillez vérifier votre connexion.' };
    }
}

// Alternative EmailJS (si configuré)
async function sendFormWithEmailJS(formData) {
    // Nécessite d'inclure le SDK EmailJS
    // https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js
    
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS non chargé');
        return { success: false, message: 'Service d\'envoi non disponible' };
    }
    
    try {
        emailjs.init(FORM_CONFIG.emailJS.publicKey);
        
        const templateParams = {
            from_name: formData.nom,
            from_email: formData.email,
            phone: formData.telephone || 'Non renseigné',
            message: formData.message,
            to_name: 'Ici Moundou',
            reply_to: formData.email
        };
        
        const response = await emailjs.send(
            FORM_CONFIG.emailJS.serviceId,
            FORM_CONFIG.emailJS.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            return { success: true, message: 'Message envoyé avec succès !' };
        } else {
            return { success: false, message: 'Erreur lors de l\'envoi' };
        }
    } catch (error) {
        console.error('Erreur EmailJS:', error);
        return { success: false, message: 'Erreur technique. Veuillez réessayer plus tard.' };
    }
}

// Envoi principal
async function sendForm(event) {
    event.preventDefault();
    
    // Validation
    const { isValid, errorMessages } = validateForm();
    
    if (!isValid) {
        displayFormStatus(errorMessages.join(', '), 'error');
        return;
    }
    
    // Désactiver le bouton pendant l'envoi
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
    }
    
    // Préparer les données
    const formData = {
        nom: nomInput ? nomInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        telephone: telephoneInput ? telephoneInput.value.trim() : '',
        message: messageInput ? messageInput.value.trim() : ''
    };
    
    // Choix du service d'envoi
    let result;
    if (FORM_CONFIG.useFormspree) {
        result = await sendFormWithFormspree(formData);
    } else {
        result = await sendFormWithEmailJS(formData);
    }
    
    // Afficher le résultat
    if (result.success) {
        displayFormStatus(result.message, 'success');
        if (contactForm) contactForm.reset();
    } else {
        displayFormStatus(result.message, 'error');
    }
    
    // Réactiver le bouton
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le message';
    }
}

// ==================== AFFICHAGE DES STATUTS ====================
function displayFormStatus(message, type) {
    if (!formStatus) return;
    
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    
    // Auto-masquage après 5 secondes (succès seulement)
    if (type === 'success') {
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    // Scroll vers le message
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== INITIALISATION ====================
function initContactPage() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', sendForm);
    
    // Validation en temps réel (optionnel)
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            if (emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
                showFieldError(emailInput, 'Format email invalide');
            } else {
                clearFieldError(emailInput);
            }
        });
    }
    
    if (nomInput) {
        nomInput.addEventListener('blur', () => {
            if (!nomInput.value.trim()) {
                showFieldError(nomInput, 'Le nom est requis');
            } else {
                clearFieldError(nomInput);
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('blur', () => {
            if (!messageInput.value.trim()) {
                showFieldError(messageInput, 'Le message est requis');
            } else if (messageInput.value.trim().length < 10) {
                showFieldError(messageInput, 'Minimum 10 caractères');
            } else {
                clearFieldError(messageInput);
            }
        });
    }
}

// Lancer l'initialisation
if (document.getElementById('contactForm')) {
    document.addEventListener('DOMContentLoaded', initContactPage);
}

// ==================== FONCTIONS POUR COORDONNÉES ====================
// Gestion des clics sur les liens WhatsApp et autres
function initContactLinks() {
    const whatsappLink = document.querySelector('a[href*="wa.me"]');
    if (whatsappLink) {
        whatsappLink.addEventListener('click', (e) => {
            // Vous pouvez ajouter un tracking ici si besoin
            console.log('Clic sur lien WhatsApp');
        });
    }
}

document.addEventListener('DOMContentLoaded', initContactLinks);