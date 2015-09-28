'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'background.js', 'test.png', 'popup.html'];

var xpiName = 'test.xpi';

gulp.task('default', function () {
  gulp.src(files)
    .pipe(zip(xpiName))
    .pipe(gulp.dest('.'));
});
