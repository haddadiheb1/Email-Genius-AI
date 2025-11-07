// Configuration
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Load .env and expose window.env for runtime use
window.env = window.env || {};

async function loadEnv() {
    try {
        const envUrl = (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function')
            ? chrome.runtime.getURL('.env')
            : '.env';

        const res = await fetch(envUrl);
        if (!res.ok) {
            console.warn('No .env found or not accessible:', res.status);
            return;
        }
        const text = await res.text();
        const parsed = {};
        text.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
            if (match) {
                let value = match[2].trim();
                // Strip surrounding quotes and optional trailing semicolon
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
                    value = value.slice(1, -1);
                }
                if (value.endsWith(';')) value = value.slice(0, -1);
                parsed[match[1]] = value;
            }
        });
        window.env = { ...window.env, ...parsed };
    } catch (e) {
        console.warn('Failed to load .env:', e);
    }
}

// DOM Elements
const composeTab = document.getElementById('compose-tab');
const replyTab = document.getElementById('reply-tab');
const composeContent = document.getElementById('compose-content');
const replyContent = document.getElementById('reply-content');

const recipientEmail = document.getElementById('recipient-email');
const emailSubject = document.getElementById('email-subject');
const emailDescription = document.getElementById('email-description');
const generateEmailBtn = document.getElementById('generate-email');
const generateEmailText = document.getElementById('generate-email-text');
const generateEmailSpinner = document.getElementById('generate-email-spinner');
const generatedEmailContainer = document.getElementById('generated-email-container');
const generatedEmail = document.getElementById('generated-email');
const copyEmailBtn = document.getElementById('copy-email');
const composeEmailBtn = document.getElementById('compose-email');
const regenerateEmailBtn = document.getElementById('regenerate-email');

const originalEmail = document.getElementById('original-email');
const generateReplyBtn = document.getElementById('generate-reply');
const generateReplyText = document.getElementById('generate-reply-text');
const generateReplySpinner = document.getElementById('generate-reply-spinner');
const generatedReplyContainer = document.getElementById('generated-reply-container');
const generatedReply = document.getElementById('generated-reply');
const copyReplyBtn = document.getElementById('copy-reply');
const insertReplyBtn = document.getElementById('insert-reply');
const regenerateReplyBtn = document.getElementById('regenerate-reply');

// Dark mode elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const themeIcon = document.getElementById('theme-icon');
const aiLogo = document.getElementById('ai-logo');

// Tone selection variables
let selectedComposeTone = 'professional';
let selectedReplyTone = 'professional';

// Store last generation parameters for regeneration
let lastEmailParams = null;
let lastReplyParams = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadEnv();
        initializeDarkMode();
        initializeEventListeners();
        // Hide AI logo on open
        if (aiLogo) aiLogo.style.opacity = '0';
        setTimeout(() => {
            if (aiLogo) aiLogo.style.opacity = '1';
        }, 600);
        // Auto-close when clicking outside
        document.addEventListener('mousedown', function(e) {
            const sidebar = document.querySelector('.container');
            if (sidebar && !sidebar.contains(e.target)) {
                window.close();
            }
        });
    } catch (err) {
        console.error('Sidebar initialization failed:', err);
    }
});

