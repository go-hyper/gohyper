'use strict';

var gohyper = angular.module('gohyper', ['ngRoute', 'ui.bootstrap']);

gohyper
  .config(function($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'html/all_quotes.html'
      })
      .when('/quote/edit/:id', {
        templateUrl: 'html/quote_edit.html'
      });

  }).config(['$compileProvider', function($compileProvider) {
      // http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
  ]);


gohyper
  .controller('OverviewController', function($scope, $location) {

    $scope.getAll = function() {
      var sortBy = $scope.sortBy;
      if (sortBy === 'timestampOF') {
        chrome.runtime.sendMessage({
          'subject': 'getAll',
          'sortBy': 'timestampOF'
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              $scope.quotes = response.data;
            });
          } else {
            // TODO
          }
        });
      } else if (sortBy === 'quoteAZ') {
        chrome.runtime.sendMessage({
          'subject': 'getAll',
          'sortBy': 'quoteAZ'
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              $scope.quotes = response.data;
            });
          } else {
            // TODO
          }
        });
      } else if (sortBy === 'quoteZA') {
        chrome.runtime.sendMessage({
          'subject': 'getAll',
          'sortBy': 'quoteZA'
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              $scope.quotes = response.data;
            });
          } else {
            // TODO
          }
        });
      } else {
        chrome.runtime.sendMessage({
          'subject': 'getAll'
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              $scope.quotes = response.data;
            });
          } else {
            // TODO
          }
        });
      }
    };

    $scope.getAll();

    // search for tag
    $scope.searchFor = function(input) {
      chrome.runtime.sendMessage({
        'subject': 'search',
        'input': input
      }, function(response) {
        if (response.status === 'success') {
          $scope.searchInput = '';
          $scope.$apply(function() {
            $scope.quotes = response.data;
          });
        } else {
          // TODO
        }
      });
    };

    $scope.$watchGroup(['sortBy'], $scope.getAll);

    $scope.deleteQuote = function(id) {
      var del = confirm('Are you sure you want to delete this quote?');
      if (del) {
        chrome.runtime.sendMessage({
          'subject': 'deleteQuote',
          'id': id,
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              //$scope.getQuotes;
              // TODO search for better solution (store.delete(id).then($scope.getQuotes);)
              //$scope.quotes = response.data;
              $scope.getAll();
            });
          } else {
            // TODO
          }
        });
      } else {
        // do nothing
      }
    };

    $scope.sorted = {
      asc: true
    };

  });


gohyper
  .controller('EditQuoteController', function($scope, $routeParams, $location) {

    $scope.quote = {};

    // find one quote by id
    chrome.runtime.sendMessage({
      'subject': 'findOneById',
      'id': parseInt($routeParams.id)
    }, function(response) {
      if (response.status === 'success') {
        $scope.quote = response.data[0];
      }
    });

    $scope.pushTag = function(tag) {
      if ($scope.quote.tags.indexOf(tag) === -1 && tag.length) {
        $scope.quote.tags.push(tag);
      }
      $scope.quote.tag = '';
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.quote.hyperlinks.indexOf(hyperlink) === -1 && hyperlink.length) {
        $scope.quote.hyperlinks.push(hyperlink);
      }
      $scope.quote.hyperlink = '';
      $scope.updateLinks();
    };

    $scope.updateLinks = function() {
      chrome.runtime.sendMessage({
        'subject': 'getAll'
      }, function(response) {
        $scope.$apply(function() {
          $scope.links = [];
          // get all quotes (in response.data)
          for (var i = 0; i < response.data.length; i++) {
            // filter doubles
            if ($scope.links.indexOf(response.data[i].currentUrl) === -1 ) {
              // filter already added urls
              if ($scope.quote.hyperlinks.indexOf(response.data[i].currentUrl) === -1) {
                $scope.links.push(response.data[i].currentUrl);
              }
            }
          }
        });
      });
    };

    // call function
    $scope.updateLinks();

    $scope.updateQuote = function() {
      chrome.runtime.sendMessage({
        'subject': 'updateQuote',
        'quote': {
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
        }
      }, function(response) {
        if (response.status === 'success') {
          $scope.$apply(function() {
            $location.path('/');
          });
        } else {
          // TODO
        }
      });
    };

    $scope.discard = function() {
      $location.path('/');
    };

  });