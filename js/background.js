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
    "title": 'Add "%s" to your notepad',
    "contexts": ["selection"],
    "id": "1"
  });
});

// chrome.contextMenus.onClicked.addListener(onClickHandler);
chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === "1") {
    var quote = info.selectionText;
    // TODO
  }
});

/*chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({'url': ''}, (tabs) => {
    if (tabs.length === 0) {
      // There is no tab
      chrome.tabs.create({'url': '', 'active': true});
    } else {
      // Do something here...
    }
  });
});
*/

// is called onload in the popup code
function getPageDetails(callback) {
    // injects content script into current page
    chrome.tabs.executeScript(null, { file: 'js/content.js' });
    // perform the callback when a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message) {
      callback(message);
    });
};
