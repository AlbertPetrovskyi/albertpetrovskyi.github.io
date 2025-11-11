const targetDate = new Date('2025-11-15T00:00:00+01:00');
const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbxUlTEanoHNBFz9i-GLNh7RFnSLgVqfQnS-ZLReROUeCgtGYdQZAi4bEpE1ffpcsic/exec';

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

let selectedPrograms = [];

function updateProgramButtons() {
	const now = new Date();
	const timerActive = targetDate - now > 0;
	const isRegistered = localStorage.getItem('userName') && localStorage.getItem('userClass');
	
	const programButtons = document.querySelectorAll('.program__button');
	
	programButtons.forEach(button => {
		const capacityDiv = button.closest('.program__buttons').querySelector('.program__capacity');
		const capacityText = capacityDiv?.textContent.trim();
		
		const [current, total] = capacityText.split('/').map(num => parseInt(num.trim()));
		const isFull = current >= total;
		
		if (isFull) {
				capacityDiv.style.border = '2px solid var(--red-color)';
				capacityDiv.classList.add('capacity__full');
		} else {
				capacityDiv.style.border = '2px solid var(--blue-color)';
				capacityDiv.classList.remove('capacity__full');
		}
		
		if (timerActive || !isRegistered || isFull) {
				button.disabled = true;
		} else {
				button.disabled = false;
		}
	});
}

document.querySelectorAll('.program__button').forEach((button, index) => {
	button.addEventListener('click', () => {
		const programIndex = index;
		const isSelected = selectedPrograms.includes(programIndex);
		
		if (isSelected) {
				selectedPrograms = selectedPrograms.filter(i => i !== programIndex);
				button.style.border = '2px solid var(--dark-color)';
				button.style.color = 'var(--dark-color)';
				button.style.backgroundColor = 'var(--light-color)';
				
				const svg = button.querySelector('svg');
				if (svg) {
					svg.querySelector('path').style.fill = 'var(--dark-color)';
					button.innerHTML = '';
					button.appendChild(svg);
					button.appendChild(document.createTextNode('Vybrat'));
				}
		} else {
				if (selectedPrograms.length < 2) {
					selectedPrograms.push(programIndex);
					button.style.border = '2px solid var(--green-color)';
					button.style.color = 'var(--green-color)';
					button.style.backgroundColor = 'var(--light-color)';
					
					const svg = button.querySelector('svg');
					if (svg) {
						svg.querySelector('path').style.fill = 'var(--green-color)';
						button.innerHTML = '';
						button.appendChild(svg);
						button.appendChild(document.createTextNode('Vybráno'));
					}
				}
		}
		
		localStorage.setItem('selectedPrograms', JSON.stringify(selectedPrograms));
		
		updateConfirmationButton();
	});
});

