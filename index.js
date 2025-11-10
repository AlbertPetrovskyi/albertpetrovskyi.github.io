const targetDate = new Date('2025-11-01T00:00:00+01:00');

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

// Track selected programs
let selectedPrograms = [];

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

// Add click event listeners to program buttons
document.querySelectorAll('.program__button').forEach((button, index) => {
    button.addEventListener('click', () => {
        const programIndex = index;
        const isSelected = selectedPrograms.includes(programIndex);
        
        if (isSelected) {
            // Deselect program
            selectedPrograms = selectedPrograms.filter(i => i !== programIndex);
            button.style.border = '2px solid var(--dark-color)';
            button.style.color = 'var(--dark-color)';
            button.style.backgroundColor = 'var(--light-color)';
            
            // Update SVG color
            const svg = button.querySelector('svg');
            if (svg) {
                svg.querySelector('path').style.fill = 'var(--dark-color)';
                // Update button text while keeping SVG
                button.innerHTML = '';
                button.appendChild(svg);
                button.appendChild(document.createTextNode('Vybrat'));
            }
        } else {
            // Select program if less than 2 are selected
            if (selectedPrograms.length < 2) {
                selectedPrograms.push(programIndex);
                button.style.border = '2px solid var(--green-color)';
                button.style.color = 'var(--green-color)';
                button.style.backgroundColor = 'var(--light-color)';
                
                // Update SVG color
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.querySelector('path').style.fill = 'var(--green-color)';
                    // Update button text while keeping SVG
                    button.innerHTML = '';
                    button.appendChild(svg);
                    button.appendChild(document.createTextNode('Vybráno'));
                }
            }
        }
        
        // Store selected programs in localStorage
        localStorage.setItem('selectedPrograms', JSON.stringify(selectedPrograms));
        
        // Update confirmation button
        updateConfirmationButton();
    });
});

// Function to update or remove the confirmation button
function updateConfirmationButton() {
    let confirmContainer = document.querySelector('.confirmation__container');
    
    if (selectedPrograms.length === 2) {
        // Get program titles
        const programDivs = document.querySelectorAll('.programs__program');
        const firstProgram = programDivs[selectedPrograms[0]].querySelector('.program__title').textContent;
        const secondProgram = programDivs[selectedPrograms[1]].querySelector('.program__title').textContent;
        
        if (!confirmContainer) {
            // Create confirmation container
            confirmContainer = document.createElement('div');
            confirmContainer.className = 'confirmation__container';
            
            // Create back button
            const backButton = document.createElement('button');
            backButton.className = 'confirmation__back';
            backButton.textContent = 'Zpět';
            backButton.type = 'button';
            backButton.addEventListener('click', () => {
                confirmContainer.remove();
            });
            
            // Create confirm button
            const confirmButton = document.createElement('button');
            confirmButton.className = 'confirmation__button';
            confirmButton.type = 'button';
            confirmButton.innerHTML = `${firstProgram}, ${secondProgram} &#8211; Potvrdit?`;
            confirmButton.addEventListener('click', async () => {
                try {
                    // Get user data from localStorage
                    const name = localStorage.getItem('userName');
                    const className = localStorage.getItem('userClass');
                    
                    // Disable button and show loading state
                    confirmButton.disabled = true;
                    confirmButton.textContent = 'Odesílání...';
                    
                    // Prepare form data
                    const formData = new URLSearchParams();
                    formData.append('name', name);
                    formData.append('class', className);
                    formData.append('firstProgram', firstProgram);
                    formData.append('secondProgram', secondProgram);
                    
                    // Send data to Google Sheets API using GET with parameters
                    const url = `https://script.google.com/macros/s/AKfycbwflYk9twbOM6vNAGhMMkLWfC-SQuHzV1OTI5ljsLxCqmD61L5J7QoY0YOyQHJry376/exec?name=${encodeURIComponent(name)}&class=${encodeURIComponent(className)}&firstProgram=${encodeURIComponent(firstProgram)}&secondProgram=${encodeURIComponent(secondProgram)}`;
                    
                    const res = await fetch(url, {
                        method: "GET",
                        redirect: "follow"
                    });
                    
                    const result = await res.json();
                    
                    if (result.status === "success") {
                        // Success - update button
                        confirmButton.textContent = 'Úspěšně odesláno!';
                        confirmButton.style.backgroundColor = 'var(--green-color)';
                        
                        // Remove the container after 2 seconds
                        setTimeout(() => {
                            confirmContainer.remove();
                        }, 2000);
                    } else {
                        throw new Error('Failed to save data');
                    }
                } catch (error) {
                    console.error('Error submitting data:', error);
                    confirmButton.textContent = 'Chyba! Zkuste to znovu.';
                    confirmButton.style.backgroundColor = 'var(--red-color)';
                    confirmButton.disabled = false;
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        confirmButton.innerHTML = `${firstProgram}, ${secondProgram} &#8211; Potvrdit?`;
                        confirmButton.style.backgroundColor = 'var(--green-color)';
                    }, 3000);
                }
            });
            
            confirmContainer.appendChild(backButton);
            confirmContainer.appendChild(confirmButton);
            document.body.appendChild(confirmContainer);
        } else {
            // Update existing button text
            const confirmButton = confirmContainer.querySelector('.confirmation__button');
            confirmButton.innerHTML = `${firstProgram}, ${secondProgram} &#8211; Potvrdit?`;
        }
    } else {
        // Remove confirmation container if less than 2 programs selected
        if (confirmContainer) {
            confirmContainer.remove();
        }
    }
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
    const savedPrograms = localStorage.getItem('selectedPrograms');
    
    if (savedPrograms) {
        selectedPrograms = JSON.parse(savedPrograms);
        
        // Apply green styling to previously selected programs
        document.querySelectorAll('.program__button').forEach((button, index) => {
            if (selectedPrograms.includes(index)) {
                button.style.border = '2px solid var(--green-color)';
                button.style.color = 'var(--green-color)';
                button.style.backgroundColor = 'var(--light-color)';
                
                const svg = button.querySelector('svg');
                if (svg) {
                    svg.querySelector('path').style.fill = 'var(--green-color)';
                    // Update button text while keeping SVG
                    button.innerHTML = '';
                    button.appendChild(svg);
                    button.appendChild(document.createTextNode('Vybráno'));
                }
            }
        });
        
        // Show confirmation button if 2 programs are selected
        updateConfirmationButton();
    }
    
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
