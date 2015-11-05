// called when the content script has been injected and returned results
function onPageDetailsReceived(pageDetails) {
  document.getElementById('title').value = pageDetails.title;
  document.getElementById('currentUrl').value = pageDetails.currentUrl;
  document.getElementById('quote').innerText = pageDetails.quote;
}

// when popup HTML has loaded
window.addEventListener('load', function() {
  // get event page
  chrome.runtime.getBackgroundPage(function(eventPage) {
    // injects content.js into current tab's HTML
    eventPage.getPageDetails(onPageDetailsReceived);
  });
});

