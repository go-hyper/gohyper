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


gohyper
  .controller('NavigationController', function($scope, $location){
    $scope.isActive = function(str) {
      var reg = new RegExp('^'+str+'(\/.*)?$');
      return reg.test($location.path());
    };
  });


gohyper
  .controller('QuoteController', function($scope, $location) {

    $scope.form = {
      hyperlinks: [],
      tags: [],
      comment: ""
    };

/*
    chrome.runtime.getBackgroundPage(function(eventPage) {
      // injects content.js into current tab's HTML
      eventPage.getPageDetails(function(message) {
        $scope.form.title = message.title;
        $scope.form.currentUrl = message.currentUrl;
        $scope.form.quote = message.quote;
        $scope.$apply();
      });
    });
*/

    $scope.form.title = "Test TODO";
    $scope.form.currentUrl = "http://www.wikipedia.de";
    $scope.form.quote = "Test TODO";

    $scope.pushTag = function(tag) {
      if ($scope.form.tags.indexOf(tag) == -1 && tag.length) {
        $scope.form.tags.push(tag);
      }
      $scope.form.tag = "";
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.form.hyperlinks.indexOf(hyperlink) == -1 && hyperlink.length) {
        $scope.form.hyperlinks.push(hyperlink);
      }
      $scope.form.hyperlink = "";
      // filter already added urls
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
              if ($scope.form.hyperlinks.indexOf(response[i].currentUrl) === -1) {
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

    $scope.addQuote = function() {
      chrome.runtime.sendMessage({
        'subject': 'addQuote',
        'title': $scope.form.title,
        'currentUrl': $scope.form.currentUrl,
        'quote': $scope.form.quote,
        'quoteLocation': 'TODO',
        'tags': $scope.form.tags,
        'comment': $scope.form.comment,
        'hyperlinks': $scope.form.hyperlinks,
        'createTimestamp': new Date().toISOString(),
        'updateTimestamp': new Date().toISOString()
      }, function(response) {
        if (response.status === 'success') {
          // TODO
          // get connection to background page and call updateBadge
          // chrome.runtime.getBackgroundPage().updateBadge();
          // $location.path('/notepad');
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
      $scope.quote.tag = "";
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.quote.hyperlinks.indexOf(hyperlink) == -1 && hyperlink.length) {
        $scope.quote.hyperlinks.push(hyperlink);
      }
      $scope.quote.hyperlink = "";
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

    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
      var tab = arrayOfTabs[0];
      $scope.currentUrl = tab.url;
    });

    $scope.pagination = {
      page: 1,
      maxPerPage: 5,
      total: undefined,
      maxSize: 3
    };

    // default
    $scope.filter = {
      byUrl: true
    };

    $scope.getQuotes = function() {
      chrome.runtime.sendMessage({
        'subject': 'getQuotes'
      });
      // await response

      /*
      $indexedDB.openStore('quotes', function(store) {
        if ($scope.currentUrl) {
          if ($scope.filter.byUrl) {
            var find = store.query();
            find = find.$eq($scope.currentUrl);
            find = find.$index("by_current_url");

            // update scope
            store.eachWhere(find).then(function(response) {

              $scope.quotes = response;
              // $scope.pagination.total = $scope.quotes.length;
            });
          } else {
            store.getAll().then(function(quotes) {
              // update scope
              $scope.quotes = quotes;
              // $scope.pagination.total = $scope.quotes.length;
            });
          }
        }
      }); */

    };

    $scope.$watchGroup(['filter.byUrl', 'pagination.page', 'currentUrl'], $scope.getQuotes);

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
      });

      // store.delete(id).then($scope.getQuotes);

      // get connection to background page and call updateBadge
      chrome.extension.getBackgroundPage().updateBadge();
    };

  });
