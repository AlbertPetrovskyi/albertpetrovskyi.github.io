const targetDate = new Date('2025-11-14T00:00:00+01:00');
const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycby61ARUx84c07j-b7YLnZMqbRPS1txMhqJds_ZFW-bU_wlwt5DKSi1ILKpbNAiX3Qk/exec';
const classes = {
	'Jak to bylo roku 1989 na Hejčíně': 'A168',
	'Vzpomínky na Sametovou revoluci v Olomouci': 'B280',
	'Hledání pravdy a svobody. Jak se jako středoškolský student dostal do Polska a mezi disidenty, československou opozici': 'B381',
	'Hledání pravdy a svobody. Rok 1989 ve fotografiích Oty Nepilého – Polsko, východní Německo, Československo, Rumunsko': 'B381',
	'Společnost a ekonomika 1948-1989': 'B190',
	'Pád komunismu v Československu a návrat k demokracii': 'B190',
	'Když padla cenzura': 'B490',
	'Osobní vzpomínky na demonstraci na Národní třídě': 'B382',
	'Vzpomínky na sametovou Prahu': 'B383',
	'Revoluce bez sítí – příběh studentů, letáků a šeptandy': 'B384',
	'„Dnes udělám to, co jiní neudělají, takže zítra dokážu to, co jiní nemůžou.“ Jerry Rice': 'B390',
	'Havel a jeho hry': 'B481',
	'Svobodný v nesvobodné zemi, aneb proč si vážit svobody': 'A367',
	'Debata s pamětníkem Martinem Šteinerem': 'A366',
	'Debata s olomouckým pamětníkem Vítem Pelikánem': 'B281',
	'Gaudeamus igitur, studium v době totality a demokracie': 'A368',
	'Debata s pamětníkem Michalem Mrtvým': 'B282',
	'Život v undergroundu a svoboda jako životní postoj': 'B283',
	'Budování demokracie a občanský sektor (ONLINE)': 'B485',
	'Účast veřejnosti v rozhodovacích procesech a neziskovky (ONLINE)': 'B485',
	'Pošli to dál! Jak se informovalo v době revoluce': 'A365',
	'Debata s pamětnicí Květou Princovou': 'A160',
	'Svědectví Dagmar Přidalové a co si z toho vzít dnes': 'B264',
	'Otevřená výtvarka': 'A130 AUVV1',
	'Revoluce v Olomouci & propojení se současností': 'A364',
	'Beseda s pamětníkem Ivanem Langerem': 'A261',
	'Beseda s pamětníky olomouckého Sametu 1989': 'A361',
	'Simulace Poslanecké sněmovny (SPOJENÉ)': 'A465',
	'Skauting mi změnil život, aneb proč režim organizaci dvakrát zakázal': 'A268',
	'Workshop: Strážci demokracie (SPOJENÉ)': 'A267',
	'Přichází zelená sametová revoluce': 'A266',
	'Sametová revoluce v Olomouci z pohledu tehdejšího studenta': 'A265',
	'Promítání snímku Prezidentka s následnou debatou': '...'
};

function getProgramBlocks(programDiv) {
    const capacityDiv = programDiv.querySelector('.program__capacity');
    const capacityText = capacityDiv?.textContent.trim() || '';
    
    if (capacityText.includes('SPOJENÉ')) {
        // SPOJENÉ programs occupy BOTH blocks with single registration
        return 'merged';
    } else if (capacityText.includes('Blok 1:') && capacityText.includes('Blok 2:')) {
        // Both blocks available - user can choose which one
        return 'both';
    } else if (capacityText.includes('Blok 1:')) {
        return 'block1';
    } else if (capacityText.includes('Blok 2:')) {
        return 'block2';
    }
    
    return null;
}

