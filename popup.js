// Popup script for AI Email Assistant
document.addEventListener('DOMContentLoaded', () => {
    const openGmailBtn = document.getElementById('open-gmail');
    const showHelpBtn = document.getElementById('show-help');

    // Open Gmail button
    openGmailBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://mail.google.com' });
        window.close();
    });

    // Show help button
    showHelpBtn.addEventListener('click', () => {
        showInstructions();
    });

    // Check if we're already on Gmail
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab.url && currentTab.url.includes('mail.google.com')) {
            updateUIForGmail();
        }
    });
});

function updateUIForGmail() {
    const openGmailBtn = document.getElementById('open-gmail');
    openGmailBtn.textContent = '🎯 Toggle Sidebar';
    openGmailBtn.onclick = () => {
        // Send message to content script to toggle sidebar
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_SIDEBAR' });
            window.close();
        });
    };
}

function showInstructions() {
    const content = document.querySelector('.content');
    content.innerHTML = `
        <div style="padding: 0;">
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px;">📖 How to Use</h3>
                
                <div style="space-y: 12px;">
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 13px; font-weight: 500; color: #4f46e5; margin-bottom: 4px;">1. Open Gmail</div>
                        <div style="font-size: 12px; color: #6b7280;">Go to gmail.com and look for the AI Assistant button in the toolbar</div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 13px; font-weight: 500; color: #4f46e5; margin-bottom: 4px;">2. Toggle Sidebar</div>
                        <div style="font-size: 12px; color: #6b7280;">Click the toggle button to open the AI assistant sidebar</div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 13px; font-weight: 500; color: #4f46e5; margin-bottom: 4px;">3. Compose Emails</div>
                        <div style="font-size: 12px; color: #6b7280;">Use the Compose tab to generate new emails with AI</div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="font-size: 13px; font-weight: 500; color: #4f46e5; margin-bottom: 4px;">4. Reply to Emails</div>
                        <div style="font-size: 12px; color: #6b7280;">Use the Reply tab to generate intelligent responses</div>
                    </div>
                </div>
            </div>
            
            <button id="back-btn" style="width: 100%; padding: 10px; border: none; border-radius: 8px; background: #4f46e5; color: white; font-size: 13px; font-weight: 500; cursor: pointer;">
                ← Back to Main
            </button>
        </div>
    `;

    // Add back button functionality
    document.getElementById('back-btn').addEventListener('click', () => {
        location.reload();
    });
}
