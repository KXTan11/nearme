angular.module('app').controller('AppConfigCtrl',
  function ($scope, Toast, $mdDialog, $translate, AppConfig, Auth) {

    Auth.ensureLoggedIn().then(function () {
      AppConfig.loadOne().then(function (appConfig) {
        $scope.obj = appConfig || new AppConfig;
        $scope.$apply();
      });
    });

    $scope.onReviewEnabledChange = function () {

      if ($scope.obj && $scope.obj.reviews) {

        if ($scope.obj.reviews.disabled) {
          $scope.obj.reviews.autoApprove = false;
          $scope.obj.reviews.multiplePerUser = false;
        }

        $scope.obj.reviews = $scope.obj.reviews;
        
      }
    };

    $scope.onSearchRadiusChanged = function () {

      if ($scope.obj && $scope.obj.places) {

        if (!$scope.obj.places.searchRadius) {
          $scope.obj.places = $scope.obj.places;
        }
      }
    };

    $scope.onSave = function () {

      $scope.isSaving = true;

      $scope.obj.save().then(function () {
        $translate('SAVED').then(function (str) {
          Toast.show(str);
        });
        $scope.isSaving = false;
        $scope.$apply();
      }, function (error) {
        Toast.show(error.message);
        $scope.isSaving = false;
        $scope.$apply();
      });

    };

    $scope.hide = function () {
      $mdDialog.cancel();
    };

  });