function updateCountdown() {
    const now = new Date();
    const difference = targetDate - now;

    const headerReg = document.querySelector('.header__reg');
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    const checkboxInputs = document.querySelectorAll('.reg__checkbox');
    const submitButton = document.querySelector('.reg__button');

    if (difference <= 0) {
        const newLink = document.createElement('a');
        newLink.className = 'header__reg-opened';
        newLink.href = '#reg';
        newLink.textContent = 'Přihlásit se';
        headerReg.parentNode.replaceChild(newLink, headerReg);
        
        nameInput.disabled = false;
        classInput.disabled = false;
        checkboxInputs.forEach(checkbox => checkbox.disabled = false);
        submitButton.disabled = false;
        
        updateProgramButtons();
        
        clearInterval(countdownInterval);
        return;
    }

    nameInput.disabled = true;
    classInput.disabled = true;
    checkboxInputs.forEach(checkbox => checkbox.disabled = true);
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
    const programDivs = document.querySelectorAll('.programs__program');
    
    // Determine current selection state
    let block1Selected = false;
    let block2Selected = false;
    let mergedSelected = false;
    
    selectedPrograms.forEach(selectedIndex => {
        const programType = getProgramBlocks(programDivs[selectedIndex]);
        
        if (programType === 'merged') {
            mergedSelected = true;
        } else if (programType === 'block1') {
            block1Selected = true;
        } else if (programType === 'block2') {
            block2Selected = true;
        } else if (programType === 'both') {
            // For 'both' type, we need to determine which block user selected it for
            // This will be handled during selection
        }
    });
    
    programButtons.forEach((button, index) => {
        const programDiv = button.closest('.programs__program');
        const capacityDiv = button.closest('.program__buttons').querySelector('.program__capacity');
        const capacityText = capacityDiv?.textContent.trim();
        
        let isFull = false;
        
        if (capacityText.includes('SPOJENÉ')) {
            const match = capacityText.match(/(\d+)\s*\/\s*(\d+)/);
            if (match) {
                const [_, current, max] = match;
                isFull = parseInt(current) >= parseInt(max);
            }
        } else if (capacityText.includes('Blok')) {
            const block1Match = capacityText.match(/Blok 1:\s*(\d+)\/(\d+)/);
            const block2Match = capacityText.match(/Blok 2:\s*(\d+)\/(\d+)/);
            
            let block1Full = false;
            let block2Full = false;
            
            if (block1Match) {
                block1Full = parseInt(block1Match[1]) >= parseInt(block1Match[2]);
            } else {
                block1Full = true;
            }
            
            if (block2Match) {
                block2Full = parseInt(block2Match[1]) >= parseInt(block2Match[2]);
            } else {
                block2Full = true;
            }
            
            isFull = block1Full && block2Full;
        }
        
        if (isFull) {
            capacityDiv.style.border = '2px solid var(--red-color)';
            capacityDiv.classList.add('capacity__full');
        } else {
            capacityDiv.style.border = '2px solid var(--blue-color)';
            capacityDiv.classList.remove('capacity__full');
        }
        
        const isAlreadySelected = selectedPrograms.includes(index);
        const programType = getProgramBlocks(programDiv);
        
        let shouldDisable = false;
        
        if (!isAlreadySelected) {
            // If merged program is selected, disable everything else
            if (mergedSelected) {
                shouldDisable = true;
            }
            // If this is a merged program and anything is selected, disable it
            else if (programType === 'merged' && selectedPrograms.length > 0) {
                shouldDisable = true;
            }
            // If 2 programs already selected, disable everything else
            else if (selectedPrograms.length >= 2) {
                shouldDisable = true;
            }
            // Block conflict: disable if the required block is already taken
            else if (programType === 'block1' && block1Selected) {
                shouldDisable = true;
            } else if (programType === 'block2' && block2Selected) {
                shouldDisable = true;
            }
            // For 'both' type programs, they can still be selected unless both blocks are taken
            else if (programType === 'both' && block1Selected && block2Selected) {
                shouldDisable = true;
            }
        }
        
        if (timerActive || !isRegistered || isFull || shouldDisable) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });
}

