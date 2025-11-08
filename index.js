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
