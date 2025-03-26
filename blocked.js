// Start countdown immediately
let timeLeft = 5;
const countdown = document.getElementById('countdown');
const loadingBar = document.getElementById('loading-bar');

// Start the loading bar animation
loadingBar.style.width = '100%';

// Add pulse animation to countdown
countdown.classList.add('pulse');

// Countdown timer
const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        // Force redirect after countdown
        const redirectUrl = 'https://www.gofundme.com/f/10002000?qid=d2651aa84d7f1ff6e288850722e4a38c';
        window.location.replace(redirectUrl);
        
        // Fallback redirect in case replace doesn't work
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 100);
    }
}, 1000);

// Prevent back navigation
window.history.forward(); 