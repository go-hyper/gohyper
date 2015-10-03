var gohyper = angular.module('gohyper', []);

gohyper.controller('ExtensionController', function() {

    $scope.tags = ["Test", "Bla"];
    $scope.push = function (input) {
      $scope.tags.push(input);
      $scope.input= "";
    };

  });