var gohyper = angular.module('gohyper', ['ngRoute']);


gohyper
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'quote.html'
      })
      .when('/notepad', {
        templateUrl: 'notepad.html'
      })
      .when('/info', {
        templateUrl: 'info.html'
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
  .controller('QuoteController', function($scope) {
    $scope.tags = [];
    $scope.push = function(input) {
      if ($scope.tags.indexOf(input) == -1) {
        $scope.tags.push(input);
      }
      $scope.input = "";
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



// database

// create and open database
var request = window.indexedDB.open("GoHyper", 1);

// database didn't exist before: create object store and indices
request.onupgradeneeded = function() {
  var db = request.result;
  var store = db.createObjectStore("quotes", {
    keyPath: "id",
    autoIncrement: true
  });
  var titleIndex = store.createIndex("by_title", "title", {unique: false});
  var currentUrlIndex = store.createIndex("by_current_url", "currentUrl", {unique: false});

  // store initial dummy data
  store.put({
    title: "Title of current web page",
    currentUrl: "http://www.xyz.com",
    quote: "This is a quote",
    quoteLocation: "TODO",
    tags: ["tag1", "tag2"],
    comment: "Test comment",
    links: ["http://link.de", "http://link2.de"],
    timestamp: (new Date()).toISOString()
  });
};

request.onsuccess = function() {
  var db = request.result;
};