document.querySelectorAll('.program__button').forEach((button, index) => {
	button.addEventListener('click', () => {
		const programIndex = index;
		const programDiv = button.closest('.programs__program');
		const programType = getProgramBlocks(programDiv);
		const isSelected = selectedPrograms.includes(programIndex);
		
		if (isSelected) {
			// Deselect program
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
			// Try to select program
			const programDivs = document.querySelectorAll('.programs__program');
			
			// Check if merged program
			if (programType === 'merged') {
				if (selectedPrograms.length === 0) {
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
			} else if (selectedPrograms.length < 2) {
				// Check block conflicts
				let canSelect = true;
				
				selectedPrograms.forEach(selectedIndex => {
					const selectedType = getProgramBlocks(programDivs[selectedIndex]);
					
					if (selectedType === 'merged') {
						canSelect = false;
					} else if (programType === 'block1' && selectedType === 'block1') {
						canSelect = false;
					} else if (programType === 'block2' && selectedType === 'block2') {
						canSelect = false;
					} else if (programType === 'both' || selectedType === 'both') {
						// For 'both' type, need special handling
						// Will be assigned to available block
					}
				});
				
				if (canSelect) {
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
		}
		
		localStorage.setItem('selectedPrograms', JSON.stringify(selectedPrograms));
		updateProgramButtons();
		updateConfirmationButton();
	});
});

function updateConfirmationButton() {
	let confirmContainer = document.querySelector('.confirmation__container');
	
	const programDivs = document.querySelectorAll('.programs__program');
	
	// Check if we have valid selection
	let canConfirm = false;
	let firstProgram = '';
	let secondProgram = '';
	
	if (selectedPrograms.length === 1) {
		const programType = getProgramBlocks(programDivs[selectedPrograms[0]]);
		if (programType === 'merged') {
			// Merged program selected - can confirm
			canConfirm = true;
			const programText = programDivs[selectedPrograms[0]].querySelector('.program__title > span').textContent;
			firstProgram = programText;
			secondProgram = programText;
		}
	} else if (selectedPrograms.length === 2) {
		// Two programs selected - need to assign to blocks
		canConfirm = true;
		
		const firstProgramDiv = programDivs[selectedPrograms[0]];
		const secondProgramDiv = programDivs[selectedPrograms[1]];
		
		const firstProgramText = firstProgramDiv.querySelector('.program__title > span').textContent;
		const secondProgramText = secondProgramDiv.querySelector('.program__title > span').textContent;
		
		const firstType = getProgramBlocks(firstProgramDiv);
		const secondType = getProgramBlocks(secondProgramDiv);
		
		// Assign to blocks based on types
		if (firstType === 'block1' || (firstType === 'both' && secondType === 'block2')) {
			firstProgram = firstProgramText;
			secondProgram = secondProgramText;
		} else if (firstType === 'block2' || (firstType === 'both' && secondType === 'block1')) {
			firstProgram = secondProgramText;
			secondProgram = firstProgramText;
		} else {
			// Both are 'both' type - assign in order
			firstProgram = firstProgramText;
			secondProgram = secondProgramText;
		}
	}
	
	if (canConfirm) {
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
			
			if (firstProgram === secondProgram) {
				confirmButton.innerHTML = `${firstProgram} <br>Potvrdit?`;
			} else {
				confirmButton.innerHTML = `Blok 1: ${firstProgram}<br>Blok 2: ${secondProgram}<br>Potvrdit?`;
			}
			
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
                    
                    const url = `${GOOGLE_SHEET_API}?name=${encodeURIComponent(name)}&class=${encodeURIComponent(className)}&firstProgram=${encodeURIComponent(firstProgram)}&secondProgram=${encodeURIComponent(secondProgram)}`;
                    
                    const res = await fetch(url, {
                        method: "GET",
                        redirect: "follow"
                    });
                    
                    const result = await res.json();
                    
                    if (result.status === "success") {
                        localStorage.setItem('hasSubmittedPrograms', 'true');
                        localStorage.setItem('firstProgramSubmitted', firstProgram);
                        localStorage.setItem('secondProgramSubmitted', secondProgram);
                        
                        confirmButton.textContent = 'Úspěšně odesláno!';
                        confirmButton.style.backgroundColor = 'var(--green-color)';
                        
                        document.querySelectorAll('.program__button').forEach(btn => {
                            btn.disabled = true;
                        });
                        
                        displaySelectedPrograms(firstProgram, secondProgram);
                        
                        await fetchCapacityFromSheet();
                        
                        setTimeout(() => {
                            window.location.hash = '#reg';
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
                        if (firstProgram === secondProgram) {
                            confirmButton.innerHTML = `${firstProgram} (SPOJENÉ)<br>Potvrdit?`;
                        } else {
                            confirmButton.innerHTML = `Blok 1: ${firstProgram}<br>Blok 2: ${secondProgram}<br>Potvrdit?`;
                        }
                        confirmButton.style.backgroundColor = 'var(--green-color)';
                    }, 3000);
                }
            });
            
            confirmContainer.appendChild(backButton);
            confirmContainer.appendChild(confirmButton);
            document.body.appendChild(confirmContainer);
        } else {
            const confirmButton = confirmContainer.querySelector('.confirmation__button');
            if (firstProgram === secondProgram) {
                confirmButton.innerHTML = `${firstProgram} (SPOJENÉ)<br>Potvrdit?`;
            } else {
                confirmButton.innerHTML = `Blok 1: ${firstProgram}<br>Blok 2: ${secondProgram}<br>Potvrdit?`;
            }
        }
    } else {
        if (confirmContainer) {
            confirmContainer.remove();
        }
    }
}
function displaySelectedPrograms(firstProgram, secondProgram) {
	const existingDisplay = document.querySelector('.reg__programs');
	if (existingDisplay) {
		existingDisplay.remove();
	}

	const firstProgramClass = classes[firstProgram] || '...';
	const secondProgramClass = classes[secondProgram] || '...';
	
	const programsDisplay = document.createElement('div');
	programsDisplay.className = 'reg__programs';
	
	if (firstProgram === secondProgram) {
		programsDisplay.innerHTML = `Spojený program (${firstProgramClass}) &#8211; ${firstProgram}`;
	} else {
		programsDisplay.innerHTML = `První program (${firstProgramClass}) &#8211; ${firstProgram}<br>Druhý program (${secondProgramClass}) &#8211; ${secondProgram}`;
	}
	
	const regName = document.querySelector('.reg__name');
	regName.parentNode.insertBefore(programsDisplay, regName.nextSibling);
}

