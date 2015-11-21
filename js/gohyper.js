var gohyper = angular.module('gohyper', ['ngRoute', 'indexedDB', 'ui.bootstrap']);

gohyper
  .config(function($routeProvider, $indexedDBProvider) {

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
      .when('/info', {
        templateUrl: 'html/info.html'
      });

    $indexedDBProvider
      .connection('GoHyper')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('quotes', {keyPath: 'id', autoIncrement: true});
        objStore.createIndex('by_title', 'title', {unique: false});
        objStore.createIndex('by_current_url', 'currentUrl', {unique: false});
        objStore.createIndex('by_create_timestamp', 'createTimestamp', {unique: true});
        objStore.createIndex('by_update_timestamp', 'updateTimestamp', {unique: true});
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
  .controller('QuoteController', function($scope, $indexedDB, $location) {

    $scope.form = {
      hyperlinks: [],
      tags: [],
      comment: ""
    };

    chrome.runtime.getBackgroundPage(function(eventPage) {
      // injects content.js into current tab's HTML
      eventPage.getPageDetails(function(message) {
        $scope.form.title = message.title;
        $scope.form.currentUrl = message.currentUrl;
        $scope.form.quote = message.quote;
        $scope.$apply();
      });
    });

    $scope.pushTag = function(tag) {
      if ($scope.form.tags.indexOf(tag) == -1) {
        $scope.form.tags.push(tag);
      }
      $scope.form.tag = "";
    };

    $scope.pushLink = function(hyperlink) {
      if ($scope.form.hyperlinks.indexOf(hyperlink) == -1) {
        $scope.form.hyperlinks.push(hyperlink);
      }
      $scope.form.hyperlink = "";
    };

    $scope.addQuote = function() {
      $indexedDB.openStore('quotes', function(store) {
        store.insert({
          title: $scope.form.title,
          currentUrl: $scope.form.currentUrl,
          quote: $scope.form.quote,
          quoteLocation: "TODO",                        // quote location in DOM
          tags: $scope.form.tags,
          comment: $scope.form.comment,
          hyperlinks: $scope.form.hyperlinks,
          createTimestamp: new Date().toISOString(),    // ISO 8601
          updateTimestamp: new Date().toISOString()
        }).then(function(event) {

          // get connection to background page and call updateBadge
          chrome.extension.getBackgroundPage().updateBadge();

          $location.path('/notepad');
        });
      });
    };

  });


gohyper
  .controller('EditQuoteController', function($scope, $indexedDB, $routeParams, $location) {

    $scope.quote = {};

    $indexedDB.openStore('quotes', function(store) {
      store.find(parseInt($routeParams.id)).then(function(response) {
        angular.copy(response, $scope.quote);
      });
    });

    $scope.push = function(input) {
      if ($scope.quote.tags.indexOf(input) == -1) {
        $scope.quote.tags.push(input);
      }
      $scope.input = "";
    };

    $scope.saveQuote = function() {
      $indexedDB.openStore('quotes', function(store) {
        store.upsert({
          "id": $scope.quote.id,
          "title": $scope.quote.title,
          "currentUrl": $scope.quote.currentUrl,
          "quote": $scope.quote.quote,
          "quoteLocation": $scope.quote.quoteLocation,
          "tags": $scope.quote.tags,
          "comment": $scope.quote.comment,
          "hyperlinks": $scope.quote.hyperlinks,
          "createTimestamp": $scope.quote.createTimestamp,
          "updateTimestamp": new Date().toISOString()
        }).then(function(response) {
          // TODO route to show all
          $location.path('/notepad');
        });
      });
    };

  });


gohyper
  .controller('NotepadController', function($scope, $indexedDB) {

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
      });
    };

    $scope.$watchGroup(['filter.byUrl', 'pagination.page', 'currentUrl'], $scope.getQuotes);

    // total count
    $indexedDB.openStore('quotes', function(store) {
      store.count().then(function(response) {
        $scope.count = response;
      });
    });

    // delete a qoute
    $scope.deleteQuote = function(id) {
      $indexedDB.openStore('quotes', function(store) {
        store.delete(id).then($scope.getQuotes);
      });

      // get connection to background page and call updateBadge
      chrome.extension.getBackgroundPage().updateBadge();
    };

  });
