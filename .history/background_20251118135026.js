require('dotenv').config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'signOut') {
    chrome.identity.clearAllCachedAuthTokens(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getToken") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      sendResponse({ token, clientId: GOOGLE_CLIENT_ID });
    });
    return true;
  }
});
