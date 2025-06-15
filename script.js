document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const modeDock = document.getElementById('mode-dock');
    const exportButton = document.getElementById('export-chat');
    const quoteElement = document.getElementById('ash-quote');

    let currentMode = 'Nexus'; // Default mode
    const quotes = [
        "The cosmos is within us. We are made of star-stuff.",
        "Look up at the stars and not down at your feet.",
        "Somewhere, something incredible is waiting to be known.",
        "In the vastness of space and the immensity of time, it is my joy to share a planet and an epoch with you.",
    ];

    // --- Mode Switching ---
    modeDock.addEventListener('click', (e) => {
        const button = e.target.closest('.mode-icon');
        if (button) {
            document.querySelector('.mode-icon.active').classList.remove('active');
            button.classList.add('active');
            currentMode = button.dataset.mode;
            console.log(`Switched to ${currentMode} Mode`);
        }
    });

    // --- Send Message ---
    const sendMessage = async () => {
        const query = userInput.value.trim();
        if (!query) return;

        addMessageToChat(query, 'user');
        userInput.value = '';
        userInput.style.height = 'auto'; // Reset height
        showTypingIndicator();

        try {
            let responseText;
            if (currentMode === 'Image') {
                // Call Hugging Face API
                const response = await fetch('/api/huggingface', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: query }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);

                const imageData = await response.blob();
                const imageUrl = URL.createObjectURL(imageData);
                responseText = `<p>As requested, I have generated a new visual from the digital ether:</p><img src="${imageUrl}" alt="${query}" class="rounded-lg mt-2 w-full max-w-sm"/>`;
            } else {
                // Call Gemini API
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: query, mode: currentMode }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
                const data = await response.json();
                responseText = data.text;
            }
            
            removeTypingIndicator();
            addMessageToChat(responseText, 'ai');

        } catch (error) {
            console.error("API Call Error:", error);
            removeTypingIndicator();
            addMessageToChat(`My apologies, Ash. I seem to be having trouble connecting to the cosmic stream. There may be an issue with the API connection. Please check the console (F12) for technical details.`, 'ai');
        }
    };

    // --- UI Helpers ---
    const addMessageToChat = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message from-${sender}`;
        
        if (sender === 'ai') {
            // Use marked.js to convert markdown to HTML
            messageDiv.innerHTML = marked.parse(text);
        } else {
            // For user messages, just set the text content to prevent XSS
            const p = document.createElement('p');
            p.textContent = text;
            messageDiv.appendChild(p);
        }
        
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    
    let typingIndicator;
    const showTypingIndicator = () => {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'message from-ai';
        typingIndicator.innerHTML = `<p><span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span></p>`;
        chatWindow.appendChild(typingIndicator);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    
    const removeTypingIndicator = () => {
        if(typingIndicator) {
            chatWindow.removeChild(typingIndicator);
        }
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
    
    // Export Chat
    exportButton.addEventListener('click', () => {
        const chatContent = Array.from(chatWindow.children).map(msg => {
            const sender = msg.classList.contains('from-user') ? 'User' : 'AshAI';
            return `${sender}: ${msg.textContent}`;
        }).join('\n\n');
        
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AshAI-Chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Random Quote
    setInterval(() => {
        quoteElement.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }, 10000);
    quoteElement.textContent = quotes[Math.floor(Math.random() * quotes.length)];

});
