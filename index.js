function updateCountdown() {
	const targetDate = new Date('2025-07-11T00:00:00+01:00');
	const now = new Date();
	const difference = targetDate - now;

	const headerReg = document.querySelector('.header__reg');
	const nameInput = document.querySelector('.reg__name input');
	const classInput = document.querySelector('.reg__class input');
	const submitButton = document.querySelector('.reg__button');

	if (difference <= 0) {
		const newLink = document.createElement('a');
		newLink.className = 'header__reg-opened';
		newLink.href = '#reg';
		newLink.textContent = 'Přihlásit se';
		headerReg.parentNode.replaceChild(newLink, headerReg);
		
		nameInput.disabled = false;
		classInput.disabled = false;
		submitButton.disabled = false;
		
		clearInterval(countdownInterval);
		return;
	}

	nameInput.disabled = true;
	classInput.disabled = true;
	submitButton.disabled = true;

	const days = Math.floor(difference / (1000 * 60 * 60 * 24));
	const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

	const formattedDays = String(days).padStart(2, '0');
	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');

	headerReg.textContent = `Přihlášení začne za ${formattedDays}:${formattedHours}:${formattedMinutes}`;
}

const countdownInterval = setInterval(updateCountdown, 60000);
updateCountdown();

window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName');
    const savedClass = localStorage.getItem('userClass');
    
    if (savedName) {
        document.querySelector('.reg__name input').value = savedName;
    }
    if (savedClass) {
        document.querySelector('.reg__class input').value = savedClass;
    }
});

document.querySelector('.action__reg').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    
    localStorage.setItem('userName', nameInput.value);
    localStorage.setItem('userClass', classInput.value);
    
});
