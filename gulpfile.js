'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');

var files = ['manifest.json', 'js/*', 'bower_components/angular/angular.min.js',
  'bower_components/angular-route/angular-route.min.js', 'bower_components/angular-bootstrap/ui-bootstrap.min.js',
  'node_modules/dom-position-serializer/index.js', 'bower_components/font-awesome/css/font-awesome.min.css',
  'bower_components/jquery/dist/jquery.min.js', 'bower_components/rangy/rangy-core.min.js',
  'bower_components/rangy/rangy-classapplier.min.js', 'bower_components/rangy/rangy-highlighter.min.js',
  'bower_components/rangy/rangy-serializer.min.js', 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  'bower_components/angular/angular-csp.css', 'bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
  'images/*', 'html/*', 'overview.html', 'iframe.html', 'css/*'];

gulp.task('default', function() {
  return gulp.src(files, {base: './'})
    .pipe(zip('gohyper.zip'))
    .pipe(gulp.dest('./dist'));
});
