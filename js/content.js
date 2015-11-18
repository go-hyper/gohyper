// send a message containing the page details back to the event/background page
chrome.runtime.sendMessage({
  'title': document.title,
  'currentUrl': window.location.href,
  'quote': window.getSelection().toString()
});

// wait for messages from event/background page belonging to context menu's onclick events
chrome.runtime.onMessage.addListener(function(message, sender) {
  // TODO
  console.log(message);
})