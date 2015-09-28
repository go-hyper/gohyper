'use strict';

// global chrome:false

chrome.browserAction.setBadgeText({text: 'Test'});
chrome.browserAction.setBadgeBackgroundColor({color: '#0091EA'});

/*chrome.browserAction.onClicked.addListener(function(aTab) {
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