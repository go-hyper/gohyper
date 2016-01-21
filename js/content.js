'use strict';

rangy.init();

// workaround to reset focus, see https://github.com/timdown/rangy/issues/146#issuecomment-38368638
var elem = document.querySelector(':focus');
if (elem) {
  elem.blur();
  elem.focus();
}

// create container with iframe
var outerContainer = document.createElement('div');
var style = document.createElement('style');
style.innerHTML =
  '@import "' + chrome.runtime.getURL('bower_components/font-awesome/css/font-awesome.min.css') + '";' +
  '@import "' + chrome.runtime.getURL('css/content.css') + '";';
var innerContainer = document.createElement('div');
var iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('iframe.html');

// inject GoHyper interface in current document
innerContainer.appendChild(iframe);
outerContainer.appendChild(style);
outerContainer.appendChild(innerContainer);
document.body.appendChild(outerContainer);

// function to open GoHyper interface
var active = false;
function setActive(_active) {
  active = _active;
  innerContainer.className = 'gohyper-container';
  if (active) {
    innerContainer.className += ' gohyper-active';
  }
}
// init
setActive(false);


// detect click on current document (if clicked, close GoHyper interface)
document.onclick =  function() {
  setActive(false);
  chrome.runtime.sendMessage({
    'subject': 'documentOnclick'
  });
};

// manage added and deleted quote data and their highlight
var quoteCollection = {};

// get and highlight all quotes for current url
chrome.runtime.sendMessage({
  'subject': 'getQuotes'
}, function(response) {
  if (response.status === 'success' && response.data.length) {
    response.data.forEach(function(quote) {
      // store all quotes in an object (needed for removing quote and highlight)
      quoteCollection[quote.id] = quote;
      highlight(quote);
    });
  }
});


// highlight selected text and make it clickable
function highlight(quote) {
  var start = deserializePosition(quote.quoteLocation.start, document.body, 'goHyper');
  var end = deserializePosition(quote.quoteLocation.end, document.body, 'goHyper');

  var range = rangy.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);

  function onclick(event) {
    setActive(true);
    event.stopPropagation();

    // send data to background script (sends data to gohyper.js that shows data in iframe)
    chrome.runtime.sendMessage({
      'subject': 'quoteOnClick',
      'data': quote
    });
  }

  // see rangy's documentation: https://github.com/timdown/rangy/wiki/Class-Applier-Module
  var applier = rangy.createClassApplier(
    'goHyper',
    {
      useExistingElements: false,
      onElementCreate: function(el) {
        el.addEventListener('click', onclick);
      }
    }
  );

  applier.applyToRange(range);
}


// Event Listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.subject) {
    case 'checkActive':
      sendResponse({
        'status': 'success'
      });
      break;

    // detects click on GoHyper Icon
    case 'iconOnclick':
      setActive(!active);
      break;

    // wait for messages from event/background page belonging to context menu's onclick events
    case 'initialQuoteData':
      var sel = document.getSelection();
      var startPosition = {
        node: sel.anchorNode,
        offset: sel.anchorOffset
      };
      var endPosition = {
        node: sel.focusNode,
        offset: sel.focusOffset
      };
      var serializedStartPosition = serializePosition(startPosition.node, startPosition.offset, document.body, 'goHyper');
      var serializedEndPosition = serializePosition(endPosition.node, endPosition.offset, document.body, 'goHyper');
      sendResponse({
        'subject': 'quoteData',
        'title': message.title,
        'currentUrl': message.currentUrl,
        'quote': message.quote,
        'quoteLocation': {
          start: serializedStartPosition,
          end: serializedEndPosition
        }
      });
      // if response from gohyper.js (if all values are set) then open GoHyper interface
      setActive(true);
      break;

    // highlight just added quote
    case 'highlightText':
      var quote = message.data[0];
      quoteCollection[message.data[0].id] = quote;
      highlight(quote);
      setActive(false);
      break;

    // if quote is deleted remove highlight
    case 'deserializeQuote':
      var id = message.quoteId;
      // get quote for deserialization
      var quote = quoteCollection[id];
      delete quoteCollection[id];
      // deserialize quote position
      var start = deserializePosition(quote.quoteLocation.start, document.body, 'goHyper');
      var end = deserializePosition(quote.quoteLocation.end, document.body, 'goHyper');
      // get range for deleted quote
      var range = rangy.createRange();
      range.setStart(start.node, start.offset);
      range.setEnd(end.node, end.offset);
      // remove ClassApplier's 'goHyper' class (highlight) from text within range
      rangy.createClassApplier('goHyper').undoToRange(range);
      break;
  }
});