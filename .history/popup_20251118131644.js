// Load saved settings
chrome.storage.sync.get(['spreadsheetId', 'sheetName'], (result) => {
  if (result.spreadsheetId) {
    document.getElementById('spreadsheetId').value = result.spreadsheetId;
  }
  if (result.sheetName) {
    document.getElementById('sheetName').value = result.sheetName;
  }
});

// Authorize with Google
document.getElementById('authorize').addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      showStatus('Authorization failed: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    showStatus('Authorization successful!', 'success');
  });
});

// Save data to sheets
document.getElementById('saveData').addEventListener('click', async () => {
  const spreadsheetId = document.getElementById('spreadsheetId').value;
  const sheetName = document.getElementById('sheetName').value;

  if (!spreadsheetId || !sheetName) {
    showStatus('Please fill in Spreadsheet ID and Sheet Name', 'error');
    return;
  }

  // Save settings
  chrome.storage.sync.set({ spreadsheetId, sheetName });

  // Get data from current page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'getData' }, async (response) => {
    if (!response) {
      showStatus('Could not get page data', 'error');
      return;
    }

    try {
      await appendToSheet(spreadsheetId, sheetName, response.data);
      showStatus('Data saved successfully!', 'success');
    } catch (err) {
      showStatus('Error: ' + err.message, 'error');
    }
  });
});

async function appendToSheet(spreadsheetId, sheetName, data) {
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
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
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type;
}