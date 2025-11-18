// Background service worker
// Handles authentication and background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Optional: Remove cached token when user signs out
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'signOut') {
    chrome.identity.clearAllCachedAuthTokens(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});