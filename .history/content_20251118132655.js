// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getData") {
    const data = extractPageData();
    sendResponse({ data });
  }
  return true;
});

// Extract company name from URL (more reliable than scraping the DOM)
function extractCompanyFromURL(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    // Example: boards.greenhouse.io/databricks → want "databricks", not "boards"
    const parts = hostname.split(".");

    // Ignore TLD and job-board hostnames
    const blacklist = ["boards", "jobs", "careers", "apply", "workday", "lever", "greenhouse"];

    for (let part of parts) {
      if (!blacklist.includes(part.toLowerCase())) {
        return capitalize(part);
      }
    }

    return ""; // fallback
  } catch (e) {
    return "";
  }
}

// Capitalize helper
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// MAIN extraction function
function extractPageData() {
  const timestamp = new Date().toISOString();
  const url = window.location.href;

  let jobTitle = "";
  let company = "";

  //
  // JOB TITLE EXTRACTION (your original logic)
  //

  if (url.includes("linkedin.com")) {
    jobTitle =
      document.querySelector(".top-card-layout__title")?.textContent?.trim() ||
      document.querySelector("h1.t-24")?.textContent?.trim() ||
      "";
  } else if (url.includes("indeed.com")) {
    jobTitle =
      document.querySelector('[class*="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
      document.querySelector("h1.icl-u-xs-mb--xs")?.textContent?.trim() ||
      "";
  } else if (url.includes("greenhouse.io") || url.includes("boards.greenhouse.io")) {
    jobTitle =
      document.querySelector(".app-title")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() ||
      "";
  } else if (url.includes("lever.co")) {
    jobTitle =
      document.querySelector(".posting-headline h2")?.textContent?.trim() ||
      document.querySelector("h2")?.textContent?.trim() ||
      "";
  } else if (url.includes("myworkdayjobs.com")) {
    jobTitle =
      document.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ||
      document.querySelector("h2[title]")?.getAttribute("title") ||
      "";
  } else {
    // Generic fallback
    jobTitle =
      document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
      document.querySelector('[class*="position"]')?.textContent?.trim() ||
      "";
  }

  //
  // COMPANY EXTRACTION → from URL ONLY
  //

  company = extractCompanyFromURL(url);

  //
  // Cleanup
  //
  jobTitle = jobTitle.replace(/\s+/g, " ").trim();
  company = company.replace(/\s+/g, " ").trim();

  return [
    timestamp,
    jobTitle || "Could not extract job title",
    company || "Could not extract company",
    url
  ];
}
