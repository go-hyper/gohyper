'use strict';

/*
    Listener for requests from gohyper.js regarding database operations.
    Database functions are located in the storage.js file.
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.subject) {
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
      addQuote(newQuote, function(error, newId) {
        if (error) {
          console.error(error);
          // response to sender (gohyper.js)
          return sendResponse({status: 'error'});
        }
        updateBadge();
        // highlight selected text: call function in content.js
        newQuote.id = newId;
        chrome.tabs.sendMessage(sender.tab.id, {
          'subject': 'highlightText',
          'data': [newQuote]
        });
        // response to sender (gohyper.js)
        sendResponse({status: 'success'});
      });
      /*
      The callback "function becomes invalid when the event listener returns, unless you return true from the event listener to indicate
      you wish to send a response asynchronously (this will keep the message channel open to the other end until sendResponse is called)."
      (see https://developer.chrome.com/extensions/runtime#event-onMessage)
      */
      return true;

    // get quotes filtered by current url
    case 'getQuotes':
      getQuotes(sender.tab.url, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        sendResponse({status: 'success', data: response.data});
      });
      return true;

    // get all quotes sorted
    case 'getAll':
      getAll(message, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        sendResponse({status: 'success', data: response.data});
      });
      return true;

    case 'findOneById':
      findOneById(message, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        sendResponse({status: 'success', data: response.data});
      });
      return true;

    // search in quotes for tag
    case 'search':
      searchForTag(message, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        sendResponse({status: 'success', data: response.data});
      });
      return true;

    case 'updateQuote':
      updateQuote(message, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        sendResponse({status: 'success'});
      });
      return true;

    case 'deleteQuote':
      deleteQuote(message, function(error, response) {
        if (error) {
          console.error(error);
          return sendResponse({status: 'error'});
        }
        updateBadge();
        // remove highlight: send message to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          'subject': 'deserializeQuote',
          'quoteId': message.id
        });
        sendResponse({status: 'success'});
      });
      return true;
  }
});


/*
    Functions that run in background belonging to click events, badge and context menu
*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // receice message from content script
  if (message.subject === 'quoteOnClick') {
    // send message to gohyper script (iframe)
    chrome.tabs.sendMessage(sender.tab.id, {
      'subject': 'quoteOnClick',
      'data': message.data
    });
  }
  if (message.subject === 'getQuotesNotFound') {
    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
      var tab = arrayOfTabs[0];
      if (tab !== undefined && tab.url !== undefined) {
        // get all quotes for current tab's url
        getQuotes(tab.url, function(error, response) {
          if (response.data) {
            // send message to content.js
            chrome.tabs.sendMessage(sender.tab.id, {
              'subject': 'tryDeserialization',
              'quotes': response.data
            }, function(response) {
              // send message to gohyper.js
              chrome.tabs.sendMessage(sender.tab.id, {
                'subject': 'quotesNotFound',
                'data': response.data
              });
            });
          }
        });
      }
    });
  }
  if (message.subject === 'iconOnclick') {
    chrome.tabs.sendMessage(sender.tab.id, {
      'subject': 'iconOnclick'
    });
  }

});


function updateBadge() {
  // get active tab on current window
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    if (tab !== undefined && tab.url !== undefined) {
      // get all quotes for current tab's url
      getQuotes(tab.url, function(error, response) {
        if (error) {
          console.error(error);
        }
        // count how many quotes exist for active tab's url and update badge text accordingly
        if (response.data.length) {
          chrome.browserAction.setBadgeText({
            text: response.data.length.toString()
          });
        } else {
          chrome.browserAction.setBadgeText({
            text: ''
          });
        }
      });
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
    // send message to content script for showing data in iframe (before saving)
    chrome.tabs.sendMessage(tab.id, {
      'subject': 'initialQuoteData',
      'currentUrl': info.pageUrl,
      'quote': info.selectionText,
      'title': tab.title
    }, function(response) {
      // if response is not undefined send all data to content.js (for adding)
      if (response) {
        chrome.tabs.sendMessage(tab.id, {
          'subject': response.subject, // 'quoteData'
          'currentUrl': response.currentUrl,
          'quote': response.quote,
          'title': response.title,
          'quoteLocation': response.quoteLocation
        });
      }
    });
  }
});

// detect click on GoHyper icon in toolbar
chrome.browserAction.onClicked.addListener(function(activeTab) {
  chrome.tabs.sendMessage(activeTab.id, {
    'subject': 'iconOnclick'
  });
});
