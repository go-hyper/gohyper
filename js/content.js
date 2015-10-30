// Send a message containing the page details back to the event page
chrome.runtime.sendMessage({
  'title': document.title,
  'currentUrl': window.location.href,
  'quote': window.getSelection().toString()
});
