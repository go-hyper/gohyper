'use strict';

var gohyper = angular.module('gohyper', ['ngRoute', 'ui.bootstrap']);

gohyper
  .config(function($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'html/quote.html'
      })
      .when('/quote/edit/:id', {
        templateUrl: 'html/quote_edit.html'
      })
      .when('/notepad', {
        templateUrl: 'html/notepad.html'
      })
      .when('/all_quotes', {
        templateUrl: 'html/all_quotes.html'
      });

  }).config(['$compileProvider', function($compileProvider) {
      // http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
  ]);

gohyper.factory('quoteService', function($rootScope, $location) {
  var data = {
    quote: {}
  };
  chrome.runtime.onMessage.addListener(function(message) {
    switch(message.subject) {
      case 'quoteData':
        angular.copy({
          quote: message.quote,
          title: message.title,
          currentUrl: message.currentUrl,
          quoteLocation: message.quoteLocation
        }, data.quote);
        $location.path('/');
        $rootScope.$apply();
        break;
      case 'iconOnclick':
        $location.path('/notepad');
        $rootScope.$apply();
        break;
      case 'quoteOnClick':
        $location.path('/quote/edit/' + message.data.id);
        $rootScope.$apply();
        break;
    }
  });
  return data;
});


gohyper
  .controller('QuoteController', function($scope, $location, quoteService) {

    $scope.form = {
      hyperlinks: [],
      tags: [],
      comment: ''
    };

    $scope.quote = quoteService.quote;

    $scope.pushTag = function(tag) {
      if ($scope.form.tags.indexOf(tag) === -1 && tag.length) {
        $scope.form.tags.push(tag);
      }
      $scope.form.tag = '';
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.form.hyperlinks.indexOf(hyperlink) === -1 && hyperlink.length) {
        $scope.form.hyperlinks.push(hyperlink);
      }
      $scope.form.hyperlink = '';
      // filter already added urls
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
              if ($scope.form.hyperlinks.indexOf(response.data[i].currentUrl) === -1) {
                $scope.links.push(response.data[i].currentUrl);
              }
            }
          }
        });
      });
    };

    // call function
    $scope.updateLinks();

    $scope.addQuote = function() {
      chrome.runtime.sendMessage({
        'subject': 'addQuote',
        'title': $scope.quote.title,
        'currentUrl': $scope.quote.currentUrl,
        'quote': $scope.quote.quote,
        'quoteLocation': $scope.quote.quoteLocation,
        'tags': $scope.form.tags,
        'comment': $scope.form.comment,
        'hyperlinks': $scope.form.hyperlinks,
        'createTimestamp': new Date().toISOString(),
        'updateTimestamp': new Date().toISOString()
      }, function(response) {
        if (response.status === 'success') {
          $scope.$apply(function() {
            // set to default
            $scope.quote.title = '';
            $scope.quote.currentUrl = '';
            $scope.quote.quote = '';
            $scope.quote.quoteLocation = [];
            $scope.form.tags = [];
            $scope.form.comment = '';
            $scope.form.hyperlinks = [];
            $location.path('/notepad');
          });
        } else {
          // TODO handle error resp. no response or other response.status
        }
      });
    };

    $scope.toNotepad = function() {
      $location.path('/notepad');
    };

  });


gohyper
  .controller('EditQuoteController', function($scope, $routeParams, $location) {

    $scope.page = $routeParams.page ? $routeParams.page : undefined;

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
      // add only a tag to the tags array that is neither already there nor an empty string
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
            if ($scope.page === 'all_quotes') {
              $location.path('/all_quotes');
            } else {
              $location.path('/notepad');
            }
          });
        } else {
          // TODO handle error resp. no response or other response.status
        }
      });
    };

    // delete a quote
    $scope.deleteQuote = function(id) {
      var del = confirm('Are you sure you want to delete this quote?');
      if (del) {
        chrome.runtime.sendMessage({
          'subject': 'deleteQuote',
          'id': id,
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              if ($scope.page === 'all_quotes') {
                $location.path('/all_quotes');
              } else {
                $location.path('/notepad');
              }
            });
          } else {
            // TODO handle error
          }
        });
      }
    };

    $scope.toNotepad = function() {
      $location.path('/notepad');
    };

    $scope.backToAllQuotes = function() {
      $location.path('/all_quotes');
    };
  });


gohyper
  .controller('NotepadController', function($scope, $location) {

    $scope.getQuotes = function() {
      chrome.runtime.sendMessage({
        'subject': 'getQuotes'
      }, function(response) {
        if (response.status === 'success') {
          $scope.$apply(function() {
            $scope.quotes = response.data;
          });
        } else {
          // TODO handle error
        }
      });
    };

    $scope.getQuotes();

    // delete a quote
    $scope.deleteQuote = function(id) {
      var del = confirm('Are you sure you want to delete this quote?');
      if (del) {
        chrome.runtime.sendMessage({
          'subject': 'deleteQuote',
          'id': id,
        }, function(response) {
          if (response.status === 'success') {
            $scope.$apply(function() {
              $scope.getQuotes();
            });
          } else {
            // TODO handle error
          }
        });
      }
    };

  });


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
            // TODO handle error
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
            // TODO handle error
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
            // TODO handle error
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
            // TODO handle error
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
          // TODO handle error
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
              $scope.getAll();
            });
          } else {
            // TODO handle error
          }
        });
      }
    };

    $scope.sorted = {
      asc: true
    };

  });
