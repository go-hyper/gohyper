var gohyper = angular.module('gohyper', ['ngRoute']);


gohyper
  .config(function($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'popup.html'
      })
      .when('/quote', {
        templateUrl: 'quote.html'
      })
      .when('/notepad', {
        templateUrl: 'notepad.html'
      })
      .when('/info', {
        templateUrl: 'info.html'
      })
      ;
    $httpProvider.interceptors.push('errorInterceptor');
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
    $scope.push = function (input) {
      if ($scope.tags.indexOf(input) == -1) {
        $scope.tags.push(input);
      }
      $scope.input = "";
    };

    // dummy data
    $scope.data = [["Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.", "http://www.tagesschau.de"],
      ["Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat.", "http://www.mi.fu-berlin.de/inf/"],
      ["Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", "http://www.fu-berlin.de"]
    ];
  });
