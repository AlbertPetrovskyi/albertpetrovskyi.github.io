function updateCountdown() {
	const targetDate = new Date('2025-11-15T00:00:00+01:00');
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
		
		clearInterval(countdownInterval);
		return;
	}

	nameInput.disabled = true;
	classInput.disabled = true;
	checkboxInput.disabled = true;
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

// document.getElementById("regForm").addEventListener("submit", async e => {
//     e.preventDefault();
//     const res = await fetch(process.env.GOOGLE_SHEET_API, {
//         method: "POST",
//         body: JSON.stringify({
//         name: document.getElementById("name").value,
//         class: document.getElementById("class").value,
//         firstProgram: document.getElementById("firstProgram").value,
//         secondProgram: document.getElementById("secondProgram").value
//         })
//     });
//     document.getElementById('regForm').reset();
// });
