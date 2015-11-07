'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'js/background.js', 'js/popup.js', 'js/gohyper.js', 'bower_components/angular/angular.min.js',
  'bower_components/angular-route/angular-route.min.js', 'images/gohyper.png', 'popup.html', 'quote.html', 'notepad.html',
  'info.html', 'css/gohyper.css'];

var xpiName = 'gohyper.xpi';
gulp.task('default', function() {
  gulp.src(files)
    .pipe(zip(xpiName))
    .pipe(gulp.dest('.'));
});
