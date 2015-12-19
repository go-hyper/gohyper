'use strict';

rangy.init();

// TODO (check if fixed)
// workaround, see https://github.com/timdown/rangy/issues/146#issuecomment-38368638
var elem = document.querySelector(':focus');
if (elem) {
  elem.blur();
  elem.focus();
}

// inject container with button and iframe
var outerContainer = document.createElement('div');
var shadow = outerContainer.createShadowRoot();
var style = document.createElement('style');
style.innerHTML =
  '@import "' + chrome.runtime.getURL('bower_components/font-awesome/css/font-awesome.css') + '";' +
  '@import "' + chrome.runtime.getURL('css/content.css') + '";';
var innerContainer = document.createElement('div');
var button = document.createElement('button');
var iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('iframe.html');

var active = false;
function setActive(_active) {
  active = _active;
  innerContainer.className = 'gohyper-container';
  if (active) {
    innerContainer.className += ' gohyper-active';
  }
  button.innerHTML = active ? '<i class="fa fa-chevron-right"></i>' : '<i class="fa fa-chevron-left"></i>';
}
// init
setActive(false);

innerContainer.appendChild(button);
innerContainer.appendChild(iframe);
shadow.appendChild(style);
shadow.appendChild(innerContainer);
document.body.appendChild(outerContainer);

button.onclick = function(event) {
  setActive(!active);
  event.stopPropagation();
  chrome.runtime.sendMessage({
    'subject': 'buttonOnclick'
  });
};

document.onclick =  function() {
  setActive(false);
  chrome.runtime.sendMessage({
    'subject': 'documentOnclick'
  });
};


// get and highlight all quotes for current url
chrome.runtime.sendMessage({
  'subject': 'getQuotes'
}, function(response) {
  if (response.status === 'success' && response.data.length) {
    response.data.forEach(function(quote) {
      highlight(quote);
    });
  } else {
    // TODO
  }
});


function highlight(quote) {
  var start = deserializePosition(quote.quoteLocation.start, document.body, 'goHyper');
  var end = deserializePosition(quote.quoteLocation.end, document.body, 'goHyper');

  var range = rangy.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);

  function onclick(e) {
    setActive(true);
    e.stopPropagation();
    console.log('clicki', quote);
  }

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


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.subject === 'checkActive') {
    sendResponse({
      'status': 'success'
    });
  }
  // wait for messages from event/background page belonging to context menu's onclick events
  else if (message.subject === 'initialQuoteData') {
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

    // if response from gohyper.js then (if all values are set) TODO
    setActive(true);
  } else if (message.subject === 'highlightText') {

    setActive(false);
    document.getSelection().removeAllRanges();
  } else if (message.subject === 'deserializeQuote') {
    console.log('remove highlighted quote');
    // TODO
  }

});