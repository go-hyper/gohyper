'use strict';

chrome.browserAction.setBadgeText({
  // TODO: e.g. show how many quotes are on the current site
  text: '1'
});

chrome.browserAction.setBadgeBackgroundColor({
  color: '#0D47A1'
});

// set up context menu at install time
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "title": 'Add "%s" to GoHyper',
    "contexts": ["selection"],
    "id": "GoHyper1"
  });
});

// chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === "GoHyper1") {
    var quote = info.selectionText;
    var currentUrl = info.currentUrl;
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

// create and open database
var request = window.indexedDB.open("GoHyper");





