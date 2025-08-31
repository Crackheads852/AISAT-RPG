// game.js - Main game logic

// Game module to avoid polluting global namespace
const AISATGame = (() => {
    // --- Game state ---
    let stats = {
        fitness: 0,
        academics: 0,
        social: 0,
        mentalHealth: 0,
        finances: 0
    };
    
    let day = 1;
    let hour = 8;
    let minute = 0;
    let skippedDays = 0;
    let playerName = "Player";
    let playerGender = "other";
    let playerMajor = "engineering";
    let difficulty = "medium";
    let auraPoints = 100;
    let energyBoostActive = false;
    let studyBonusActive = false;
    let socialBoostActive = false;
    let mentalRefreshActive = false;
    let energyBoostTimeLeft = 0;
    let studyBonusTimeLeft = 0;
    let socialBoostTimeLeft = 0;
    
    // --- DOM elements cache ---
    const elements = {};
    
    // --- Audio elements ---
    const audioElements = {};
    
    // --- Initialize the game ---
    function init() {
        cacheDOMElements();
        setupEventListeners();
        initializeAudio();
        loadSettings();
        updateStats();
        updateClock();
        updateRadarChartColors();
        showSaveLoadButtons();
        updateAuraDisplay();
         setupExitFunctionality(); 
    }
    
    // --- Cache DOM elements for better performance ---
    function cacheDOMElements() {
        elements.mainMenu = document.getElementById('main-menu');
        elements.settingsMenu = document.getElementById('settings-menu');
        elements.customizationForm = document.getElementById('customization-form');
        elements.characterSection = document.getElementById('character-customization');
        elements.gameUI = document.getElementById('game-ui');
        elements.clock = document.getElementById('clock');
        elements.dayLabel = document.getElementById('day-label');
        elements.endResult = document.getElementById('end-result');
        elements.slotResult = document.getElementById('slot-result');
        elements.restartBtn = document.getElementById('restart-game');
        elements.exitBtn = document.getElementById('exit-game');
        elements.shareBtn = document.getElementById('share-result');
        elements.friendPopup = document.getElementById('friend-popup');
        elements.friendPopupContent = document.getElementById('friend-popup-content');
        elements.dayPopup = document.getElementById('day-popup');
        elements.dayPopupText = document.getElementById('day-popup-text');
        elements.modeToggle = document.getElementById('mode-toggle');
        elements.playerNameInput = document.getElementById('player-name');
        elements.playerGenderSelect = document.getElementById('player-gender');
        elements.playerMajorSelect = document.getElementById('player-major');
        elements.volumeSlider = document.getElementById('volume');
        elements.volumeValue = document.getElementById('volume-value');
        elements.difficultySelect = document.getElementById('difficulty');
        elements.notificationsCheckbox = document.getElementById('notifications');
        elements.saveGameBtn = document.getElementById('save-game');
        elements.loadGameBtn = document.getElementById('load-game');
        elements.saveLoadSection = document.getElementById('save-load');
        elements.displayPlayerName = document.getElementById('display-player-name');
        elements.finalPlayerName = document.getElementById('final-player-name');
        elements.auraPoints = document.getElementById('aura-points');
        
        // Cache all buttons
        elements.buttons = document.querySelectorAll('button');
        
        // Cache audio elements
        audioElements.win = document.getElementById('win-audio');
        audioElements.click = document.getElementById('click-audio');
        audioElements.task = document.getElementById('task-audio');
        audioElements.day = document.getElementById('day-audio');
        audioElements.popup = document.getElementById('popup-audio');
    }
    
    // --- Initialize audio with error handling ---
    function initializeAudio() {
        // Preload and handle audio errors gracefully
        for (const key in audioElements) {
            if (audioElements[key]) {
                audioElements[key].addEventListener('error', (e) => {
                    console.warn(`Audio file failed to load: ${key}`, e);
                });
                
                // Set volume based on saved settings
                audioElements[key].volume = elements.volumeSlider.value / 100;
                
                // Attempt to preload
                try {
                    audioElements[key].load();
                } catch (e) {
                    console.warn(`Could not preload audio: ${key}`, e);
                }
            }
        }
    }
    
    // --- Set up event listeners ---
    function setupEventListeners() {
        // Menu navigation
        document.getElementById('menu-start').addEventListener('click', showCharacterCustomization);
        document.getElementById('menu-settings').addEventListener('click', showSettings);
        document.getElementById('settings-back').addEventListener('click', showMainMenu);
        document.getElementById('menu-exit').addEventListener('click', exitGame);
        elements.restartBtn.addEventListener('click', restartGame);
        elements.exitBtn.addEventListener('click', exitGame);
        elements.shareBtn.addEventListener('click', shareResult);
        
        // Character creation
        elements.customizationForm.addEventListener('submit', startGame);
        
        // Mode toggle
        elements.modeToggle.addEventListener('click', toggleDarkMode);
        
        // Settings
        elements.volumeSlider.addEventListener('input', updateVolume);
        elements.difficultySelect.addEventListener('change', updateDifficulty);
        elements.notificationsCheckbox.addEventListener('change', updateNotifications);
        
        // Save/Load
        elements.saveGameBtn.addEventListener('click', saveGame);
        elements.loadGameBtn.addEventListener('click', loadGame);
        
        // Play click sound on all buttons
        elements.buttons.forEach(btn => {
            btn.addEventListener('click', () => playSound(audioElements.click));
        });
        
        // Tasks
        document.getElementById('task-gym').addEventListener('click', doGym);
        document.getElementById('task-study').addEventListener('click', doStudy);
        document.getElementById('task-socialize').addEventListener('click', doSocialize);
        
        // Events
        document.getElementById('event-sports').addEventListener('click', attendSportsEvent);
        document.getElementById('event-exam').addEventListener('click', takeExam);
        document.getElementById('event-party').addEventListener('click', attendParty);
        
        // Wellness Activities
        document.getElementById('activity-meditate').addEventListener('click', doMeditate);
        document.getElementById('activity-sleep').addEventListener('click', doExtraSleep);
        document.getElementById('activity-therapy').addEventListener('click', doTherapy);
        
        // Job Activities
        document.getElementById('job-work').addEventListener('click', doWorkShift);
        document.getElementById('job-freelance').addEventListener('click', doFreelanceWork);
        
        // Rewards
        document.getElementById('reward-skip-day').addEventListener('click', purchaseSkipDay);
        document.getElementById('reward-energy-boost').addEventListener('click', purchaseEnergyBoost);
        document.getElementById('reward-study-bonus').addEventListener('click', purchaseStudyBonus);
        document.getElementById('reward-social-boost').addEventListener('click', purchaseSocialBoost);
        document.getElementById('reward-mental-refresh').addEventListener('click', purchaseMentalRefresh);
    }
    
    // --- Menu navigation functions ---
    function showCharacterCustomization() {
        elements.mainMenu.style.display = 'none';
        elements.characterSection.style.display = 'flex';
    }
    
    function showSettings() {
        elements.mainMenu.style.display = 'none';
        elements.settingsMenu.style.display = 'flex';
    }
    
    function showMainMenu() {
        elements.settingsMenu.style.display = 'none';
        elements.characterSection.style.display = 'none';
        elements.mainMenu.style.display = 'flex';
    }
    
    function exitGame() {
        if (confirm("Are you sure you want to exit the game?")) {
            // In a real game, you might want to save progress first
            alert("Thanks for playing AISAT Student RPG!");
        }
    }
    
    function startGame(e) {
        e.preventDefault();
        playerName = elements.playerNameInput.value || "Player";
        playerGender = elements.playerGenderSelect.value;
        playerMajor = elements.playerMajorSelect.value;
        
        elements.displayPlayerName.textContent = playerName;
        elements.finalPlayerName.textContent = playerName;
        
        elements.characterSection.style.display = 'none';
        elements.gameUI.style.display = 'flex';
        updateStats();
        updateClock();
    }
    
    function restartGame() {
        elements.endResult.style.display = 'none';
        elements.mainMenu.style.display = 'flex';
        resetGame();
    }
    
    function shareResult() {
        const finalCategory = document.getElementById('slot-result').textContent;
        const shareText = `I just completed AISAT Student RPG and became a ${finalCategory}! My stats: Fitness: ${stats.fitness.toFixed(1)}, Academics: ${stats.academics.toFixed(1)}, Social: ${stats.social.toFixed(1)}, Mental Health: ${stats.mentalHealth.toFixed(1)}, Finances: ${stats.finances.toFixed(1)}. Try it yourself!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'AISAT Student RPG',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Result copied to clipboard!');
    }
    
    // --- Game mechanics functions ---
    function doGym() {
        let amount = getDifficultyMultiplier() * 0.8;
        
        // Apply energy boost if active
        if (energyBoostActive) {
            amount *= 1.5;
        }
        
        stats.fitness += amount; 
        stats.mentalHealth += amount * 0.5; 
        advanceTime(60); 
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You worked out at the gym! Fitness +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(2);
    }

    function doStudy() {
        let amount = getDifficultyMultiplier() * 0.7;
        
        // Apply study bonus if active
        if (studyBonusActive) {
            amount *= 2;
        }
        
        stats.academics += amount; 
        stats.mentalHealth -= amount * 0.3; 
        advanceTime(90); 
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You studied hard! Academics +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(3);
    }

    function doSocialize() {
        let amount = getDifficultyMultiplier() * 0.6;
        
        // Apply social boost if active
        if (socialBoostActive) {
            amount *= 1.5;
        }
        
        stats.social += amount; 
        stats.mentalHealth += amount * 0.4; 
        advanceTime(45); 
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You socialized with friends! Social +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(2);
    }

    function attendSportsEvent() {
        if (stats.fitness < 3) {
            alert("Your fitness is too low to compete!");
            return;
        }
        
        let amount = getDifficultyMultiplier();
        
        // Apply energy boost if active
        if (energyBoostActive) {
            amount *= 1.5;
        }
        
        stats.fitness += amount * 1.5; 
        stats.social += amount * 0.5; 
        advanceTime(120); 
        updateStats(); 
        playSound(audioElements.win); 
        updateFriendComments("sports");
        showNotification("You competed in a sports event! Fitness +" + (amount * 1.5).toFixed(1));
        
        // Reward aura points
        addAuraPoints(5);
    }

    function takeExam() {
        if (stats.academics < 3) {
            alert("You need to study more before the exam!");
            return;
        }
        
        let amount = getDifficultyMultiplier();
        
        // Apply study bonus if active
        if (studyBonusActive) {
            amount *= 2;
        }
        
        stats.academics += amount * 2; 
        stats.mentalHealth -= amount * 0.5; 
        advanceTime(120); 
        updateStats(); 
        playSound(audioElements.win); 
        updateFriendComments("exam");
        showNotification("You took an exam! Academics +" + (amount * 2).toFixed(1));
        
        // Reward aura points
        addAuraPoints(6);
    }

    function attendParty() {
        if (stats.social < 2) {
            alert("Your social skills are too low to enjoy the party!");
            return;
        }
        
        let amount = getDifficultyMultiplier();
        
        // Apply social boost if active
        if (socialBoostActive) {
            amount *= 1.5;
        }
        
        stats.social += amount * 1.2; 
        stats.mentalHealth += amount * 0.8; 
        stats.fitness -= amount * 0.3; 
        advanceTime(180); 
        updateStats(); 
        playSound(audioElements.win); 
        updateFriendComments("party");
        showNotification("You attended a party! Social +" + (amount * 1.2).toFixed(1));
        
        // Reward aura points
        addAuraPoints(4);
    }

    function doMeditate() {
        let amount = getDifficultyMultiplier() * 0.5;
        
        stats.mentalHealth += amount; 
        advanceTime(30); 
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You meditated! Mental Health +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(1);
    }

    function doExtraSleep() {
        let amount = getDifficultyMultiplier() * 0.7;
        
        stats.mentalHealth += amount; 
        stats.fitness += amount * 0.3; 
        advanceTime(480);
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You got extra sleep! Mental Health +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(2);
    }

    function doTherapy() {
        let amount = getDifficultyMultiplier() * 1.0;
        
        stats.mentalHealth += amount; 
        stats.finances -= 2;
        advanceTime(60); 
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You attended a therapy session! Mental Health +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(3);
    }

    function doWorkShift() {
        let amount = getDifficultyMultiplier() * 0.8;
        
        stats.finances += amount; 
        stats.mentalHealth -= amount * 0.2; 
        advanceTime(240);
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You worked a shift! Finances +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(4);
    }

    function doFreelanceWork() {
        let amount = getDifficultyMultiplier() * 1.2;
        
        stats.finances += amount; 
        stats.academics += amount * 0.3;
        stats.mentalHealth -= amount * 0.4; 
        advanceTime(180);
        updateStats(); 
        playSound(audioElements.task);
        showNotification("You did freelance work! Finances +" + amount.toFixed(1));
        
        // Reward aura points
        addAuraPoints(5);
    }
    
    // --- Time management functions ---
    function advanceTime(mins) {
        minute += mins;
        while (minute >= 60) {
            minute -= 60;
            hour += 1;
        }
        if (hour >= 22) nextDay();
        updateClock();
    }
    
    function nextDay() {
        day++;
        hour = 8;
        minute = 0;
        updateClock();
        
        // Update boost timers
        updateBoostTimers();
        
        showDayPopup(day);
        if (day > 7) endGame();
    }
    
    function updateBoostTimers() {
        if (energyBoostActive) {
            energyBoostTimeLeft--;
            if (energyBoostTimeLeft <= 0) {
                energyBoostActive = false;
                showNotification("Energy Boost has worn off!");
            }
        }
        
        if (studyBonusActive) {
            studyBonusTimeLeft--;
            if (studyBonusTimeLeft <= 0) {
                studyBonusActive = false;
                showNotification("Study Bonus has worn off!");
            }
        }
        
        if (socialBoostActive) {
            socialBoostTimeLeft--;
            if (socialBoostTimeLeft <= 0) {
                socialBoostActive = false;
                showNotification("Social Boost has worn off!");
            }
        }
    }
    
    function updateClock() {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        elements.clock.textContent = `${h}:${m}`;
        elements.dayLabel.textContent = `DAY ${day}`;
    }
    
    // --- Stats and UI update functions ---
    function updateStats() {
        // Ensure stats don't go below 0 or above 20
        for (const stat in stats) {
            if (stats[stat] < 0) stats[stat] = 0;
            if (stats[stat] > 20) stats[stat] = 20;
        }
        
        // Update radar chart
        updateRadarChart();
    }
    
    function resetGame() {
        stats = { fitness: 0, academics: 0, social: 0, mentalHealth: 0, finances: 0 };
        day = 1; 
        hour = 8; 
        minute = 0; 
        skippedDays = 0;
        auraPoints = 100;
        energyBoostActive = false;
        studyBonusActive = false;
        socialBoostActive = false;
        mentalRefreshActive = false;
        energyBoostTimeLeft = 0;
        studyBonusTimeLeft = 0;
        socialBoostTimeLeft = 0;
        
        updateStats();
        updateClock();
        updateRadarChartColors();
        updateAuraDisplay();
    }
    
    // --- Radar chart functions ---
    function updateRadarChart() {
        if (window.radarChart) {
            window.radarChart.data.datasets[0].data = [
                stats.fitness,
                stats.academics,
                stats.social,
                stats.mentalHealth,
                stats.finances
            ];
            window.radarChart.update();
        }
    }
    
    function updateRadarChartColors() {
        if (!window.radarChart) return;
        
        if (document.body.classList.contains('dark-mode')) {
            window.radarChart.options.scales.r.angleLines.color = '#FFD700';
            window.radarChart.options.scales.r.grid.color = '#232946';
            window.radarChart.data.datasets[0].backgroundColor = 'rgba(255, 215, 0, 0.22)';
            window.radarChart.data.datasets[0].borderColor = '#FFD700';
            window.radarChart.data.datasets[0].pointBackgroundColor = '#FFD700';
            window.radarChart.options.scales.r.pointLabels.color = '#FFD700';
        } else {
            window.radarChart.options.scales.r.angleLines.color = '#00796b';
            window.radarChart.options.scales.r.grid.color = '#00bcd4';
            window.radarChart.data.datasets[0].backgroundColor = 'rgba(0, 188, 212, 0.28)';
            window.radarChart.data.datasets[0].borderColor = '#00796b';
            window.radarChart.data.datasets[0].pointBackgroundColor = '#00796b';
            window.radarChart.options.scales.r.pointLabels.color = '#00796b';
        }
        window.radarChart.update();
    }
    
    // --- Day popup functions ---
    let dayPopupTimeout = null;
    let dayPopupHideTimeout = null;
    
    function showDayPopup(dayNum) {
        // Clear any pending timeouts
        if (dayPopupTimeout) {
            clearTimeout(dayPopupTimeout);
            dayPopupTimeout = null;
        }
        if (dayPopupHideTimeout) {
            clearTimeout(dayPopupHideTimeout);
            dayPopupHideTimeout = null;
        }
    
        // Set styling based on mode
        if (document.body.classList.contains('dark-mode')) {
            elements.dayPopup.style.background = '#000000';
            elements.dayPopup.style.color = '#FFFFFF';
        } else {
            elements.dayPopup.style.background = '#FFFFFF';
            elements.dayPopup.style.color = '#000000';
        }
    
        // Show popup
        elements.dayPopup.classList.add('visible');
        elements.dayPopupText.textContent = '';
        elements.dayPopupText.style.fontSize = '12vw';
        elements.dayPopupText.style.letterSpacing = '0.15em';
        elements.dayPopupText.style.fontWeight = '900';
    
        // Play sound
        playSound(audioElements.day);
    
        // Typewriter effect
        const text = `DAY ${dayNum}`;
        let i = 0;
        
        function typeWriter() {
            elements.dayPopupText.textContent = text.slice(0, i);
            i++;
            if (i <= text.length) {
                dayPopupTimeout = setTimeout(typeWriter, 100);
            }
        }
        
        dayPopupTimeout = setTimeout(typeWriter, 80);
    
        // Click to skip
        function hideNow() {
            elements.dayPopup.classList.remove('visible');
            if (dayPopupTimeout) {
                clearTimeout(dayPopupTimeout);
                dayPopupTimeout = null;
            }
            if (dayPopupHideTimeout) {
                clearTimeout(dayPopupHideTimeout);
                dayPopupHideTimeout = null;
            }
            elements.dayPopup.removeEventListener('click', hideNow);
        }
        
        elements.dayPopup.addEventListener('click', hideNow);
    
        // Auto-hide after delay
        const estimatedTypingMs = (text.length + 1) * 100 + 80;
        const holdMs = 2200;
        dayPopupHideTimeout = setTimeout(() => {
            elements.dayPopup.classList.remove('visible');
            elements.dayPopup.removeEventListener('click', hideNow);
        }, estimatedTypingMs + holdMs);
    }
    
    // --- Friend popup functions ---
    function showFriendPopup(messages) {
        const friendNames = ["Leenex", "Remy", "Freya", "Dilna", "Sanmai"];
        elements.friendPopupContent.innerHTML = messages.map((msg, i) => 
            `<b>${friendNames[i % 5]}:</b> ${msg}`
        ).join('<br><br>');
        
        elements.friendPopup.style.display = 'block';
        playSound(audioElements.popup);
        
        setTimeout(() => {
            elements.friendPopup.style.display = 'none';
        }, 3000);
    }
    
    function updateFriendComments(eventType) {
        const comments = {
            sports: ["Great game!", "You were amazing out there!", "What a performance!", "You're a natural athlete!", "Teamwork makes the dream work!"],
            exam: ["You aced it!", "All that studying paid off!", "Top of the class!", "Brainy over here!", "Professor's favorite!"],
            party: ["That was fun!", "You're the life of the party!", "Great dance moves!", "Everyone loves you!", "Social butterfly!"]
        };
        
        showFriendPopup(comments[eventType] || ["Nice!", "Well done!", "Good job!"]);
    }
    
    // --- Notification system ---
    function showNotification(message) {
        if (!elements.notificationsCheckbox.checked) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #00796b;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = 1;
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // --- End game functions ---
    function endGame() {
        elements.gameUI.style.display = 'none';
        elements.endResult.style.display = 'flex';
    
        // Draw final radar chart
        drawFinalRadarChart();
    
        // Determine and display final category with slot machine animation
        const finalCategory = determineFinalCategory();
        animateSlotMachine(finalCategory);
    }
    
    function drawFinalRadarChart() {
        try {
            const finalCtx = document.getElementById('finalRadar').getContext('2d');
            
            // Destroy existing chart if any
            if (window.finalRadarChart) {
                window.finalRadarChart.destroy();
                window.finalRadarChart = null;
            }
    
            window.finalRadarChart = new Chart(finalCtx, {
                type: 'radar',
                data: {
                    labels: [
                        'Fitness 💪',
                        'Academics 📚',
                        'Social 👥',
                        'Mental Health 🧠',
                        'Finances 💰'
                    ],
                    datasets: [{
                        label: 'Final Stats',
                        data: [
                            stats.fitness,
                            stats.academics,
                            stats.social,
                            stats.mentalHealth,
                            stats.finances
                        ],
                        backgroundColor: 'rgba(255, 193, 7, 0.18)',
                        borderColor: '#ff9800',
                        borderWidth: 2,
                        pointBackgroundColor: '#ff9800',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: false,
                    elements: { line: { tension: 0 } },
                    scales: {
                        r: {
                            min: 0,
                            max: 20,
                            ticks: { display: false },
                            grid: { circular: false, color: '#ffd600' },
                            pointLabels: { 
                                color: '#ff9800', 
                                font: { size: 14, weight: '700' } 
                            }
                        }
                    }
                }
            });
        } catch(e) {
            console.warn('Final radar chart rendering issue:', e);
        }
    }
    
    function determineFinalCategory() {
        const categories = [
            "Athlete", 
            "Scholar", 
            "Socialite", 
            "Wellness Guru", 
            "Entrepreneur",
            "Balanced Student",
            "Dropout"
        ];
        
        // Check for dropout condition
        if (stats.mentalHealth < 3 || stats.academics < 3) {
            return "Dropout";
        }
        
        // Check for balanced student
        if (stats.fitness > 10 && stats.academics > 10 && stats.social > 10 && 
            stats.mentalHealth > 10 && stats.finances > 10) {
            return "Balanced Student";
        }
        
        // Check for specialist categories
        if (stats.fitness >= stats.academics && stats.fitness >= stats.social && 
            stats.fitness >= stats.mentalHealth && stats.fitness >= stats.finances) {
            return "Athlete";
        }
        
        if (stats.academics >= stats.fitness && stats.academics >= stats.social && 
            stats.academics >= stats.mentalHealth && stats.academics >= stats.finances) {
            return "Scholar";
        }
        
        if (stats.social >= stats.fitness && stats.social >= stats.academics && 
            stats.social >= stats.mentalHealth && stats.social >= stats.finances) {
            return "Socialite";
        }
        
        if (stats.mentalHealth >= stats.fitness && stats.mentalHealth >= stats.academics && 
            stats.mentalHealth >= stats.social && stats.mentalHealth >= stats.finances) {
            return "Wellness Guru";
        }
        
        if (stats.finances >= stats.fitness && stats.finances >= stats.academics && 
            stats.finances >= stats.social && stats.finances >= stats.mentalHealth) {
            return "Entrepreneur";
        }
        
        return "Graduate";
    }
    
    function animateSlotMachine(finalCategory) {
        const categories = [
            "Athlete", 
            "Scholar", 
            "Socialite", 
            "Wellness Guru", 
            "Entrepreneur",
            "Balanced Student",
            "Dropout",
            "Graduate"
        ];
        
        let spins = 18;
        let i = 0;
        
        const interval = setInterval(() => {
            elements.slotResult.textContent = categories[Math.floor(Math.random() * categories.length)];
            i++;
            
            if (i >= spins) {
                clearInterval(interval);
                elements.slotResult.textContent = finalCategory;
                
                // Play win sound for good endings
                if (finalCategory !== "Dropout") {
                    playSound(audioElements.win);
                }
            }
        }, 120);
    }
    
    // --- Settings functions ---
    function updateVolume() {
        const volume = elements.volumeSlider.value;
        elements.volumeValue.textContent = `${volume}%`;
        
        // Update all audio elements
        for (const key in audioElements) {
            if (audioElements[key]) {
                audioElements[key].volume = volume / 100;
            }
        }
        
        // Save settings
        saveSettings();
    }
    
    function updateDifficulty() {
        difficulty = elements.difficultySelect.value;
        saveSettings();
    }
    
    function updateNotifications() {
        saveSettings();
    }
    
    function getDifficultyMultiplier() {
        switch(difficulty) {
            case "easy": return 1.2;
            case "medium": return 1;
            case "hard": return 0.8;
            default: return 1;
        }
    }
    
    // --- Save/Load functions ---
    function saveGame() {
        const gameData = {
            stats,
            day,
            hour,
            minute,
            skippedDays,
            playerName,
            playerGender,
            playerMajor,
            auraPoints,
            energyBoostActive,
            studyBonusActive,
            socialBoostActive,
            mentalRefreshActive,
            energyBoostTimeLeft,
            studyBonusTimeLeft,
            socialBoostTimeLeft
        };
        
        localStorage.setItem('aisatRPG_save', JSON.stringify(gameData));
        showNotification('Game saved successfully!');
    }
    
    function loadGame() {
        const savedData = localStorage.getItem('aisatRPG_save');
        
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                
                // Load game data
                stats = gameData.stats;
                day = gameData.day;
                hour = gameData.hour;
                minute = gameData.minute;
                skippedDays = gameData.skippedDays;
                playerName = gameData.playerName;
                playerGender = gameData.playerGender;
                playerMajor = gameData.playerMajor;
                auraPoints = gameData.auraPoints || 100;
                energyBoostActive = gameData.energyBoostActive || false;
                studyBonusActive = gameData.studyBonusActive || false;
                socialBoostActive = gameData.socialBoostActive || false;
                mentalRefreshActive = gameData.mentalRefreshActive || false;
                energyBoostTimeLeft = gameData.energyBoostTimeLeft || 0;
                studyBonusTimeLeft = gameData.studyBonusTimeLeft || 0;
                socialBoostTimeLeft = gameData.socialBoostTimeLeft || 0;
                
                // Update UI
                elements.displayPlayerName.textContent = playerName;
                elements.finalPlayerName.textContent = playerName;
                updateStats();
                updateClock();
                updateAuraDisplay();
                
                showNotification('Game loaded successfully!');
            } catch (e) {
                console.error('Error loading game:', e);
                showNotification('Error loading game data.');
            }
        } else {
            showNotification('No saved game found.');
        }
    }
    
    function showSaveLoadButtons() {
        elements.saveLoadSection.style.display = 'flex';
    }
    
    // --- Settings persistence ---
    function saveSettings() {
        const settings = {
            volume: elements.volumeSlider.value,
            difficulty: elements.difficultySelect.value,
            notifications: elements.notificationsCheckbox.checked,
            darkMode: document.body.classList.contains('dark-mode')
        };
        
        localStorage.setItem('aisatRPG_settings', JSON.stringify(settings));
    }
    
    function loadSettings() {
        const savedSettings = localStorage.getItem('aisatRPG_settings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Apply settings
                elements.volumeSlider.value = settings.volume;
                elements.volumeValue.textContent = `${settings.volume}%`;
                elements.difficultySelect.value = settings.difficulty;
                elements.notificationsCheckbox.checked = settings.notifications;
                
                // Set dark mode if enabled
                if (settings.darkMode) {
                    document.body.classList.add('dark-mode');
                    elements.modeToggle.textContent = '🌙';
                }
                
                // Update audio volume
                for (const key in audioElements) {
                    if (audioElements[key]) {
                        audioElements[key].volume = settings.volume / 100;
                    }
                }
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
    }
    
    // --- Aura System Functions ---
    function updateAuraDisplay() {
        if (elements.auraPoints) {
            elements.auraPoints.textContent = auraPoints;
        }
        updateRewardButtonStates();
    }
    
    function updateRewardButtonStates() {
        const rewards = {
            'reward-skip-day': 20,
            'reward-energy-boost': 15,
            'reward-study-bonus': 25,
            'reward-social-boost': 18,
            'reward-mental-refresh': 30
        };
        
        for (const [id, cost] of Object.entries(rewards)) {
            const button = document.getElementById(id);
            if (button) {
                button.disabled = auraPoints < cost;
            }
        }
    }
    
    function addAuraPoints(amount) {
        auraPoints += amount;
        updateAuraDisplay();
        showNotification(`+${amount} Aura Points!`);
    }
    
    function purchaseSkipDay() {
        if (auraPoints >= 20) {
            auraPoints -= 20;
            updateAuraDisplay();
            
            // Skip to the next day
            nextDay();
            showNotification("Skipped to the next day!");
        }
    }
    
    function purchaseEnergyBoost() {
        if (auraPoints >= 15 && !energyBoostActive) {
            auraPoints -= 15;
            updateAuraDisplay();
            
            energyBoostActive = true;
            energyBoostTimeLeft = 3;
            showNotification("Energy Boost activated! Fitness activities will be more effective for 3 days.");
        }
    }
    
    function purchaseStudyBonus() {
        if (auraPoints >= 25 && !studyBonusActive) {
            auraPoints -= 25;
            updateAuraDisplay();
            
            studyBonusActive = true;
            studyBonusTimeLeft = 2;
            showNotification("Study Bonus activated! Academic activities will give 2x points for 2 days.");
        }
    }
    
    function purchaseSocialBoost() {
        if (auraPoints >= 18 && !socialBoostActive) {
            auraPoints -= 18;
            updateAuraDisplay();
            
            socialBoostActive = true;
            socialBoostTimeLeft = 4;
            showNotification("Social Boost activated! Social activities will be more effective for 4 days.");
        }
    }
    
    function purchaseMentalRefresh() {
        if (auraPoints >= 30) {
            auraPoints -= 30;
            updateAuraDisplay();
            
            stats.mentalHealth = Math.min(stats.mentalHealth + 5, 20);
            updateStats();
            showNotification("Mental Refresh activated! +5 to Mental Health.");
        }
    }
    
    // --- Utility functions ---
    function playSound(audio) {
        if (!audio) return;
        
        try {
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.warn('Audio playback failed:', e);
            });
        } catch(e) {
            console.warn('Audio error:', e);
        }
    }
    
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        elements.modeToggle.textContent = document.body.classList.contains('dark-mode') 
            ? '🌙' 
            : '🌞';
        updateRadarChartColors();
        saveSettings();
    }
    
    // --- Public API ---
    return {
        init: init
    };
})();

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize radar chart with new stats
    const radarCtx = document.getElementById('statsRadar').getContext('2d');
    window.radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: [
                'Fitness 💪',
                'Academics 📚',
                'Social 👥',
                'Mental Health 🧠',
                'Finances 💰'
            ],
            datasets: [{
                label: 'Your Stats',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(0, 188, 212, 0.28)',
                borderColor: '#00796b',
                borderWidth: 2,
                pointBackgroundColor: '#00796b',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: false,
            plugins: { legend: { display: false } },
            elements: { line: { tension: 0 } },
            scales: {
                r: {
                    min: 0,
                    max: 20,
                    ticks: {
                        stepSize: 5,
                        display: false,
                        backdropColor: 'transparent'
                    },
                    grid: {
                        circular: false,
                        color: '#00bcd4'
                    },
                    angleLines: { color: '#00796b' },
                    pointLabels: {
                        color: '#00796b',
                        font: { size: 14, weight: '700', family: 'Poppins, Arial, sans-serif' }
                    }
                }
            }
        }
    });
    // Exit Game Functionality
function setupExitFunctionality() {
    const exitModal = document.getElementById('exit-modal');
    const exitConfirmBtn = document.getElementById('exit-confirm');
    const exitCancelBtn = document.getElementById('exit-cancel');
    
    // Function to show exit confirmation
    function showExitConfirmation() {
        exitModal.style.display = 'flex';
    }
    
    // Function to hide exit confirmation
    function hideExitConfirmation() {
        exitModal.style.display = 'none';
    }
    
    // Function to close the game
    function closeGame() {
        // Try to close the window
        try {
            window.open('', '_self').close();
        } catch (e) {
            // If browser blocks window.close(), show message
            alert('Thank you for playing AISAT Student RPG! Please close this tab/window.');
        }
    }
    
    // Event listeners
    document.getElementById('menu-exit').addEventListener('click', showExitConfirmation);
    document.getElementById('exit-game').addEventListener('click', showExitConfirmation);
    
    exitConfirmBtn.addEventListener('click', closeGame);
    exitCancelBtn.addEventListener('click', hideExitConfirmation);
    
    // Close modal if clicked outside
    exitModal.addEventListener('click', function(e) {
        if (e.target === exitModal) {
            hideExitConfirmation();
        }
    });
}

// Call this function in your main init function
// Add this line to your existing init() function:
// setupExitFunctionality();
    
    // Initialize the game
    AISATGame.init();
});
