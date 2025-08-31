// intro.js - Introduction screen with typewriter effect

document.addEventListener('DOMContentLoaded', function() {
    const introText = document.getElementById('intro-text');
    const startButton = document.getElementById('start-game');
    
    const introMessage = `You are a student at AISAT, embarking on a journey of growth and discovery.
    
Your goal is to balance your academic life with personal development, social activities, and mental well-being.
    
Earn Aura Points by completing tasks and participating in campus events. Use these points to unlock special rewards and boosts.
    
Make wise choices, manage your time effectively, and become the best version of yourself!
    
Your journey begins now...`;
    
    let charIndex = 0;
    let typingSpeed = 40; // milliseconds per character
    
    function typeWriter() {
        if (charIndex < introMessage.length) {
            // Handle line breaks
            if (introMessage.charAt(charIndex) === '\n') {
                introText.innerHTML += '<br>';
            } else {
                introText.innerHTML += introMessage.charAt(charIndex);
            }
            charIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // Show start button when typing is complete
            startButton.style.display = 'block';
        }
    }
    
    // Start the typewriter effect
    typeWriter();
    
    // Start game button event
    startButton.addEventListener('click', function() {
        document.getElementById('intro-screen').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    });
});
