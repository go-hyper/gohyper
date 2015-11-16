'use strict';

function updateBadge() {
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    var currentUrl = tab.url;

    // search and show how many quotes exist on active tab and update badge
    // get database connection
    var request  = indexedDB.open("GoHyper");
    request.onsuccess = function() {
      var db = request.result;
      var store = db.transaction("quotes", "readonly").objectStore("quotes");

      var index = store.index("by_current_url");
      var singleKeyRange = IDBKeyRange.only(currentUrl);

      // count all quotes on active tab
      var quotes = [];
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quotes.push(cursor.value);
          cursor.continue();
        } else {
          // update badge text
          if (quotes.length) {
            chrome.browserAction.setBadgeText({
              text: quotes.length.toString()
            });
          } else {
            chrome.browserAction.setBadgeText({
              text: ''
            });
          }
        }
      };

    };
  });
}


chrome.tabs.onUpdated.addListener(function(info) {
  chrome.tabs.get(info.tabId, function(tab) {
    var currentUrl = tab.url;

    // search and show how many quotes exist on active tab and update badge
    // get database connection
    var request  = indexedDB.open("GoHyper");
    request.onsuccess = function() {
      var db = request.result;
      var store = db.transaction("quotes", "readonly").objectStore("quotes");

      var index = store.index("by_current_url");
      var singleKeyRange = IDBKeyRange.only(currentUrl);

      // count all quotes on active tab
      var quotes = [];
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quotes.push(cursor.value);
          cursor.continue();
        } else {
          // update badge text
          if (quotes.length) {
            chrome.browserAction.setBadgeText({
              text: quotes.length.toString()
            });
          } else {
            chrome.browserAction.setBadgeText({
              text: ''
            });
          }
        }
      };

    };
  });
});


// get current URL of active tab
chrome.tabs.onActivated.addListener(function(info) {
  chrome.tabs.get(info.tabId, function(tab) {
    var currentUrl = tab.url;

    // search and show how many quotes exist on active tab and update badge
    // get database connection
    var request  = indexedDB.open("GoHyper");
    request.onsuccess = function() {
      var db = request.result;
      var store = db.transaction("quotes", "readonly").objectStore("quotes");

      var index = store.index("by_current_url");
      var singleKeyRange = IDBKeyRange.only(currentUrl);

      // count all quotes on active tab
      var quotes = [];
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quotes.push(cursor.value);
          cursor.continue();
        } else {
          // update badge text
          if (quotes.length) {
            chrome.browserAction.setBadgeText({
              text: quotes.length.toString()
            });
          } else {
            chrome.browserAction.setBadgeText({
              text: ''
            });
          }
        }
      };

    };
  });
});


chrome.browserAction.setBadgeBackgroundColor({
  color: '#000'
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
