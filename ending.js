// ending.js - Enhanced ending screen with typewriter effect

document.addEventListener('DOMContentLoaded', function() {
    const congratulationsText = document.getElementById('congratulations-text');
    const restartBtn = document.getElementById('restart-game');
    const exitBtn = document.getElementById('exit-game');
    const shareBtn = document.getElementById('share-result');
    
    // Function to show ending screen with typewriter effect
    function showEndingScreen() {
        const congratsMessage = `Congratulations on completing your journey at AISAT!
        
Over the past 7 days, you've balanced academics, fitness, social life, mental health, and finances.

Your dedication and choices have shaped your student experience and determined your unique path.

Now let's see what kind of AISAT student you've become...`;
        
        let charIndex = 0;
        let typingSpeed = 40; // milliseconds per character
        
        function typeWriter() {
            if (charIndex < congratsMessage.length) {
                // Handle line breaks
                if (congratsMessage.charAt(charIndex) === '\n') {
                    congratulationsText.innerHTML += '<br>';
                } else {
                    congratulationsText.innerHTML += congratsMessage.charAt(charIndex);
                }
                charIndex++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                // Show buttons when typing is complete
                restartBtn.style.display = 'block';
                exitBtn.style.display = 'block';
                shareBtn.style.display = 'block';
            }
        }
        
        // Start the typewriter effect
        typeWriter();
    }
    
    // Event listeners for ending screen buttons
    restartBtn.addEventListener('click', function() {
        // Reset game and return to main menu
        document.getElementById('end-result').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
        // Additional reset logic would be handled by the main game.js
    });
    
    exitBtn.addEventListener('click', function() {
        if (confirm("Are you sure you want to exit the game?")) {
            alert("Thanks for playing AISAT Student RPG!");
            // In a real implementation, you might close the window or redirect
        }
    });
    
    shareBtn.addEventListener('click', function() {
        const finalCategory = document.getElementById('slot-result').textContent;
        const shareText = `I just completed AISAT Student RPG and became a ${finalCategory}! Try it yourself!`;
        
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
    });
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Result copied to clipboard!');
    }
    
    // Expose function to be called from game.js when the game ends
    window.showEndingScreen = showEndingScreen;
});
