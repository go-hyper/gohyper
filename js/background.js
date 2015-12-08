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

// CRUD operations
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.subject) {

// create a new quote
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

      // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
      // successful transaction
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success'});
      };

      // error in transaction
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };

      // create an object store on the transaction
      var store = transaction.objectStore('quotes');

      // add new quote to the object store
      var addRequest = store.add(newQuote[0]);

      updateBadge();

      // highlight selected text (call function in content.js)
      chrome.tabs.sendMessage(sender.tab.id, {
        'subject': 'highlightText'
      });

      /*
      The callback "function becomes invalid when the event listener returns, unless you return true from the event listener to indicate
      you wish to send a response asynchronously (this will keep the message channel open to the other end until sendResponse is called)."
      (see https://developer.chrome.com/extensions/runtime#event-onMessage)
      */
      return true;

// read: get quotes filtered by current url
    case 'getQuotes':
      var currentUrl = sender.tab.url;
      // open a read database transaction
      var transaction = db.transaction('quotes', 'readonly');

      // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
      // successful transaction
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quotes});
      };

      // error in transaction
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };

      // create an object store on the transaction
      var store = transaction.objectStore('quotes');

      var quotes = [];

      // filter by currentUrl
      store.index('by_current_url').openCursor(IDBKeyRange.only(currentUrl)).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quotes.push(cursor.value);
          cursor.continue();
        } else {
          // TODO
        }
      };
      return true;

// getAll: get all quotes (needed to update links in typeahead input field)
    case 'getAll':
      // open a read database transaction
      var transaction = db.transaction('quotes', 'readonly');

      // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
      // successful transaction
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quotes});
      };

      // error in transaction
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };

      // create an object store on the transaction
      var store = transaction.objectStore('quotes');

      var quotes = [];

      store.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quotes.push(cursor.value);
          cursor.continue();
        } else {
          // TODO
        }
      };
      return true;

// findOneById TODO (improve code: better solution?)
    case 'findOneById':
      var id = message.id;
      var transaction = db.transaction('quotes', 'readonly');
      // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quote});
      };
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };
      var store = transaction.objectStore('quotes');
      var singleKeyRange = IDBKeyRange.only(id);
      var quote = [];
      store.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quote.push(cursor.value);
          cursor.continue();
        } else {
        }
      };
      return true;

// update
    case 'updateQuote':
      var quote = message.quote;
      var transaction = db.transaction('quotes', 'readwrite');
      var store = transaction.objectStore('quotes');
      var request = store.put(quote);
      // response to sender (gohyper.js)
      transaction.oncomplete = function(event) {
        sendResponse({status: 'success'});
      };
      transaction.onerror = function(event) {
        sendResponse({status: 'error'});
      };
      return true;

// delete
    case 'deleteQuote':
      var transaction = db.transaction('quotes', 'readwrite');
      var store = transaction.objectStore('quotes');
      var request = store.delete(message.id);
      updateBadge();

      // TODO better solution
      // code to get all quotes (after deletion)
      var currentUrl = sender.tab.url;
      // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
      // successful transaction
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quotes});
      };
      // error in transaction
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };
      // create an object store on the transaction
      var store = transaction.objectStore('quotes');
      var quotes = [];
      store.index('by_update_timestamp').openCursor(null, 'prev').onsuccess = function(event) {
        var cursor = event.target.result;
        // filter by currentUrl
        if (cursor) {
          if (cursor.value.currentUrl === currentUrl) {
            quotes.push(cursor.value);
          }
          cursor.continue();
        } else {
          // TODO
        }
      };

      chrome.tabs.sendMessage(sender.tab.id, {
        'subject': 'deserializeQuote'
      });

      return true;
  }
});


/*
    Functions that run in background belonging to click events, badge and context menu
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.subject) {

    case 'documentOnclick':
      chrome.tabs.sendMessage(sender.tab.id, {
        'subject': 'documentOnclick'
      });
      break;

    case 'buttonOnclick':
      chrome.tabs.sendMessage(sender.tab.id, {
        'subject': 'buttonOnclick'
      });
      break;
  }
});

function updateBadge() {
  // get active tab on current window
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    // get url of active tab
    var currentUrl = tab.url;

    // search and show how many quotes exist on active tab and update badge
    // get database connection
    var request  = indexedDB.open('GoHyper');
    request.onsuccess = function() {
      var db = request.result;
      var store = db.transaction('quotes', 'readonly').objectStore('quotes');

      var index = store.index('by_current_url');
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
    'title': 'Add "%s" to GoHyper',
    'contexts': ['selection'],
    'id': 'GoHyper1',
    'documentUrlPatterns': ['http://*/*', 'https://*/*']
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'GoHyper1') {
    // send message to content script
    chrome.tabs.sendMessage(tab.id, {
      'subject': 'initialQuoteData',
      'currentUrl': info.pageUrl,
      'quote': info.selectionText,
      'title': tab.title
    }, function(response) {
      chrome.tabs.sendMessage(tab.id, {
        'subject': response.subject, // 'quoteData'
        'currentUrl': response.currentUrl,
        'quote': response.quote,
        'title': response.title,
        'quoteLocation': response.quoteLocation
      });
    });
  }
});
