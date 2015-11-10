'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'js/background.js', 'js/gohyper.js', 'bower_components/angular/angular.min.js',
  'bower_components/angular-route/angular-route.min.js', 'bower_components/angular-indexedDB/angular-indexed-db.js',
  'bower_components/angular-bootstrap/ui-bootstrap.js', 'images/gohyper.png', 'popup.html', 'html/quote.html',
  'html/notepad.html', 'html/info.html', 'css/gohyper.css'];

var xpiName = 'gohyper.xpi';
gulp.task('default', function() {
  gulp.src(files)
    .pipe(zip(xpiName))
    .pipe(gulp.dest('.'));
});
