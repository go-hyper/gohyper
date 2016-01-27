# GoHyper [![Build Status](https://travis-ci.org/jengeb/gohyper.svg?branch=master)](https://travis-ci.org/jengeb/gohyper) [![Dependency Status](https://gemnasium.com/jengeb/gohyper.svg)](https://gemnasium.com/jengeb/gohyper)

[GoHyper](https://chrome.google.com/webstore/detail/gohyper/bemkdkdpdcepkncpclmcphgaddaameff) is a Chrome Extension to annotate, highlight and interlink text selections on web pages. 

## Setup
### Requirements
* nodejs
* npm
* bower
* gulp
* gulp-zip

## Build instructions
* Run `npm install` and `bower install`. This will set up all dependencies.
* Open Chrome or Chromium on [chrome://extensions/](chrome://extensions/) and "Load unpacked extension" from the `gohyper` directory.

## Distribution
* Make sure you increased the version number in `manifest.json`.
* Build the extension using `gulp`. It will zip all files into `gohyper.zip` in `./dist` directory.
* Go to [GoHyper's Chrome Web Store page](https://chrome.google.com/webstore/developer/edit/bemkdkdpdcepkncpclmcphgaddaameff)
  and upload the zipped package. 

## License
The GoHyper Chrome Extension is licensed under the [GNU GPLv3](https://www.gnu.org/licenses/gpl.html) license.
