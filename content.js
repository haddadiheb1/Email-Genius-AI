// Content script for Gmail integration
console.log('AI Email Assistant: Content script loaded');

let sidebarIframe = null;
let isGmailReady = false;
let isSidebarReady = false;

// Check if we're on Gmail
function isGmail() {
    return window.location.hostname === 'mail.google.com';
}

// Wait for Gmail to load
function waitForGmail() {
    return new Promise((resolve) => {
        const checkGmail = () => {
            const gmailContainer = document.querySelector('[gh="tl"]') || 
                                document.querySelector('.nH.bkL') || 
                                document.querySelector('#\\:2');
            
            if (gmailContainer) {
                isGmailReady = true;
                resolve();
            } else {
                setTimeout(checkGmail, 1000);
            }
        };
        checkGmail();
    });
}

// Create and inject sidebar
function createSidebar() {
    if (sidebarIframe) return; // Already created

    // Create sidebar container with modern design
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'ai-email-sidebar-container';
    sidebarContainer.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100vh;
        z-index: 10000;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98));
        backdrop-filter: blur(24px) saturate(180%);
        border-left: 1px solid rgba(226, 232, 240, 0.6);
        box-shadow: -20px 0 50px rgba(0, 0, 0, 0.08), -8px 0 32px rgba(0, 0, 0, 0.04);
        transform: translateX(100%);
        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;

    // Create iframe for sidebar content
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
    sidebarIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        border-radius: 0;
    `;

    // Add load event listener to ensure iframe is ready
    sidebarIframe.addEventListener('load', () => {
        console.log('AI Email Assistant: Sidebar iframe loaded successfully');
        isSidebarReady = true;
        // Iframe is now ready for communication
    });

    sidebarIframe.addEventListener('error', () => {
        console.error('AI Email Assistant: Failed to load sidebar iframe');
        isSidebarReady = false;
    });

    // Create toggle button positioned in Gmail's top toolbar area
    const toggleButton = document.createElement('button');
    toggleButton.id = 'ai-email-toggle';
    toggleButton.innerHTML = `
        <div class="toggle-inner">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" class="toggle-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <div class="ai-indicator">AI</div>
        </div>
    `;
    
    // Position the toggle button in Gmail's toolbar area
    positionToggleButton(toggleButton);
    
    // Toggle functionality with smooth animations
    let sidebarVisible = false;
    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebarVisible = !sidebarVisible;
        
        if (sidebarVisible) {
            showSidebar(sidebarContainer, toggleButton);
        } else {
            hideSidebar(sidebarContainer, toggleButton);
        }
    });

    // Enhanced hover effects
    toggleButton.addEventListener('mouseenter', () => {
        if (!sidebarVisible) {
            toggleButton.style.transform = 'scale(1.05)';
            toggleButton.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
        }
    });

    toggleButton.addEventListener('mouseleave', () => {
        if (!sidebarVisible) {
            toggleButton.style.transform = 'scale(1)';
            toggleButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }
    });

    // Assemble sidebar
    sidebarContainer.appendChild(sidebarIframe);
    document.body.appendChild(sidebarContainer);
    document.body.appendChild(toggleButton);

    console.log('AI Email Assistant: Modern sidebar created');
}

// Position toggle button in Gmail's interface
function positionToggleButton(toggleButton) {
    toggleButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 80px;
        z-index: 10001;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Try to find Gmail's toolbar and position relative to it
    setTimeout(() => {
        const gmailToolbar = document.querySelector('[role="banner"]') || 
                           document.querySelector('.gb_uc') ||
                           document.querySelector('header') ||
                           document.querySelector('.nH.bkL .nH.nn');
        
        if (gmailToolbar) {
            const rect = gmailToolbar.getBoundingClientRect();
            toggleButton.style.top = `${rect.bottom + 10}px`;
            toggleButton.style.right = '20px';
        }
    }, 1000);
}

// Show sidebar with animation
function showSidebar(container, button) {
    container.style.transform = 'translateX(0)';
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    button.style.transform = 'scale(0.95)';
    button.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
    
    // Add margin to Gmail content
    const gmailMain = document.querySelector('[role="main"]') || 
                     document.querySelector('.nH.bkL') ||
                     document.body;
    if (gmailMain) {
        gmailMain.style.marginRight = '380px';
        gmailMain.style.transition = 'margin-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
}

// Hide sidebar with animation
function hideSidebar(container, button) {
    container.style.transform = 'translateX(100%)';
    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    button.style.transform = 'scale(1)';
    button.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
    
    // Remove margin from Gmail content
    const gmailMain = document.querySelector('[role="main"]') || 
                     document.querySelector('.nH.bkL') ||
                     document.body;
    if (gmailMain) {
        gmailMain.style.marginRight = '0';
    }
}

// Extract email content from current view
function getEmailContent() {
    // Try multiple selectors for email content
    const emailSelectors = [
        '[data-message-id] .ii.gt .a3s.aiL', // Gmail email body
        '.a3s.aiL', // Alternative email body
        '.ii.gt .a3s', // Another alternative
        '.adn.ads .a3s', // Conversation view
        '[role="listitem"] .a3s', // List view
    ];

    for (const selector of emailSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            // Get the last (most recent) email in the conversation
            const lastEmail = elements[elements.length - 1];
            const content = lastEmail.innerText || lastEmail.textContent;
            if (content && content.trim().length > 10) {
                return content.trim();
            }
        }
    }

    // Try to get subject line as fallback
    const subjectElement = document.querySelector('.hP') || 
                          document.querySelector('[data-legacy-thread-id] .bog') ||
                          document.querySelector('.ha .hP');
    
    if (subjectElement) {
        return `Subject: ${subjectElement.textContent.trim()}\n\n(Email body not detected - please open the email fully)`;
    }

    return null;
}

// Insert reply into Gmail compose box
function insertReplyToGmail(content) {
    // Look for active compose box
    const composeSelectors = [
        '[aria-label="Message Body"]',
        '.Am.Al.editable',
        '.editable[contenteditable="true"]',
        '.yk .yk.Ak .editable',
        'div[contenteditable="true"][aria-label]'
    ];

    for (const selector of composeSelectors) {
        const composeBox = document.querySelector(selector);
        if (composeBox && composeBox.offsetParent !== null) { // Check if visible
            // Clear existing content and insert new content
            composeBox.focus();
            composeBox.innerHTML = content.replace(/\n/g, '<br>');
            
            // Trigger input event to notify Gmail of the change
            const event = new Event('input', { bubbles: true });
            composeBox.dispatchEvent(event);
            
            console.log('AI Email Assistant: Reply inserted into Gmail');
            return true;
        }
    }

    // If no compose box found, try to click reply button first
    const replyButton = document.querySelector('[data-tooltip="Reply"]') ||
                       document.querySelector('[aria-label*="Reply"]') ||
                       document.querySelector('.T-I.J-J5-Ji.T-I-KE.L3');
    
    if (replyButton) {
        replyButton.click();
        // Wait a bit and try again
        setTimeout(() => insertReplyToGmail(content), 1000);
        return true;
    }

    console.log('AI Email Assistant: Could not find Gmail compose box');
    return false;
}

// Compose new email in Gmail
function composeEmailInGmail(emailData) {
    // Click the compose button first
    const composeButton = document.querySelector('.T-I.T-I-KE.L3') ||
                         document.querySelector('[data-tooltip="Compose"]') ||
                         document.querySelector('[aria-label*="Compose"]') ||
                         document.querySelector('.z0 > .L3');

    if (composeButton) {
        composeButton.click();
        
        // Wait for compose window to open and then fill it
        setTimeout(() => {
            fillComposeWindow(emailData);
            
            // Try again after another delay if fields weren't found initially
            setTimeout(() => {
                fillComposeWindow(emailData);
            }, 1000);
        }, 1500); // Increased delay for better Gmail loading
        return true;
    }

    console.log('AI Email Assistant: Could not find Gmail compose button');
    return false;
}

// Fill the compose window with email data
function fillComposeWindow(emailData) {
    const { recipient, subject, content } = emailData;
    
    console.log('AI Email Assistant: Filling compose window with data:', emailData);
    
    // Fill recipient field with more comprehensive selectors
    const recipientSelectors = [
        'input[aria-label="To"]',
        'input[aria-label*="To"]',
        'textarea[aria-label="To"]',
        'textarea[aria-label*="To"]',
        '.vO input',
        '.vO textarea',
        '.vO .aXjCH',
        'input[name="to"]',
        'textarea[name="to"]',
        '.oj input',
        '.oj textarea',
        '[data-hovercard-id="compose-to"] input',
        '[data-hovercard-id="compose-to"] textarea',
        '.aoD input',
        '.aoD textarea'
    ];
    
    let recipientFilled = false;
    for (const selector of recipientSelectors) {
        const recipientField = document.querySelector(selector);
        if (recipientField && recipientField.offsetParent !== null) {
            console.log('AI Email Assistant: Found recipient field with selector:', selector);
            recipientField.focus();
            
            // Try different methods to set the value
            recipientField.value = recipient;
            recipientField.textContent = recipient;
            recipientField.innerText = recipient;
            
            // Trigger comprehensive events to notify Gmail
            recipientField.dispatchEvent(new Event('focus', { bubbles: true }));
            recipientField.dispatchEvent(new Event('input', { bubbles: true }));
            recipientField.dispatchEvent(new Event('change', { bubbles: true }));
            recipientField.dispatchEvent(new Event('blur', { bubbles: true }));
            recipientField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            recipientField.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab', bubbles: true }));
            
            recipientFilled = true;
            console.log('AI Email Assistant: Recipient field filled successfully');
            break;
        }
    }
    
    if (!recipientFilled) {
        console.warn('AI Email Assistant: Could not find recipient field');
    }
    
    // Fill subject field with improved selectors
    const subjectSelectors = [
        'input[aria-label="Subject"]',
        'input[aria-label*="Subject"]',
        'input[name="subjectbox"]',
        '.aoT input',
        '.aoT textarea',
        '[data-hovercard-id="compose-subject"] input',
        'input[placeholder*="Subject"]',
        'input[placeholder*="subject"]'
    ];
    
    let subjectFilled = false;
    for (const selector of subjectSelectors) {
        const subjectField = document.querySelector(selector);
        if (subjectField && subjectField.offsetParent !== null) {
            console.log('AI Email Assistant: Found subject field with selector:', selector);
            subjectField.focus();
            subjectField.value = subject;
            
            // Trigger events to notify Gmail
            subjectField.dispatchEvent(new Event('focus', { bubbles: true }));
            subjectField.dispatchEvent(new Event('input', { bubbles: true }));
            subjectField.dispatchEvent(new Event('change', { bubbles: true }));
            subjectField.dispatchEvent(new Event('blur', { bubbles: true }));
            
            subjectFilled = true;
            console.log('AI Email Assistant: Subject field filled successfully');
            break;
        }
    }
    
    if (!subjectFilled) {
        console.warn('AI Email Assistant: Could not find subject field');
    }
    
    // Fill email content with improved selectors and handling
    const contentSelectors = [
        'div[aria-label="Message Body"]',
        'div[aria-label*="Message Body"]',
        '.Am.Al.editable',
        '.editable[contenteditable="true"]',
        '.yk .yk.Ak .editable',
        'div[contenteditable="true"][aria-label]',
        'div[contenteditable="true"]',
        '.Ar.Au .editable',
        '.editable'
    ];
    
    let contentFilled = false;
    for (const selector of contentSelectors) {
        const contentField = document.querySelector(selector);
        if (contentField && contentField.offsetParent !== null) {
            console.log('AI Email Assistant: Found content field with selector:', selector);
            contentField.focus();
            contentField.innerHTML = content.replace(/\n/g, '<br>');
            
            // Trigger comprehensive events to notify Gmail
            contentField.dispatchEvent(new Event('focus', { bubbles: true }));
            contentField.dispatchEvent(new Event('input', { bubbles: true }));
            contentField.dispatchEvent(new Event('change', { bubbles: true }));
            contentField.dispatchEvent(new Event('blur', { bubbles: true }));
            
            contentFilled = true;
            console.log('AI Email Assistant: Content field filled successfully');
            break;
        }
    }
    
    if (!contentFilled) {
        console.warn('AI Email Assistant: Could not find content field');
    }
    
    console.log('AI Email Assistant: Compose window filled with email data');
}

// Listen for messages from sidebar
window.addEventListener('message', (event) => {
    // Check if sidebarIframe exists and is ready before processing messages
    if (!sidebarIframe || !isSidebarReady || !sidebarIframe.contentWindow || event.source !== sidebarIframe.contentWindow) {
        return;
    }

    switch (event.data.type) {
        case 'REQUEST_EMAIL_CONTENT':
            const emailContent = getEmailContent();
            if (sidebarIframe && sidebarIframe.contentWindow && isSidebarReady) {
                sidebarIframe.contentWindow.postMessage({
                    type: 'EMAIL_CONTENT',
                    content: emailContent
                }, '*');
            }
            break;

        case 'INSERT_REPLY':
            insertReplyToGmail(event.data.content);
            break;

        case 'COMPOSE_EMAIL':
            composeEmailInGmail(event.data.data);
            break;
    }
});

// Observer to detect when emails are opened/changed
function setupEmailObserver() {
    const observer = new MutationObserver((mutations) => {
        let emailChanged = false;
        
        mutations.forEach((mutation) => {
            // Check if email content changed
            if (mutation.target.matches && 
                (mutation.target.matches('.nH') || 
                 mutation.target.matches('[data-message-id]') ||
                 mutation.target.matches('.ii.gt'))) {
                emailChanged = true;
            }
        });

        if (emailChanged && sidebarIframe && isSidebarReady) {
            // Notify sidebar about email change
            setTimeout(() => {
                const emailContent = getEmailContent();
                if (sidebarIframe && sidebarIframe.contentWindow && isSidebarReady) {
                    sidebarIframe.contentWindow.postMessage({
                        type: 'EMAIL_CONTENT',
                        content: emailContent
                    }, '*');
                }
            }, 500); // Small delay to ensure content is loaded
        }
    });

    // Observe changes in the main Gmail container
    const gmailContainer = document.querySelector('.nH') || document.body;
    observer.observe(gmailContainer, {
        childList: true,
        subtree: true,
        attributes: true
    });
}

// Initialize the extension
async function initialize() {
    if (!isGmail()) {
        console.log('AI Email Assistant: Not on Gmail');
        return;
    }

    console.log('AI Email Assistant: Initializing...');
    
    try {
        await waitForGmail();
        createSidebar();
        setupEmailObserver();
        console.log('AI Email Assistant: Successfully initialized');
    } catch (error) {
        console.error('AI Email Assistant: Initialization failed', error);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
