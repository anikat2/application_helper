// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    const data = extractPageData();
    sendResponse({ data });
  }
  return true;
});

function extractPageData() {
  // Customize this function to extract the data you need
  const timestamp = new Date().toISOString();
  const url = window.location.href;
  const title = document.title;
  
  // Example: extract some meta information
  const description = document.querySelector('meta[name="description"]')?.content || '';
  
  // Example: extract first heading
  const heading = document.querySelector('h1')?.textContent || '';
  
  // Return as array (will be a row in the spreadsheet)
  return [
    timestamp,
    url,
    title,
    heading,
    description
  ];
}