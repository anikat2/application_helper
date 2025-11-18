// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    const data = extractPageData();
    sendResponse({ data });
  }
  return true;
});

function extractPageData() {
  const timestamp = new Date().toISOString();
  const url = window.location.href;
  
  let jobTitle = '';
  let company = '';
  
  // LinkedIn
  if (url.includes('linkedin.com')) {
    jobTitle = document.querySelector('.top-card-layout__title')?.textContent?.trim() ||
               document.querySelector('h1.t-24')?.textContent?.trim() || '';
    company = document.querySelector('.topcard__org-name-link')?.textContent?.trim() ||
              document.querySelector('.top-card-layout__card a')?.textContent?.trim() || '';
  }
  
  // Indeed
  else if (url.includes('indeed.com')) {
    jobTitle = document.querySelector('[class*="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
               document.querySelector('h1.icl-u-xs-mb--xs')?.textContent?.trim() || '';
    company = document.querySelector('[data-company-name="true"]')?.textContent?.trim() ||
              document.querySelector('[class*="jobsearch-InlineCompanyRating"] a')?.textContent?.trim() || '';
  }
  
  // Greenhouse
  else if (url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
    jobTitle = document.querySelector('.app-title')?.textContent?.trim() ||
               document.querySelector('h1')?.textContent?.trim() || '';
    company = document.querySelector('.company-name')?.textContent?.trim() ||
              document.querySelector('header a')?.textContent?.trim() || '';
  }
  
  // Lever
  else if (url.includes('lever.co')) {
    jobTitle = document.querySelector('.posting-headline h2')?.textContent?.trim() ||
               document.querySelector('h2')?.textContent?.trim() || '';
    company = document.querySelector('.main-header-text a')?.textContent?.trim() ||
              document.querySelector('.posting-headline')?.textContent?.split('-')[0]?.trim() || '';
  }
  
  // Workday
  else if (url.includes('myworkdayjobs.com')) {
    jobTitle = document.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ||
               document.querySelector('h2[title]')?.getAttribute('title') || '';
    company = document.querySelector('[data-automation-id="company"]')?.textContent?.trim() || '';
  }
  
  // Generic fallback - try common patterns
  else {
    jobTitle = document.querySelector('h1')?.textContent?.trim() ||
               document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
               document.querySelector('[class*="position"]')?.textContent?.trim() || '';
    
    company = document.querySelector('[class*="company"]')?.textContent?.trim() ||
              document.querySelector('[class*="employer"]')?.textContent?.trim() ||
              document.querySelector('[class*="organization"]')?.textContent?.trim() || '';
  }
  
  // Clean up extracted text
  jobTitle = jobTitle.replace(/\s+/g, ' ').trim();
  company = company.replace(/\s+/g, ' ').trim();
  
  // Return as array (columns: Timestamp, Job Title, Company, URL)
  return [
    timestamp,
    jobTitle || 'Could not extract job title',
    company || 'Could not extract company',
    url
  ];
}