function initializeEventListeners() {
    // Dark mode toggle
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

    // Tab switching
    if (composeTab) composeTab.addEventListener('click', () => switchToComposeTab());
    if (replyTab) replyTab.addEventListener('click', () => switchToReplyTab());

    // Compose tone buttons
    const composeToneButtons = document.querySelectorAll('#compose-content .tone-btn');
    composeToneButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            composeToneButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedComposeTone = btn.getAttribute('data-tone');
        });
    });

    // Reply tone buttons
    const replyToneButtons = document.querySelectorAll('#reply-content .tone-btn');
    replyToneButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            replyToneButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedReplyTone = btn.getAttribute('data-tone');
        });
    });

    // Generate buttons
    if (generateEmailBtn) generateEmailBtn.addEventListener('click', generateEmail);
    if (generateReplyBtn) generateReplyBtn.addEventListener('click', generateReply);

    // Copy buttons
    if (copyEmailBtn) copyEmailBtn.addEventListener('click', () => copyToClipboard(generatedEmail.textContent));
    if (copyReplyBtn) copyReplyBtn.addEventListener('click', () => copyToClipboard(generatedReply.textContent));

    // Compose email button
    if (composeEmailBtn) composeEmailBtn.addEventListener('click', composeEmailInGmail);

    // Insert reply button
    if (insertReplyBtn) insertReplyBtn.addEventListener('click', insertReplyIntoGmail);

    // Regenerate buttons
    if (regenerateEmailBtn) regenerateEmailBtn.addEventListener('click', regenerateEmail);
    if (regenerateReplyBtn) regenerateReplyBtn.addEventListener('click', regenerateReply);

    // Auto-detect email when switching to reply tab
    if (typeof requestEmailContent === 'function') {
        requestEmailContent();
    }
}

function switchToComposeTab() {
    composeTab.classList.add('active');
    replyTab.classList.remove('active');
    composeContent.classList.add('active');
    replyContent.classList.remove('active');
}

function switchToReplyTab() {
    replyTab.classList.add('active');
    composeTab.classList.remove('active');
    replyContent.classList.add('active');
    composeContent.classList.remove('active');
    requestEmailContent();
}

// OpenAI API call function
async function callOpenAI(messages) {
    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API call failed:', error);
        throw error;
    }
}

// Generate email function
async function generateEmail() {
    const subject = emailSubject.value.trim();
    const description = emailDescription.value.trim();

    if (!subject || !description) {
        alert('Please fill in both subject and description fields.');
        return;
    }

    // Store parameters for regeneration
    lastEmailParams = { subject, description, tone: selectedComposeTone };

    await performEmailGeneration(subject, description, selectedComposeTone);
}

// Regenerate email function
async function regenerateEmail() {
    if (!lastEmailParams) {
        alert('No previous email to regenerate.');
        return;
    }

    await performEmailGeneration(lastEmailParams.subject, lastEmailParams.description, lastEmailParams.tone);
}

