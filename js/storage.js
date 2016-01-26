'use strict';

/*
    Database (IndexedDB) initialization and CRUD operations
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

// create a new quote: add
function addQuote(newQuote, callback) {
  // open a read and write database transaction
  var transaction = db.transaction(['quotes'], 'readwrite');
  // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
  var newId;
  // successful transaction
  transaction.oncomplete = function(event) {
    // response to caller of addQuote function
    callback(undefined, newId);
  };
  // error in transaction
  transaction.onerror = function(event) {
    // response to caller of addQuote function
    callback(new Error('Could not save'));
  };
  // create an object store on the transaction
  var store = transaction.objectStore('quotes');
  // add new quote to the object store
  var request = store.add(newQuote);
  request.onsuccess = function() {
    newId = request.result;
  }
}

// read: get quotes filtered by current url
function getQuotes(sender, callback) {
  var currentUrl = sender.tab.url;
  // open a read database transaction
  var transaction = db.transaction(['quotes'], 'readonly');
  // see note in add section of http://www.w3.org/TR/IndexedDB/#idl-def-IDBObjectStore
  transaction.oncomplete = function(event) {
    callback(undefined, {data: quotes});
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not get quotes for: ' + currentUrl));
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
}

// read: get all quotes sorted
function getAll(message, callback) {
  var quotes = [];
  var transaction = db.transaction(['quotes'], 'readonly');
  transaction.oncomplete = function(event) {
    callback(undefined, {data: quotes});
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not get all quotes sorted by: ' + message.sortBy));
  };
  var store = transaction.objectStore('quotes');
  switch(message.sortBy) {
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
}

// read: find a quote by ID
function findOneById(message, callback) {
  var id = message.id;
  var transaction = db.transaction(['quotes'], 'readonly');
  transaction.oncomplete = function(event) {
    callback(undefined, {data: quote});
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not find quote with id: ' + id));
  };
  var store = transaction.objectStore('quotes');
  var request = store.get(id);
  var quote = [];
  request.onsuccess = function(event) {
    quote.push(request.result);
  }
}

// read: search in quotes for tag
function searchForTag(message, callback) {
  var transaction = db.transaction(['quotes'], 'readonly');
  transaction.oncomplete = function(event) {
    callback(undefined, {data: quotes});
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not get all quotes with tag: ' + message.input));
  };
  var store = transaction.objectStore('quotes');
  var index = store.index('by_tag');
  var singleKeyRange = IDBKeyRange.only(message.input);
  var quotes = [];
  index.openCursor(singleKeyRange).onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      quotes.push(cursor.value);
      cursor.continue();
    }
  };
}

// update
function updateQuote(message, callback) {
  var quote = message.quote;
  var transaction = db.transaction(['quotes'], 'readwrite');
  transaction.oncomplete = function(event) {
    callback(undefined);
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not update quote with id: ' + quote.id));
  };
  var store = transaction.objectStore('quotes');
  var request = store.put(quote);
}

// delete
function deleteQuote(message, callback) {
  var id = message.id;
  var transaction = db.transaction(['quotes'], 'readwrite');
  transaction.oncomplete = function(event) {
    callback(undefined);
  };
  transaction.onerror = function(event) {
    callback(new Error('Could not delete quote with id: ' + id));
  };
  var store = transaction.objectStore('quotes');
  var request = store.delete(id);
}
