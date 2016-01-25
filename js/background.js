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
  objStore.createIndex('by_quote', 'quote', {unique: false});
  objStore.createIndex('by_current_url', 'currentUrl', {unique: false});
  objStore.createIndex('by_hyperlink', 'hyperlinks', {unique: false, multiEntry: true});
  objStore.createIndex('by_tag', 'tags', {unique: false, multiEntry: true});
  objStore.createIndex('by_create_timestamp', 'createTimestamp', {unique: true});
  objStore.createIndex('by_update_timestamp', 'updateTimestamp', {unique: true});
};

// database exists already
request.onsuccess = function() {
  db = request.result;
}

// CRUD operations
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.subject) {

// create a new quote: add
    case 'addQuote':
      var newQuote = {
        title: message.title,
        currentUrl: message.currentUrl,
        quote: message.quote,
        quoteLocation: message.quoteLocation,
        tags: message.tags,
        comment: message.comment,
        hyperlinks: message.hyperlinks,
        createTimestamp: message.createTimestamp,
        updateTimestamp: message.updateTimestamp
      };
      // open a read and write database transaction
      var transaction = db.transaction(['quotes'], 'readwrite');
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
      var request = store.add(newQuote);
      request.onsuccess = function(event) {
        newQuote.id = request.result;
        updateBadge();
        // highlight selected text: call function in content.js
        chrome.tabs.sendMessage(sender.tab.id, {
          'subject': 'highlightText',
          'data': [newQuote]
        });
      }
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
      var transaction = db.transaction(['quotes'], 'readonly');
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
        }
      };
      return true;

// read: get all quotes sorted
    case 'getAll':
      var quotes = [];
      var transaction = db.transaction(['quotes'], 'readonly');
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
      var store = transaction.objectStore('quotes');
      switch (message.sortBy) {

        case 'timestampOF':
          store.index('by_update_timestamp').openCursor(null, 'next').onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              quotes.push(cursor.value);
              cursor.continue();
            }
          };

        case 'quoteAZ':
          store.index('by_quote').openCursor(null, 'next').onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              quotes.push(cursor.value);
              cursor.continue();
            }
          };

        case 'quoteZA':
          store.index('by_quote').openCursor(null, 'prev').onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              quotes.push(cursor.value);
              cursor.continue();
            }
          };

        default:
          store.index('by_update_timestamp').openCursor(null, 'prev').onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              quotes.push(cursor.value);
              cursor.continue();
            }
          };
      }
      return true;


// read: find a quote by ID
    case 'findOneById':
      var id = message.id;
      var transaction = db.transaction(['quotes'], 'readonly');
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quote});
      };
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };
      var store = transaction.objectStore('quotes');
      var request = store.get(id);
      var quote = [];
      request.onsuccess = function(event) {
        quote.push(request.result);
      }
      return true;

// read: search in quotes for tag
    case 'search':
      var transaction = db.transaction(['quotes'], 'readonly');
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quote});
      };
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };
      var store = transaction.objectStore('quotes');
      var index = store.index('by_tag');

      var singleKeyRange = IDBKeyRange.only(message.input);
      var quote = [];
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          quote.push(cursor.value);
          cursor.continue();
        }
      };
      return true;

// update
    case 'updateQuote':
      var quote = message.quote;
      var transaction = db.transaction(['quotes'], 'readwrite');
      // response to sender (gohyper.js)
      transaction.oncomplete = function(event) {
        sendResponse({status: 'success'});
      };
      transaction.onerror = function(event) {
        sendResponse({status: 'error'});
      };
      var store = transaction.objectStore('quotes');
      var request = store.put(quote);
      return true;

// delete
    case 'deleteQuote':
      var id = message.id;
      var transaction = db.transaction(['quotes'], 'readwrite');
      transaction.oncomplete = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'success', data: quotes});
        // remove highlight: send message to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          'subject': 'deserializeQuote',
          'quoteId': id
        });
      };
      transaction.onerror = function(event) {
        // response to sender (gohyper.js)
        sendResponse({status: 'error'});
      };
      var store = transaction.objectStore('quotes');
      var request = store.delete(id);
      request.onsuccess = function(event) {
        updateBadge();
      };
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
    case 'quoteOnClick':
      chrome.tabs.sendMessage(sender.tab.id, {
        'subject': 'quoteOnClick',
        'data': message.data
      });
      break;
  }
});

function updateBadge() {
  // get active tab on current window
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    if (tab !== undefined && tab.url !== undefined) {
      // get url of active tab
      var currentUrl = tab.url;

      // search and show how many quotes exist on active tab and update badge
      // get database connection
      var request  = indexedDB.open('GoHyper');
      request.onsuccess = function() {
        var db = request.result;
        var store = db.transaction(['quotes'], 'readonly').objectStore('quotes');

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
    }
  });
}

// set extension 'active': use blue instead of gray icon
function setBlueIcon(tabId) {
  chrome.browserAction.setIcon({
    path: {
      '19': 'images/icon-19.png',
      '38': 'images/icon-38.png'
    },
    tabId: tabId
  });
}

// fires when tab is updated
chrome.tabs.onUpdated.addListener(function(sender) {
  // checks if content script is active (e.g. it is not injected in PDFs)
  chrome.tabs.sendMessage(sender, {
    'subject': 'checkActive'
  }, function(response) {
    if (response !== undefined && response.status === 'success') {
      setBlueIcon(sender);
      updateBadge();
    } else {
      // TODO handle no response or other response.status
    }
  });
});

// fires when active tab changes
chrome.tabs.onActivated.addListener(function(sender) {
  var tabId = sender.tabId;
  // checks if content script is active (e.g. it is not injected in PDFs)
  chrome.tabs.sendMessage(tabId, {
    'subject': 'checkActive'
  }, function(response) {
    if (response !== undefined && response.status === 'success') {
      setBlueIcon(tabId);
    } else {
      // TODO handle no response or other response.status
    }
    updateBadge();
  });
});

chrome.browserAction.setBadgeBackgroundColor({
  color: '#448AFF'
});

// set up context menu at install time
chrome.runtime.onInstalled.addListener(function(sender) {
  chrome.contextMenus.create({
    'title': 'Add "%s" to GoHyper',
    'contexts': ['selection'],
    'id': 'GoHyper1',
    'documentUrlPatterns': ['http://*/*', 'https://*/*']
  });
});

// detect click on context menu item
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

// detect click on GoHyper icon in toolbar
chrome.browserAction.onClicked.addListener(function(activeTab) {
  chrome.tabs.sendMessage(activeTab.id, {
    'subject': 'iconOnclick'
  });
});