// Perform email generation with given parameters
async function performEmailGeneration(subject, description, tone) {

    // Show loading state
    generateEmailBtn.disabled = true;
    generateEmailText.textContent = 'Generating...';
    generateEmailSpinner.classList.remove('hidden');

    try {
        const prompt = `Write a ${tone} email with the subject "${subject}". 
        Description: ${description}
        
        Please write a complete, well-structured email that is ${tone} in tone.`;

        const messages = [
            {
                role: 'system',
                content: 'You are a professional email writing assistant. Write clear, well-structured emails based on the user\'s requirements.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const emailContent = await callOpenAI(messages);
        
        // Display the generated email
        generatedEmail.textContent = emailContent;
        generatedEmailContainer.classList.remove('hidden');
        generatedEmailContainer.classList.add('show');

    } catch (error) {
        alert('Failed to generate email. Please try again.');
        console.error('Error generating email:', error);
    } finally {
        // Reset loading state
        generateEmailBtn.disabled = false;
        generateEmailText.textContent = '🚀 Generate Email';
        generateEmailSpinner.classList.add('hidden');
    }
}

// Generate reply function
async function generateReply() {
    const originalEmailContent = originalEmail.value.trim();

    if (!originalEmailContent) {
        alert('Please provide the original email content.');
        return;
    }

    // Store parameters for regeneration
    lastReplyParams = { originalEmailContent, tone: selectedReplyTone };

    await performReplyGeneration(originalEmailContent, selectedReplyTone);
}

// Regenerate reply function
async function regenerateReply() {
    if (!lastReplyParams) {
        alert('No previous reply to regenerate.');
        return;
    }

    await performReplyGeneration(lastReplyParams.originalEmailContent, lastReplyParams.tone);
}

// Perform reply generation with given parameters
async function performReplyGeneration(originalEmailContent, tone) {

    // Show loading state
    generateReplyBtn.disabled = true;
    generateReplyText.textContent = 'Generating...';
    generateReplySpinner.classList.remove('hidden');

    try {
        const prompt = `Please write a ${tone} reply to the following email:

${originalEmailContent}

The reply should be ${tone} in tone and address the main points of the original email appropriately.`;

        const messages = [
            {
                role: 'system',
                content: 'You are a professional email writing assistant. Write appropriate replies to emails based on their content and the requested tone.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const replyContent = await callOpenAI(messages);
        
        // Display the generated reply
        generatedReply.textContent = replyContent;
        generatedReplyContainer.classList.remove('hidden');
        generatedReplyContainer.classList.add('show');

    } catch (error) {
        alert('Failed to generate reply. Please try again.');
        console.error('Error generating reply:', error);
    } finally {
        // Reset loading state
        generateReplyBtn.disabled = false;
        generateReplyText.textContent = '💬 Generate Reply';
        generateReplySpinner.classList.add('hidden');
    }
}

// Copy to clipboard function
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Show feedback
        const event = new CustomEvent('showToast', {
            detail: { message: 'Copied to clipboard!', type: 'success' }
        });
        window.dispatchEvent(event);
    } catch (error) {
        console.error('Failed to copy text: ', error);
        alert('Failed to copy to clipboard');
    }
}

// Insert reply into Gmail
function insertReplyIntoGmail() {
    const replyText = generatedReply.textContent;
    
    // Send message to content script to insert reply
    window.parent.postMessage({
        type: 'INSERT_REPLY',
        content: replyText
    }, '*');

    // Show feedback
    const event = new CustomEvent('showToast', {
        detail: { message: 'Reply inserted into Gmail!', type: 'success' }
    });
    window.dispatchEvent(event);
}

// Compose email in Gmail
function composeEmailInGmail() {
    const recipient = recipientEmail.value.trim();
    const subject = emailSubject.value.trim();
    const emailContent = generatedEmail.textContent;

    if (!recipient || !subject || !emailContent) {
        alert('Please fill in recipient email, subject, and generate email content first.');
        return;
    }

    // Send message to content script to compose email
    window.parent.postMessage({
        type: 'COMPOSE_EMAIL',
        data: {
            recipient: recipient,
            subject: subject,
            content: emailContent
        }
    }, '*');

    // Show feedback
    const event = new CustomEvent('showToast', {
        detail: { message: 'Email composed in Gmail!', type: 'success' }
    });
    window.dispatchEvent(event);
}

// Request email content from Gmail
function requestEmailContent() {
    // Send message to content script to get current email content
    window.parent.postMessage({
        type: 'GET_EMAIL_CONTENT'
    }, '*');
}

// Listen for messages from content script
window.addEventListener('message', (event) => {
    if (event.data.type === 'EMAIL_CONTENT') {
        originalEmail.value = event.data.content;
    }
});

// Simple toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6b7280'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Listen for toast events
window.addEventListener('showToast', (event) => {
    showToast(event.detail.message, event.detail.type);
});

// Dark Mode Functions
function initializeDarkMode() {
    // Check if dark mode was previously enabled
    const isDarkMode = localStorage.getItem('emailGeniusDarkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggle(true);
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    localStorage.setItem('emailGeniusDarkMode', isDarkMode.toString());
    
    updateDarkModeToggle(isDarkMode);
    
    // Add animation feedback
    if (darkModeToggle) {
        darkModeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            darkModeToggle.style.transform = 'scale(1)';
        }, 150);
    }
}

function updateDarkModeToggle(isDarkMode) {
    if (themeIcon) {
        themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    }
}
