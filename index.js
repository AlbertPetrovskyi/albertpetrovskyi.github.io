const targetDate = new Date('2025-11-09T00:00:00+01:00');

function updateCountdown() {
    const now = new Date();
    const difference = targetDate - now;

    const headerReg = document.querySelector('.header__reg');
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    const checkboxInput = document.querySelector('.reg__checkbox');
    const submitButton = document.querySelector('.reg__button');

    if (difference <= 0) {
        const newLink = document.createElement('a');
        newLink.className = 'header__reg-opened';
        newLink.href = '#reg';
        newLink.textContent = 'Přihlásit se';
        headerReg.parentNode.replaceChild(newLink, headerReg);
        
        nameInput.disabled = false;
        classInput.disabled = false;
        checkboxInput.disabled = false;
        submitButton.disabled = false;
        
        
        updateProgramButtons();
        
        clearInterval(countdownInterval);
        return;
    }

    nameInput.disabled = true;
    classInput.disabled = true;
    checkboxInput.disabled = true;
    submitButton.disabled = true;
    
    
    updateProgramButtons();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    const formattedDays = String(days).padStart(2, '0');
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    headerReg.textContent = `Přihlášení začne za ${formattedDays}:${formattedHours}:${formattedMinutes}`;
}


function updateProgramButtons() {
    const now = new Date();
    const timerActive = targetDate - now > 0;
    const isRegistered = localStorage.getItem('userName') && localStorage.getItem('userClass');
    
    const programButtons = document.querySelectorAll('.program__button');
    
    programButtons.forEach(button => {
        const capacityDiv = button.closest('.program__buttons').querySelector('.program__capacity');
        const capacityText = capacityDiv?.textContent.trim();
        
        // Parse capacity (e.g., "30 / 30" or "6 / 30")
        const [current, total] = capacityText.split('/').map(num => parseInt(num.trim()));
        const isFull = current >= total;
        
        // Update capacity div styling
        if (isFull) {
            capacityDiv.style.border = '2px solid var(--red-color)';
            capacityDiv.classList.add('capacity__full');
        } else {
            capacityDiv.style.border = '2px solid var(--blue-color)';
            capacityDiv.classList.remove('capacity__full');
        }
        
        // Disable if: timer is active OR user not registered OR program is full
        if (timerActive || !isRegistered || isFull) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });
}

const countdownInterval = setInterval(updateCountdown, 60000);
updateCountdown();


document.querySelector('.action__reg').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    const nameDiv = document.querySelector('.reg__name');
    const classDiv = document.querySelector('.reg__class');
    const acceptLabel = document.querySelector('.reg__accept');
    const submitButton = document.querySelector('.reg__button');
    const gradientText = document.querySelector('.action__text-gradient');
    const headerLink = document.querySelector('.header__reg-opened');
    
    // Get values
    const name = nameInput.value;
    const className = classInput.value;
    
    // Store in localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userClass', className);
    
    // Update header link with user info
    if (headerLink) {
        headerLink.textContent = `${name} ${className}`;
    }
    
    // Remove name input
    nameDiv.remove();
    
    // Remove class input
    classDiv.remove();
    
    // Remove accept checkbox
    acceptLabel.remove();
    
    // Update button
    submitButton.textContent = 'Děkujeme za přihlášení!';
    submitButton.disabled = true;
    
    // Update gradient text
    gradientText.textContent = 'Vybírej už teď!';
    
    // Enable program buttons after registration
    updateProgramButtons();
});


window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName');
    const savedClass = localStorage.getItem('userClass');
    
    if (savedName && savedClass) {
        const nameDiv = document.querySelector('.reg__name');
        const classDiv = document.querySelector('.reg__class');
        const acceptLabel = document.querySelector('.reg__accept');
        const submitButton = document.querySelector('.reg__button');
        const gradientText = document.querySelector('.action__text-gradient');
        const headerLink = document.querySelector('.header__reg-opened');
        
        // Update header link with user info
        if (headerLink) {
            headerLink.textContent = `${savedName} ${savedClass}`;
        }
        
        // Remove name input
        if (nameDiv) nameDiv.remove();
        
        // Remove class input
        if (classDiv) classDiv.remove();
        
        // Remove accept checkbox
        if (acceptLabel) acceptLabel.remove();
        
        // Update button
        submitButton.textContent = 'Děkujeme za přihlášení!';
        submitButton.disabled = true;
        
        // Update gradient text
        if (gradientText) gradientText.textContent = 'Vybírej už teď!';
    }
    
    // Update program buttons state on page load
    updateProgramButtons();
});
