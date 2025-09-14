// API Key for Gemini API
const API_KEY = "AIzaSyAE0f-M8FU0IRXLVFcLNgNRTN7R8558P5o";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Event Listeners
sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage();
    }
});

// Auto-resize textarea as user types
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
    // Limit max height
    if (userInput.scrollHeight > 120) {
        userInput.style.overflowY = 'auto';
    } else {
        userInput.style.overflowY = 'hidden';
    }
});

// Handle user message submission
async function handleUserMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input field and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get response from Gemini API
        const response = await getGeminiResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessageToChat('bot', response);
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessageToChat('bot', 'Sorry, I encountered an error. Please try again later.');
        console.error('Error:', error);
    }
    
    // Scroll to bottom of chat
    scrollToBottom();
}

// Add message to chat container
function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Process message text and handle formatting
    if (sender === 'bot') {
        // Split message by new lines to create proper paragraphs
        const paragraphs = message.split('\n\n');
        
        paragraphs.forEach((paragraph, index) => {
            if (paragraph.trim() !== '') {
                const p = document.createElement('p');
                p.textContent = paragraph;
                
                // Add margin between paragraphs
                if (index > 0) {
                    p.style.marginTop = '10px';
                }
                
                messageContent.appendChild(p);
            }
        });
    } else {
        // For user messages, keep it simple
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageContent.appendChild(messageText);
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator-container');
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('typing-indicator');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom of chat container
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get response from Gemini API
async function getGeminiResponse(userMessage) {
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: userMessage
                    }
                ]
            }
        ]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the response text from the API response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && 
        data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Unexpected API response format');
    }
}

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You could add additional error handling here
});