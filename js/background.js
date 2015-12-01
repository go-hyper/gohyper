'use strict';

/*
    Database initialization and CRUD operations
*/

// init for first use
var request = window.indexedDB.open('GoHyper');
var db;

// database didn't exist before: create object store and indices
request.onupgradeneeded = function() {
  db = request.result;
  // create an objectStore for this database
  var objStore = db.createObjectStore('quotes', {keyPath: 'id', autoIncrement: true});
  objStore.createIndex('by_title', 'title', {unique: false});
  objStore.createIndex('by_current_url', 'currentUrl', {unique: false});
  objStore.createIndex('by_hyperlinks', 'hyperlinks', {unique: false, multiEntry: true});
  objStore.createIndex('by_create_timestamp', 'createTimestamp', {unique: true});
  objStore.createIndex('by_update_timestamp', 'updateTimestamp', {unique: true});
};

request.onsuccess = function() {
  db = request.result;
}

// CRUD
chrome.runtime.onMessage.addListener(function(message) {
  switch(message.subject) {
    // create
    case 'addQuote':
      var newQuote = [{
        title: message.title,
        currentUrl: message.currentUrl,
        quote: message.quote,
        quoteLocation: message.quoteLocation,
        tags: message.tags,
        comment: message.comment,
        hyperlinks: message.hyperlinks,
        createTimestamp: message.createTimestamp,
        updateTimestamp: message.updateTimestamp
      }];

      // open a read and write database transaction
      var transaction = db.transaction('quotes', 'readwrite');

      transaction.oncomplete = function(event) {
        console.log('successful transaction' + new Date().toISOString());
      };

      transaction.onerror = function(event) {
        console.log('error in transaction');
      };

      // create an object store on the transaction
      var store = transaction.objectStore('quotes');

      // add new quote to the object store
      var addRequest = store.add(newQuote[0]);

      addRequest.onsuccess = function(event) {
        console.log('successful create' + new Date().toISOString());
      };

/*
      // TODO message/response to gohyper.js
      chrome.tabs.sendMessage({
        'tabid': tabId, // TODO
        'subject': 'addQuote',
        'response': 'success'
      });

      chrome.tabs.sendMessage({
        'tabid': tabId, // TODO
        'subject': 'addQuote',
        'response': 'error'
      });
*/
      break;

    // read
    case 'getQuotes':
      console.log(message);
      // TODO read/get quote(s)
      break;

    // update
    case 'updateQuote':
      console.log(message);
      // TODO update quote in db
      break;

    // delete
    case 'deleteQuote':
      console.log(message);
      // TODO delete quote in db
      break;
  }
});


/*
    Functions that run in background (badge, context menu)
*/

function updateBadge() {
  // get active tab on current window
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    // get url of active tab
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

// fires when tab is updated
chrome.tabs.onUpdated.addListener(updateBadge);

// fires when active tab changes
chrome.tabs.onActivated.addListener(updateBadge);

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

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "GoHyper1") {
    var quote = info.selectionText;
    var currentUrl = info.currentUrl;
    // send message to content script
    // TODO
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
  }
});


// is called onload in the gohyper.js code
function getPageDetails(callback) {
  // inject content script into current page
  // chrome.tabs.executeScript(null, {file: 'js/content.js'});
  // perform the callback when a message is received from the content script
  chrome.runtime.onMessage.addListener(function(message) {
    callback(message);
  });
};