const countdownInterval = setInterval(updateCountdown, 60000);
updateCountdown();


document.querySelector('.action__reg').addEventListener('submit', (e) => {
	e.preventDefault();
	
	const nameInput = document.querySelector('.reg__name input');
	const classInput = document.querySelector('.reg__class input');
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
	
	nameInput.value = `${name} ${className}`;
	nameInput.disabled = true;
	
	classDiv.remove();
	
	acceptLabel.remove();
	
	submitButton.textContent = 'Děkujeme za přihlášení!';
	submitButton.disabled = true;
	
	gradientText.textContent = 'Vybírej už teď!';
	
	updateProgramButtons();
});

// Replace the fetchCapacityFromSheet function with this:
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
            
            programDivs.forEach((programDiv) => {
                const programTitle = programDiv.querySelector('.program__title > span').textContent.trim();
                const capacityDiv = programDiv.querySelector('.program__capacity');
                
                if (capacityData[programTitle]) {
                    const program = capacityData[programTitle];
                    
                    if (program.type === 'spojene') {
                        // Type 5: SPOJENÉ - merged cells
                        capacityDiv.textContent = `${program.current} / ${program.max} (SPOJENÉ)`;
                    } else if (program.type === 'separate') {
                        // Types 1-4: Separate blocks
                        let capacityText = '';
                        
                        if (program.firstBlock.available && program.secondBlock.available) {
                            // Type 1 or 2: Both blocks available
                            capacityText = `Blok 1: ${program.firstBlock.current}/${program.firstBlock.max} | Blok 2: ${program.secondBlock.current}/${program.secondBlock.max}`;
                        } else if (program.firstBlock.available && !program.secondBlock.available) {
                            // Type 4: Only first block
                            capacityText = `Blok 1: ${program.firstBlock.current}/${program.firstBlock.max}`;
                        } else if (!program.firstBlock.available && program.secondBlock.available) {
                            // Type 3: Only second block
                            capacityText = `Blok 2: ${program.secondBlock.current}/${program.secondBlock.max}`;
                        }
                        
                        capacityDiv.textContent = capacityText;
                    }
                }
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
    const isTeacher = localStorage.getItem('isTeacher') === 'true';
    
    document.querySelectorAll('.program__description').forEach(description => {
        description.style.display = 'none';
    });
    
    document.querySelectorAll('.program__title svg').forEach(arrow => {
        arrow.style.transform = 'rotate(0deg)';
    });
    
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
        const nameInput = document.querySelector('.reg__name input');
        const classDiv = document.querySelector('.reg__class');
        const acceptLabel = document.querySelector('.reg__accept');
        const teacherLabel = document.querySelector('.reg__teacher');
        const submitButton = document.querySelector('.reg__button');
        const gradientText = document.querySelector('.action__text-gradient');
        const headerLink = document.querySelector('.header__reg-opened');
        
        // Show only name in header
        if (headerLink) {
            headerLink.textContent = savedName;
        }
        
        nameInput.value = isTeacher ? `${savedName}` : `${savedName} ${savedClass}`;
        nameInput.disabled = true;
        
        if (classDiv) classDiv.remove();
        if (acceptLabel) acceptLabel.remove();
        if (teacherLabel) teacherLabel.remove();
        
        submitButton.textContent = 'Děkujeme za přihlášení!';
        submitButton.disabled = true;
        
        if (gradientText) {
            if (hasSubmitted === 'true') {
                gradientText.textContent = 'Řekni ostatním!';
            } else {
                gradientText.textContent = 'Vybírej už teď!';
            }
        }
        
        if (hasSubmitted === 'true') {
            const firstProgram = localStorage.getItem('firstProgramSubmitted');
            const secondProgram = localStorage.getItem('secondProgramSubmitted');
            if (firstProgram && secondProgram) {
                displaySelectedPrograms(firstProgram, secondProgram);
            }
        }
    }
    
    updateProgramButtons();
});

