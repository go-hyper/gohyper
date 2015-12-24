'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'js/background.js', 'js/gohyper.js', 'js/overview.js', 'bower_components/angular/angular.min.js',
  'bower_components/angular-route/angular-route.min.js', 'bower_components/angular-bootstrap/ui-bootstrap.js',
  'node_modules/dom-position-serializer/index.js', 'images/gohyper.png', 'html/quote.html', 'html/notepad.html',
  'html/quote_edit.html', 'iframe.html', 'css/gohyper.css', 'css/content.css', 'css/iframe.css'];

var xpiName = 'gohyper.xpi';
gulp.task('default', function() {
  gulp.src(files)
    .pipe(zip(xpiName))
    .pipe(gulp.dest('.'));
});
