'use strict';

var gohyper = angular.module('gohyper', ['ngRoute', 'ui.bootstrap']);

gohyper
  .config(function($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'iframe.html'
      })
      .when('/quote/edit/:id', {
        templateUrl: 'html/quote_edit.html'
      })
      .when('/notepad', {
        templateUrl: 'html/notepad.html'
      });

  }).config(['$compileProvider', function($compileProvider) {
      // http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
  ]);

/*
gohyper
  .controller('NavigationController', function($scope, $location){
    $scope.isActive = function(str) {
      var reg = new RegExp('^'+str+'(\/.*)?$');
      return reg.test($location.path());
    };
  });
*/


gohyper
  .controller('QuoteController', function($scope, $location) {

    $scope.form = {
      hyperlinks: [],
      tags: [],
      comment: ''
    };

    chrome.runtime.onMessage.addListener(function(message, sender) {
      if (message.subject == 'documentOnclick') {
        // set values to default
        $scope.setToDefault();
      } else if (message.subject == 'buttonOnclick') {
        // TODO check later (!form.quotes im view)
        $scope.setToDefault();
      } else if (message.subject == 'initialQuoteData') {
        $scope.$apply(function() {
          $scope.form.quote = message.quote;
          $scope.form.title = message.title;
          $scope.form.currentUrl = message.currentUrl;
        });
      } else if (message.subject == 'quoteData') {
        $scope.$apply(function() {
          $scope.form.quote = message.quote;
          $scope.form.title = message.title;
          $scope.form.currentUrl = message.currentUrl;
          $scope.form.quoteLocation = message.quoteLocation
        });
      }
    });

    $scope.pushTag = function(tag) {
      if ($scope.form.tags.indexOf(tag) == -1 && tag.length) {
        $scope.form.tags.push(tag);
      }
      $scope.form.tag = '';
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.form.hyperlinks.indexOf(hyperlink) == -1 && hyperlink.length) {
        $scope.form.hyperlinks.push(hyperlink);
      }
      $scope.form.hyperlink = '';
      // filter already added urls
      $scope.updateLinks();
    };

    // set values to default
    $scope.setToDefault = function() {
      $scope.$apply(function() {
        $scope.form.title = '';
        $scope.form.currentUrl = '';
        $scope.form.quote = '';
        $scope.form.quoteLocation = '';
        $scope.form.tags = [];
        $scope.form.comment = '';
        $scope.form.hyperlinks = [];
        $scope.form.createTimestamp = '';
        $scope.form.updateTimestamp = '';
      });
    }

    $scope.updateLinks = function() {
      chrome.runtime.sendMessage({
        'subject': 'getAll'
      }, function(response) {
        $scope.links = [];
        // get all quotes (in response.data)
        for (var i = 0; i < response.data.length; i++) {
          // filter doubles
          if ($scope.links.indexOf(response.data[i].currentUrl) == -1 ) {
            // filter already added urls
            if ($scope.form.hyperlinks.indexOf(response.data[i].currentUrl) == -1) {
              $scope.links.push(response.data[i].currentUrl);
            }
          }
        }
      });
    };

    // call function
    $scope.updateLinks();

    $scope.addQuote = function() {
      chrome.runtime.sendMessage({
        'subject': 'addQuote',
        'title': $scope.form.title,
        'currentUrl': $scope.form.currentUrl,
        'quote': $scope.form.quote,
        'quoteLocation': $scope.form.quoteLocation,
        'tags': $scope.form.tags,
        'comment': $scope.form.comment,
        'hyperlinks': $scope.form.hyperlinks,
        'createTimestamp': new Date().toISOString(),
        'updateTimestamp': new Date().toISOString()
      }, function(response) {
        if (response.status == 'success') {
          $scope.setToDefault();
        // 'error'
        } else {
          // TODO
        }
      });
    };

  });


gohyper
  .controller('EditQuoteController', function($scope, $routeParams, $location) {

    $scope.quote = {};

    // find one by id
    chrome.runtime.sendMessage({
      'subject': 'findOneById',
      'id': parseInt($routeParams.id)
    });

    // angular.copy(response, $scope.quote);

    $scope.pushTag = function(tag) {
      if ($scope.quote.tags.indexOf(tag) == -1 && tag.length) {
        $scope.quote.tags.push(tag);
      }
      $scope.quote.tag = '';
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.quote.hyperlinks.indexOf(hyperlink) == -1 && hyperlink.length) {
        $scope.quote.hyperlinks.push(hyperlink);
      }
      $scope.quote.hyperlink = '';
      //$scope.updateLinks();
    };

    /*
    $scope.updateLinks = function() {
      $scope.links = [];
      $indexedDB.openStore('quotes', function(store) {
        store.getAll().then(function(response) {
          for (var i = 0; i < response.length; i++) {
            // filter doubles
            if ($scope.links.indexOf(response[i].currentUrl) === -1 ) {
              // filter already added urls
              if ($scope.quote.hyperlinks.indexOf(response[i].currentUrl) === -1) {
                // TODO filter url of current quote?
                // if (response[i].currentUrl != $scope.quote.currentUrl) {
                $scope.links.push(response[i].currentUrl);
              }
            }
          }
        });
      });
    };
    */


    // call function
    // $scope.updateLinks();

    $scope.saveQuote = function() {
      chrome.runtime.sendMessage({
        'subject': 'updateQuote',
        'id': $scope.quote.id,
        'title': $scope.quote.title,
        'currentUrl': $scope.quote.currentUrl,
        'quote': $scope.quote.quote,
        'quoteLocation': $scope.quote.quoteLocation,
        'tags': $scope.quote.tags,
        'comment': $scope.quote.comment,
        'hyperlinks': $scope.quote.hyperlinks,
        'createTimestamp': $scope.quote.createTimestamp,
        'updateTimestamp': new Date().toISOString()
      });
      // TODO route to show all
      // $location.path('/notepad');
    };

  });


gohyper
  .controller('NotepadController', function($scope) {

    $scope.pagination = {
      page: 1,
      maxPerPage: 5,
      total: undefined,
      maxSize: 3
    };

    $scope.getQuotes = function() {
      chrome.runtime.sendMessage({
        'subject': 'getQuotes'
      }, function(response) {
        if (response.status == 'success') {
          $scope.quotes = response.data;
        } else {
          // TODO
        }
      });
    };

    $scope.$watchGroup(['pagination.page'], $scope.getQuotes);

    // total count
    chrome.runtime.sendMessage({
      'subject': 'count'
    });

    // await response: $scope.count = response;

    // delete a quote
    $scope.deleteQuote = function(id) {
      chrome.runtime.sendMessage({
        'subject': 'deleteQuote',
        'id': id,
      }, function(response) {
        if (response.status == 'success') {
          $scope.$apply(function() {
            //$scope.getQuotes;
            // TODO search for better solution (store.delete(id).then($scope.getQuotes);)
            $scope.quotes = response.data;
          });
        } else {
          // TODO
        }
      });
    };

  });
