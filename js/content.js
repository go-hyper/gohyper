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
};

document.onclick =  function() {
  setActive(false);
};

// http://stackoverflow.com/questions/3223682/change-css-of-selected-text-using-javascript
function makeEditableAndHighlight(colour) {
  var range, sel = window.getSelection();
  if (sel.rangeCount && sel.getRangeAt) {
    range = sel.getRangeAt(0);
  }
  document.designMode = 'on';
  if (range) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  // Use HiliteColor since some browsers apply BackColor to the whole block
  if (!document.execCommand('HiliteColor', false, colour)) {
    document.execCommand('BackColor', false, colour);
  }
  document.designMode = 'off';
}

// wait for messages from event/background page belonging to context menu's onclick events
chrome.runtime.onMessage.addListener(function(message, sender) {
  var sel = rangy.getSelection();
  var serializedRanges = sel.getAllRanges().map(
    function(range) {
      // 3rd argument: root element
      return rangy.serializeRange(range, true, document.body);
    }
  );

  //console.log(serializedRanges);

  /* TODO to gohyper.js
  chrome.runtime.sendMessage({
    'title': message.title,
    'currentUrl': message.currentUrl,
    'quote': message.quote,
    'quoteLocation': serializedRanges
  });
  */

  makeEditableAndHighlight('yellow');

  // if response from gohyper.js then (if all values are set)
  setActive(true);

});