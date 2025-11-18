function extractPageData() {
  return [
    new Date().toISOString(),
    window.location.href,
    document.title,
    // Add your custom selectors:
    document.querySelector('.price')?.textContent,
    document.querySelector('.product-name')?.textContent
  ];
}