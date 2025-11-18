// HARDCODED SETTINGS - Update these with your values
const SPREADSHEET_ID = '1mi5Qg4rxOK7bvbFrGG8pYjwwjIFNSmdI0JDIDgdlcbs';  // Replace with your actual Spreadsheet ID
const SHEET_NAME = 'Summer 2026 Internship Applications';  // Change if your sheet has a different name

// Show preview on popup open
window.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'getData' }, (response) => {
    if (response && response.data) {
      const [timestamp, jobTitle, company, url] = response.data;
      const previewEl = document.getElementById('preview');
      previewEl.style.display = 'block';
      previewEl.innerHTML = `
        <strong>Job Title:</strong> ${jobTitle}
        <strong>Company:</strong> ${company}
        <strong>URL:</strong> ${url}
      `;
    }
  });
});

// Save data to sheets
document.getElementById('saveData').addEventListener('click', async () => {
  showStatus('Saving...', '');
  
  // Get data from current page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'getData' }, async (response) => {
    if (!response) {
      showStatus('Could not get page data', 'error');
      return;
    }

    try {
      await appendToSheet(SPREADSHEET_ID, SHEET_NAME, response.data);
      showStatus('✅ Added to spreadsheet!', 'success');
    } catch (err) {
      showStatus('❌ Error: ' + err.message, 'error');
    }
  });
});

async function appendToSheet(spreadsheetId, sheetName, data) {
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });

  const range = `${sheetName}!A:Z`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [data]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type;
}