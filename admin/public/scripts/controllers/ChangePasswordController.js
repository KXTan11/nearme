'use strict';

angular.module('app')
.controller('ChangePasswordController',
function ($scope, Toast, $mdDialog, $translate, User, Auth) {

    $scope.formData = {};

    $scope.user = Auth.getLoggedUser();

    $scope.onSave = function () {

      if ($scope.formData.newPassword !== $scope.formData.confirmedPassword) {
        $translate('PASSWORD_DOESNT_MATCH').then(function(str) {
          Toast.show(str);
        });
        return;
      }

      if ($scope.formData.newPassword.length < 6) {
        $translate('PASSWORD_AT_LEAST_SIX_CHARACTERS').then(function(str) {
          Toast.show(str);
        });
        return;
      }

      $scope.isSaving = true;

      Auth.logIn($scope.user.getUsername(), $scope.formData.oldPassword)
        .then(function () {
          $scope.user.password = $scope.formData.newPassword;
          return User.save($scope.user);
        }).then(function () {
          $translate('SAVED').then(function(str) {
            Toast.show(str);
          });
          $scope.onClose();
          $scope.isSaving = false;
          $scope.$apply();
        }, function () {
          $translate('CURRENT_PASS_INVALID').then(function(str) {
            Toast.show(str);
          });
          $scope.isSaving = false;
          $scope.$apply();
        });
    };

    $scope.onClose = function () {
      $mdDialog.cancel();
    };

  });