function updateConfirmationButton() {
	let confirmContainer = document.querySelector('.confirmation__container');
	
	if (selectedPrograms.length === 2) {
		const programDivs = document.querySelectorAll('.programs__program');
		const firstProgram = programDivs[selectedPrograms[0]].querySelector('.program__title').textContent;
		const secondProgram = programDivs[selectedPrograms[1]].querySelector('.program__title').textContent;
		
		if (!confirmContainer) {
				confirmContainer = document.createElement('div');
				confirmContainer.className = 'confirmation__container';
				
				const backButton = document.createElement('button');
				backButton.className = 'confirmation__back';
				backButton.textContent = 'Zpět';
				backButton.type = 'button';
				backButton.addEventListener('click', () => {
					confirmContainer.remove();
				});
				
				const confirmButton = document.createElement('button');
				confirmButton.className = 'confirmation__button';
				confirmButton.type = 'button';
				confirmButton.innerHTML = `${firstProgram}, ${secondProgram} &#8211; Potvrdit?`;
				confirmButton.addEventListener('click', async () => {
					try {
						const hasSubmitted = localStorage.getItem('hasSubmittedPrograms');
						if (hasSubmitted === 'true') {
								confirmButton.textContent = 'Již odesláno!';
								confirmButton.style.backgroundColor = 'var(--neutral-color)';
								confirmButton.disabled = true;
								return;
						}
						
						const name = localStorage.getItem('userName');
						const className = localStorage.getItem('userClass');
						
						confirmButton.disabled = true;
						confirmButton.textContent = 'Odesílání...';
						
						const formData = new URLSearchParams();
						formData.append('name', name);
						formData.append('class', className);
						formData.append('firstProgram', firstProgram);
						formData.append('secondProgram', secondProgram);
						
						const url = `${GOOGLE_SHEET_API}?name=${encodeURIComponent(name)}&class=${encodeURIComponent(className)}&firstProgram=${encodeURIComponent(firstProgram)}&secondProgram=${encodeURIComponent(secondProgram)}`;
						
						const res = await fetch(url, {
								method: "GET",
								redirect: "follow"
						});
						
						const result = await res.json();
						
						if (result.status === "success") {
								localStorage.setItem('hasSubmittedPrograms', 'true');
								
								confirmButton.textContent = 'Úspěšně odesláno!';
								confirmButton.style.backgroundColor = 'var(--green-color)';
								
								document.querySelectorAll('.program__button').forEach(btn => {
									btn.disabled = true;
								});
								
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
				const confirmButton = confirmContainer.querySelector('.confirmation__button');
				confirmButton.innerHTML = `${firstProgram}, ${secondProgram} &#8211; Potvrdit?`;
		}
	} else {
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
	
	const name = nameInput.value;
	const className = classInput.value;
	
	localStorage.setItem('userName', name);
	localStorage.setItem('userClass', className);
	
	if (headerLink) {
		headerLink.textContent = `${name} ${className}`;
	}
	
	nameDiv.remove();
	
	classDiv.remove();
	
	acceptLabel.remove();
	
	submitButton.textContent = 'Děkujeme za přihlášení!';
	submitButton.disabled = true;
	
	gradientText.textContent = 'Vybírej už teď!';
	
	updateProgramButtons();
});

async function fetchCapacityFromSheet() {
	try {
		const res = await fetch(`${GOOGLE_SHEET_API}?action=getCapacity`, {
				method: "GET",
				redirect: "follow"
		});
		
		const result = await res.json();
		
		if (result.status === "success") {
				const capacityData = result.data;
				
				const programDivs = document.querySelectorAll('.programs__program');
				
				programDivs.forEach((programDiv, index) => {
					const programTitle = programDiv.querySelector('.program__title').textContent;
					const capacityDiv = programDiv.querySelector('.program__capacity');
					
					let currentCapacity = 0;
					const maxCapacity = 30;
					
					if (programTitle === 'Politologie') {
						currentCapacity = capacityData.politologie;
					} else if (programTitle === 'Ekonomie') {
						currentCapacity = capacityData.ekonomie;
					} else if (programTitle === 'Programování') {
						currentCapacity = capacityData.programovani;
					}
					
					capacityDiv.textContent = `${currentCapacity} / ${maxCapacity}`;
				});
				
				updateProgramButtons();
		}
	} catch (error) {
		console.error('Error fetching capacity:', error);
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const savedName = localStorage.getItem('userName');
	const savedClass = localStorage.getItem('userClass');
	const savedPrograms = localStorage.getItem('selectedPrograms');
	const hasSubmitted = localStorage.getItem('hasSubmittedPrograms');
	
	fetchCapacityFromSheet();
	
	if (savedPrograms) {
		selectedPrograms = JSON.parse(savedPrograms);
		
		document.querySelectorAll('.program__button').forEach((button, index) => {
				if (selectedPrograms.includes(index)) {
					button.style.border = '2px solid var(--green-color)';
					button.style.color = 'var(--green-color)';
					button.style.backgroundColor = 'var(--light-color)';
					
					const svg = button.querySelector('svg');
					if (svg) {
						svg.querySelector('path').style.fill = 'var(--green-color)';
						button.innerHTML = '';
						button.appendChild(svg);
						button.appendChild(document.createTextNode('Vybráno'));
					}
				}
				
				if (hasSubmitted === 'true') {
					button.disabled = true;
				}
		});
		
		if (hasSubmitted !== 'true') {
				updateConfirmationButton();
		}
	}
	
	if (savedName && savedClass) {
		const nameDiv = document.querySelector('.reg__name');
		const classDiv = document.querySelector('.reg__class');
		const acceptLabel = document.querySelector('.reg__accept');
		const submitButton = document.querySelector('.reg__button');
		const gradientText = document.querySelector('.action__text-gradient');
		const headerLink = document.querySelector('.header__reg-opened');
		
		if (headerLink) {
				headerLink.textContent = `${savedName} ${savedClass}`;
		}
		
		if (nameDiv) nameDiv.remove();
		
		if (classDiv) classDiv.remove();
		
		if (acceptLabel) acceptLabel.remove();
		
		submitButton.textContent = 'Děkujeme za přihlášení!';
		submitButton.disabled = true;
		
		if (gradientText) {
				if (hasSubmitted === 'true') {
					gradientText.textContent = 'Programy již byly odeslány!';
				} else {
					gradientText.textContent = 'Vybírej už teď!';
				}
		}
	}
	
	updateProgramButtons();
});

setInterval(fetchCapacityFromSheet, 10000);