const teacherCheckbox = document.querySelector('.reg__teacher input');
const classInput = document.querySelector('.reg__class input');
const originalPattern = classInput.pattern;
const originalPlaceholder = classInput.placeholder;

teacherCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        // When teacher checkbox is checked
        classInput.value = 'Učitel/Učitelka';
        classInput.disabled = true;
        classInput.removeAttribute('pattern');
        classInput.removeAttribute('required');
    } else {
        // When teacher checkbox is unchecked
        classInput.value = '';
        classInput.disabled = false;
        classInput.pattern = originalPattern;
        classInput.placeholder = originalPlaceholder;
        classInput.setAttribute('required', '');
    }
});

// Also update the form submit handler to handle teacher case
document.querySelector('.action__reg').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.querySelector('.reg__name input');
    const classInput = document.querySelector('.reg__class input');
    const classDiv = document.querySelector('.reg__class');
    const acceptLabel = document.querySelector('.reg__accept');
    const teacherLabel = document.querySelector('.reg__teacher');
    const submitButton = document.querySelector('.reg__button');
    const gradientText = document.querySelector('.action__text-gradient');
    const headerLink = document.querySelector('.header__reg-opened');
    
    const name = nameInput.value;
    const className = classInput.value;
    const isTeacher = teacherCheckbox.checked;
    
    localStorage.setItem('userName', name);
    localStorage.setItem('userClass', className);
    localStorage.setItem('isTeacher', isTeacher);
    
    // Show only name in header
    if (headerLink) {
        headerLink.textContent = name;
    }
    
    nameInput.value = isTeacher ? `${name}` : `${name} ${className}`;
    nameInput.disabled = true;
    
    classDiv.remove();
    acceptLabel.remove();
    teacherLabel.remove();
    
    submitButton.textContent = 'Děkujeme za přihlášení!';
    submitButton.disabled = true;
    
    gradientText.textContent = 'Vybírej už teď!';
    
    updateProgramButtons();
    
    setTimeout(() => {
        window.location.hash = '#programs';
    }, 1000);
});

// Update the window load handler to restore teacher state
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('userName');
    const savedClass = localStorage.getItem('userClass');
    const savedPrograms = localStorage.getItem('selectedPrograms');
    const hasSubmitted = localStorage.getItem('hasSubmittedPrograms');
    const isTeacher = localStorage.getItem('isTeacher') === 'true';
    
    document.querySelectorAll('.program__description').forEach(description => {
        description.style.display = 'none';
    });
    
    document.querySelectorAll('.program__title svg').forEach(arrow => {
        arrow.style.transform = 'rotate(0deg)';
    });
    
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
        const nameInput = document.querySelector('.reg__name input');
        const classDiv = document.querySelector('.reg__class');
        const acceptLabel = document.querySelector('.reg__accept');
        const teacherLabel = document.querySelector('.reg__teacher');
        const submitButton = document.querySelector('.reg__button');
        const gradientText = document.querySelector('.action__text-gradient');
        const headerLink = document.querySelector('.header__reg-opened');
        
        // Show only name in header
        if (headerLink) {
            headerLink.textContent = savedName;
        }
        
        nameInput.value = isTeacher ? `${savedName}` : `${savedName} ${savedClass}`;
        nameInput.disabled = true;
        
        if (classDiv) classDiv.remove();
        if (acceptLabel) acceptLabel.remove();
        if (teacherLabel) teacherLabel.remove();
        
        submitButton.textContent = 'Děkujeme za přihlášení!';
        submitButton.disabled = true;
        
        if (gradientText) {
            if (hasSubmitted === 'true') {
                gradientText.textContent = 'Řekni ostatním!';
            } else {
                gradientText.textContent = 'Vybírej už teď!';
            }
        }
        
        if (hasSubmitted === 'true') {
            const firstProgram = localStorage.getItem('firstProgramSubmitted');
            const secondProgram = localStorage.getItem('secondProgramSubmitted');
            if (firstProgram && secondProgram) {
                displaySelectedPrograms(firstProgram, secondProgram);
            }
        }
    }
    
    updateProgramButtons();
});

setInterval(fetchCapacityFromSheet, 10000);

document.querySelectorAll('.program__title').forEach(title => {
	title.addEventListener('click', () => {
		const programDiv = title.closest('.programs__program');
		const description = programDiv.querySelector('.program__description');
		const arrow = title.querySelector('svg');
		
		if (description.style.display === 'none') {
				description.style.display = 'block';
				arrow.style.transform = 'rotate(180deg)';
		} else {
				description.style.display = 'none';
				arrow.style.transform = 'rotate(0deg)';
		}
	});
});
