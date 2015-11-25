'use strict';

rangy.init();

// send a message containing the page details back to the event/background page
chrome.runtime.sendMessage({
  'title': document.title,
  'currentUrl': window.location.href,
  'quote': window.getSelection().toString()
});

// http://stackoverflow.com/questions/3223682/change-css-of-selected-text-using-javascript
function makeEditableAndHighlight(colour) {
  var range, sel = window.getSelection();
  if (sel.rangeCount && sel.getRangeAt) {
    range = sel.getRangeAt(0);
  }
  document.designMode = "on";
  if (range) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  // Use HiliteColor since some browsers apply BackColor to the whole block
  if (!document.execCommand("HiliteColor", false, colour)) {
    document.execCommand("BackColor", false, colour);
  }
  document.designMode = "off";
}

// wait for messages from event/background page belonging to context menu's onclick events
chrome.runtime.onMessage.addListener(function(message, sender) {
  makeEditableAndHighlight("yellow");
  var sel = rangy.getSelection();
  // TODO
  console.log(sel);
});