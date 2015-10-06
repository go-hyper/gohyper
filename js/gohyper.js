var gohyper = angular.module('gohyper', []);

gohyper.controller('ExtensionController', function ($scope) {

    $scope.tags = ["Test", "abc"];
    $scope.push = function (input) {
      $scope.tags.push(input);
      $scope.input= "";
    };
    console.log($scope.tags);

  });
