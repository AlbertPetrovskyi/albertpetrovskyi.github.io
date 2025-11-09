function updateCountdown() {
	const targetDate = new Date('2025-11-11T00:00:00+01:00'); // YY/DD/HH
	const now = new Date();
	const difference = targetDate - now;

	const headerReg = document.querySelector('.header__reg');

	if (difference <= 0) {
		const newLink = document.createElement('a');
		newLink.className = 'header__reg-opened';
		newLink.href = '#reg';
		newLink.textContent = 'Přihlásit se';
		headerReg.parentNode.replaceChild(newLink, headerReg);
		clearInterval(countdownInterval);
		return;
	}

	const days = Math.floor(difference / (1000 * 60 * 60 * 24));
	const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

	const formattedDays = String(days).padStart(2, '0');
	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');

	headerReg.textContent = `Přihlášení začne za ${formattedDays}:${formattedHours}:${formattedMinutes}`;
}

updateCountdown();
setInterval(updateCountdown, 60000);


document.getElementById("regForm").addEventListener("submit", async e => {
	e.preventDefault();
	const res = await fetch("https://script.google.com/macros/s/AKfycbyqtfJJaQlCVGyoEoOXMRHu1T7D4yfzM7clYPUWKi5G_iLTUKmq77tXUW4AM3U0fspe/exec", {
		method: "POST",
		body: JSON.stringify({
		name: document.getElementById("name").value,
		class: document.getElementById("class").value,
		firstProgram: document.getElementById("firstProgram").value,
		secondProgram: document.getElementById("secondProgram").value
		})
	});
	document.getElementById('regForm').reset();
});
