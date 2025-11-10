function updateCountdown() {
    const targetDate = new Date('2025-11-09T00:00:00+01:00');
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
        
        // Enable program buttons if registered
        updateProgramButtons();
        
        clearInterval(countdownInterval);
        return;
    }

    nameInput.disabled = true;
    classInput.disabled = true;
    checkboxInput.disabled = true;
    submitButton.disabled = true;
    
    // Disable program buttons when timer is running
    updateProgramButtons();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    const formattedDays = String(days).padStart(2, '0');
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    headerReg.textContent = `Přihlášení začne za ${formattedDays}:${formattedHours}:${formattedMinutes}`;
}

// Add this new function to handle program button states
function updateProgramButtons() {
    const targetDate = new Date('2025-11-09T00:00:00+01:00');
    const now = new Date();
    const timerActive = targetDate - now > 0;
    const isRegistered = localStorage.getItem('userName') && localStorage.getItem('userClass');
    
    const programButtons = document.querySelectorAll('.program__button');
    
    programButtons.forEach(button => {
        const capacityDiv = button.closest('.program__buttons').querySelector('.program__capacity');
        const isFull = capacityDiv?.classList.contains('capacity__full');
        
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

// Handle form submission
document.querySelector('.action__reg').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    const classDiv = document.querySelector('.reg__class');
    const acceptLabel = document.querySelector('.reg__accept');
    const submitButton = document.querySelector('.reg__button');
    
    // Get values
    const name = nameInput.value;
    const className = classInput.value;
    
    // Store in localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userClass', className);
    
    // Update name input with combined format
    nameInput.value = `${name} ${className}`;
    nameInput.disabled = true;
    
    // Remove class input
    classDiv.remove();
    
    // Remove accept checkbox
    acceptLabel.remove();
    
    // Update button
    submitButton.textContent = 'Děkujeme za přihlášení!';
    submitButton.disabled = true;
    
    // Enable program buttons after registration
    updateProgramButtons();
});

// Check if already registered on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName');
    const savedClass = localStorage.getItem('userClass');
    
    if (savedName && savedClass) {
        const nameInput = document.querySelector('.reg__name input');
        const classDiv = document.querySelector('.reg__class');
        const acceptLabel = document.querySelector('.reg__accept');
        const submitButton = document.querySelector('.reg__button');
        
        // Update name input with combined format
        nameInput.value = `${savedName} ${savedClass}`;
        nameInput.disabled = true;
        
        // Remove class input
        if (classDiv) classDiv.remove();
        
        // Remove accept checkbox
        if (acceptLabel) acceptLabel.remove();
        
        // Update button
        submitButton.textContent = 'Děkujeme za přihlášení!';
        submitButton.disabled = true;
    }
    
    // Update program buttons state on page load
    updateProgramButtons();
});
