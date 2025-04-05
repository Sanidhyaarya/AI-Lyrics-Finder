document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to handle sending messages
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Remove placeholder if it exists
        const placeholder = document.getElementById('placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';

        // Parse song and artist
        const [song, artist] = message.split(' by ');
        if (!song || !artist) {
            addMessage('⚠️ Please enter song and artist in the format: "Song Name by Artist"');
            return;
        }

        try {
            // Show loading message
            addMessage('🎶 Searching for lyrics...');

            // Call lyrics.ovh API
            const response = await fetch(`https://api.lyrics.ovh/v1/${artist.trim()}/${song.trim()}`);
            const data = await response.json();

            // Remove loading message
            chatBox.removeChild(chatBox.lastChild);

            if (data.lyrics) {
                addMessage(`🎵 ${song.trim()} by ${artist.trim()}`);
                addMessage(data.lyrics.replace(/\n/g, '<br>'));
            } else {
                addMessage('❌ Sorry, no lyrics found.');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('❌ Something went wrong. Please try again.');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Optional: Theme toggle logic (from old file)
    const toggleButton = document.getElementById("theme-toggle");
    const body = document.body;

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            body.classList.toggle("light");
            toggleButton.textContent = body.classList.contains("light") ? "☀️" : "🌙";
        });
    }
});
