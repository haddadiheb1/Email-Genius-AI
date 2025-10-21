// Background service worker
console.log('AI Email Assistant: Background service worker loaded');

// Simple installation handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('AI Email Assistant: Extension installed');
});

// Simple message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('AI Email Assistant: Message received:', message);
    sendResponse({ success: true });
    return true;
});

// Handle extension icon click to open Gmail
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes('mail.google.com')) {
        console.log('AI Email Assistant: Already on Gmail');
    } else {
        chrome.tabs.create({ url: 'https://mail.google.com' });
    }
});
