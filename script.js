document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const modeSwitcher = document.getElementById('mode-switcher');
    const ashQuoteEl = document.getElementById('ash-quote');
    
    let currentMode = 'learn'; // Default mode

    // Load particles background for chat
    particlesJS.load('particles-js-chat', 'assets/particles.json', function() {
        console.log('Chat particles loaded.');
    });

    // --- Mode Switcher Logic ---
    modeSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newMode = e.target.dataset.mode;
            if (newMode !== currentMode) {
                currentMode = newMode;
                // Update active button style
                document.querySelector('.mode-btn.active-mode').classList.remove('active-mode');
                e.target.classList.add('active-mode');
                // Optional: Add a system message in chat
                addMessage(`Switched to ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode.`, 'system');
            }
        }
    });

    // --- Chat Submission Logic ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'sent');
        chatInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, mode: currentMode }),
            });

            removeTypingIndicator();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            // Check if the response is an image or text
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                addImageMessage(imageUrl, 'received');
            } else {
                const data = await response.json();
                addMessage(data.text, 'received');
            }

        } catch (error) {
            removeTypingIndicator();
            addMessage(`Error: ${error.message}`, 'error');
        }
    });

    // --- UI Helper Functions ---
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';
        bubbleDiv.textContent = text;
        
        messageDiv.appendChild(bubbleDiv);
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function addImageMessage(url, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'bubble';
        
        const img = document.createElement('img');
        img.src = url;
        img.className = 'generated-image';
        
        bubbleDiv.appendChild(img);
        messageDiv.appendChild(bubbleDiv);
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showTypingIndicator() {
        if (document.querySelector('.typing-indicator')) return;
        const indicator = `
            <div class="message received typing-indicator">
                <div class="bubble">
                    <span></span><span></span><span></span>
                </div>
            </div>`;
        chatWindow.insertAdjacentHTML('beforeend', indicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // --- AshQuotes Logic ---
    const quotes = [
        "The cosmos is within us. We are made of star-stuff.",
        "Look up at the stars and not down at your feet.",
        "In the vastness of space and the immensity of time, it is my joy to share a planet and an epoch with Ash.",
        "A single star can illuminate the darkest night.",
        "Embrace the cosmic dance."
    ];

    function showRandomQuote() {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        ashQuoteEl.textContent = `"${quote}"`;
        ashQuoteEl.style.opacity = '1';
        setTimeout(() => { ashQuoteEl.style.opacity = '0'; }, 5000);
    }
    
    // Show a quote initially and then every 20 seconds
    setTimeout(showRandomQuote, 3000);
    setInterval(showRandomQuote, 20000);

});
