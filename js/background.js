'use strict';

chrome.browserAction.setBadgeText({
  text: 'Test'
});

chrome.browserAction.setBadgeBackgroundColor({
  color: '#0091EA'
});

// set up context menu at install time
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "title": 'Add "%s" to your Notepad',
    "contexts": ["selection"],
    "id": "GoHyper1"
  });
});

// chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === "GoHyper1") {
    var quote = info.selectionText;
    // TODO
  }
});

// is called onload in the popup code
function getPageDetails(callback) {
    // injects content script into current page
    chrome.tabs.executeScript(null, { file: 'js/content.js' });
    // perform the callback when a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message) {
      callback(message);
    });
};
