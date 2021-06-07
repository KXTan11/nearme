'use strict';

 angular.module('app').controller('MainCtrl',
  function ($scope, $mdSidenav, $translate, $mdDialog) {
  
  $scope.toggle = function () {
    $mdSidenav('leftMenu').toggle();
  };

  $scope.onChangeLang = function (lang) {
    $translate.use(lang);
  };

  $scope.openMenu = function ($mdMenu, ev) {
    $mdMenu.open(ev);
  };

  $scope.onPresentAppConfigView = function (ev) {
    $mdDialog.show({
      controller: 'AppConfigCtrl',
      templateUrl: '/views/partials/app-config.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

  $scope.onChangePassword = function (ev) {

    $mdDialog.show({
      controller: 'ChangePasswordController',
      templateUrl: '/views/partials/change-password.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

});
