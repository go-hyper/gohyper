var gohyper = angular.module('gohyper', ['ngRoute', 'indexedDB']);


gohyper
  .config(function($routeProvider, $indexedDBProvider) {
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
var db;

// db didn't exist before: create object store "quotes" and indices
request.onupgradeneeded = function() {
  db = request.result;
  // initialize db
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
    quoteLocation: "TODO",                        // quote location in DOM
    tags: ["tag1", "tag2"],
    comment: "Test comment",
    links: ["http://link.de", "http://link2.de"],
    timestamp: new Date().toISOString()           // ISO 8601
  });
};

request.onsuccess = function(event) {
  db = request.result;
};

request.onerror = function(event) {
  // TODO: handle error (event.target.errorCode)
};


// add data
function addData(data) {
  var transaction = db.transaction("quotes", "readwrite");
  var store = transaction.objectStore("quotes");
  store.put(data);
}
