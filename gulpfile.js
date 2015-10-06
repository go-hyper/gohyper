'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'js/background.js', 'images/test.png', 'popup.html', 'js/popup.js', 'js/gohyper.js', 'bower_components/angular/angular.js'];

var xpiName = 'test.xpi';
gulp.task('default', function () {
  gulp.src(files)
    .pipe(zip(xpiName))
    .pipe(gulp.dest('.'));
});
