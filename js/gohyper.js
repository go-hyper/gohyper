var gohyper = angular.module('gohyper', []);

gohyper.controller('ExtensionController', function ($scope) {

    $scope.tags = [];
    $scope.push = function (input) {
      $scope.tags.push(input);
      $scope.input= "";
    };

  });
