# GoHyper [![Build Status](https://travis-ci.org/go-hyper/gohyper.svg?branch=master)](https://travis-ci.org/go-hyper/gohyper) [![Dependency Status](https://gemnasium.com/jengeb/gohyper.svg)](https://gemnasium.com/jengeb/gohyper)

[GoHyper](https://chrome.google.com/webstore/detail/gohyper/bemkdkdpdcepkncpclmcphgaddaameff) is a Chrome extension to annotate, highlight and interlink text selections on web pages. 

## Setup
### Requirements
* Node.js
* npm
* Bower
* gulp
* gulp-zip

## Build instructions
* Run `npm install` and `bower install`. This will set up all dependencies.
* Open Chrome or Chromium on [chrome://extensions/](chrome://extensions/) and "Load unpacked extension" from the `gohyper` directory.

## Distribution
* Make sure you increased the version number in `manifest.json`.
* Check that all added files are mentioned in `gulpfile.js`.
* Build the extension using `gulp`. It will zip all files into `gohyper.zip` in `./dist` directory.
* Test this GoHyper version-to-be before publishing.
* Go to [GoHyper's Chrome Web Store page](https://chrome.google.com/webstore/developer/edit/bemkdkdpdcepkncpclmcphgaddaameff)
  and upload the zipped package. 

## License
The GoHyper Chrome extension is licensed under the [GNU GPLv3](https://www.gnu.org/licenses/gpl.html).
