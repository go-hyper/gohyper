var gohyper = angular.module('gohyper', ['ngRoute', 'indexedDB']);

gohyper
  .config(function($routeProvider, $indexedDBProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'html/quote.html'
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
      });
  });


gohyper
  .controller('NavigationController', function($scope, $location){
    $scope.isActive = function(str) {
      var reg = new RegExp('^'+str+'(\/.*)?$');
      return reg.test($location.path());
    };
  });


gohyper
  .controller('QuoteController', function($scope, $indexedDB) {
    $scope.tags = [];
    $scope.comment = "";

    chrome.runtime.getBackgroundPage(function(eventPage) {
      // injects content.js into current tab's HTML
      eventPage.getPageDetails(function(message) {
        $scope.title = message.title;
        $scope.currentUrl = message.currentUrl;
        $scope.quote = message.quote;
        $scope.$apply();
      });
    });

    $scope.push = function(input) {
      if ($scope.tags.indexOf(input) == -1) {
        $scope.tags.push(input);
      }
      $scope.input = "";
    };

    $scope.addQuote = function() {
      $scope.objects = [];
      $indexedDB.openStore('quotes', function(store) {
        store.insert({
          title: $scope.title,
          currentUrl: $scope.currentUrl,
          quote: $scope.quote,
          quoteLocation: "TODO",                        // quote location in DOM
          tags: $scope.tags,
          comment: $scope.comment,
          links: ["http://link.de", "http://link2.de"],
          timestamp: new Date().toISOString()           // ISO 8601
        }).then(function(event) {
          // TODO
        });
      });
    };

  });


gohyper
  .controller('NotepadController', function($scope, $indexedDB) {

    // default
    $scope.filter = {
      byUrl: true
    };

    $scope.getQuotes = function() {
      $indexedDB.openStore('quotes', function(store) {

        if ($scope.filter.byUrl) {
          var find = store.query();
          // TODO get current url
          find = find.$eq("http://www.tagesschau.de/");
          find = find.$index("by_current_url");

          // update scope
          store.eachWhere(find).then(function(e) {
            $scope.quotes = e;
          });
        } else {
          store.getAll().then(function(quotes) {
            // update scope
            $scope.quotes = quotes;
          });
        }
      });
    };

    $scope.$watchGroup(['filter.byUrl'], $scope.getQuotes);

    // total count
    $indexedDB.openStore('quotes', function(store) {
      store.count().then(function(e) {
        $scope.count = e;
      });
    });

    // delete a qoute
    $scope.deleteQuote = function(id) {
      $indexedDB.openStore('quotes', function(store) {
        store.delete(id).then($scope.getQuotes);
      });
    };

  });
