var gohyper = angular.module('gohyper', []);

gohyper.controller('ExtensionController', function ($scope) {

    $scope.tags = [];
    $scope.push = function (input) {
      if ($scope.tags.indexOf(input) == -1) {
        $scope.tags.push(input);
      }
      $scope.input= "";
    };

  });
