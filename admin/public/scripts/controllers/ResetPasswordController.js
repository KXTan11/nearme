'use strict';

angular.module('app').controller('ResetPasswordCtrl',
  function($scope, $mdDialog, Auth) {

  $scope.isLoading = false;

  var showDialog = function (title, message, ev) {

    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.body))
        .clickOutsideToClose(true)
        .title(title)
        .content(message)
        .ariaLabel('Alert Dialog')
        .ok('Ok')
        .targetEvent(ev)
    );
  }

	$scope.onResetPassword = function (isFormValid) {

		if (isFormValid) {

      $scope.isLoading = true;
      Auth.resetPassword($scope.email).then(function () {
        $scope.isLoading = false;
        showDialog('Success', 'Check your email to reset your password');
        $scope.$apply();
      }, function (error) {
        $scope.isLoading = false;
        showDialog('Error', error.message);
        $scope.$apply();
      })
		}
	}

});
