var gohyper = angular.module('gohyper', []);

gohyper.controller('ExtensionController', function ($scope) {

    $scope.tags = [];
    $scope.push = function (input) {
      if ($scope.tags.indexOf(input) == -1) {
        $scope.tags.push(input);
      }
      $scope.input= "";
    };

    // dummy data
    $scope.data = [["Lorem ipsum dolor sit amet [...].", "http://www.tagesschau.de"],
      ["Lorem ipsum dolor sit amet [...].", "http://www.mi.fu-berlin.de/inf/"]
    ];

  });
