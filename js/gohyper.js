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
          title: "Title of current web page",
          currentUrl: "http://www.xyz.com",
          quote: "This is a quote",
          quoteLocation: "TODO",                        // quote location in DOM
          tags: $scope.tags,
          comment: "Test comment",
          links: ["http://link.de", "http://link2.de"],
          timestamp: new Date().toISOString()           // ISO 8601
        }).then(function(event) {
          // TODO
        });

        store.getAll().then(function(quotes) {
          // update scope
          $scope.objects = quotes;
        });
      });
    };

  });


gohyper
  .controller('NotepadController', function($scope) {
    // dummy data
    $scope.data = [["Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.", "http://www.tagesschau.de"],
      ["Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.", "http://www.mi.fu-berlin.de/inf/"],
      ["Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", "http://www.fu-berlin.de"]
    ];
  });
