angular.module('app').controller('SlideIntroCtrl',
  function (SlideIntro, $scope, $mdDialog, $translate, Toast, Auth) {

    $scope.rowOptions = [5, 25, 50, 100];
    $scope.slides = [];

    $scope.query = {
      limit: 25,
      page: 1,
      total: 0,
    };

    $scope.onRefreshTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = SlideIntro.all($scope.query).then(function (slides) {
          $scope.slides = slides;
          $scope.$apply();
        });
      });
    };

    $scope.onCountTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = SlideIntro.count($scope.query).then(function (total) {
          $scope.query.total = total;
          $scope.$apply();
        });
      });
    };

    $scope.onRefreshTable();
    $scope.onCountTable();

    $scope.onReload = function () {
      $scope.query.page = 1;
      $scope.onRefreshTable();
      $scope.onCountTable();
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      $scope.onRefreshTable();
    };

    $scope.onEdit = function (event, obj) {
      $mdDialog.show({
        controller: 'DialogSlideIntroController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/slide.html',
        parent: angular.element(document.body),
        locals: {
          obj: obj
        },
        clickOutsideToClose: false

      }).then(function (response) {
        if (response) {
          $scope.onRefreshTable();
          $scope.onCountTable();
        }
      });
    };

    $scope.onDelete = function (ev, obj) {

      $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED']).then(function (str) {

        var confirm = $mdDialog.confirm()
          .title(str.DELETE)
          .textContent(str.CONFIRM_DELETE)
          .ariaLabel(str.DELETE)
          .ok(str.CONFIRM)
          .cancel(str.CANCEL);

        $mdDialog.show(confirm).then(function () {

          SlideIntro.delete(obj).then(function () {

            $translate('DELETED').then(function (str) {
              Toast.show(str);
            });

            $scope.onRefreshTable();
            $scope.onCountTable();
          }, function (error) {
            Toast.show(error.message);
          });
        });
      });
    };

  }).controller('DialogSlideIntroController', function (SlideIntro, File, $scope, $translate, $mdDialog, Toast, obj) {

    $scope.obj = obj || new SlideIntro;

    $scope.onClose = function () {
      $mdDialog.cancel();
    };

    $scope.uploadImage = function (file) {

      if (file === null || file.type.match(/image.*/) === null) {
        return $translate('FILE_NOT_SUPPORTED').then(function (str) {
          Toast.show(str);
        });
      }

      $scope.isUploading = true;

      File.upload(file).then(function (savedFile) {
        $scope.obj.image = savedFile;
        $scope.isUploading = false;
        $scope.$apply();

        $translate('FILE_UPLOADED').then(function (str) {
          Toast.show(str);
        });

      }, function (error) {
        Toast.show(error.message);
        $scope.isUploading = false;
        $scope.$apply();
      });

    }

    $scope.onSubmit = function () {

      $scope.isSaving = true;

      SlideIntro.save($scope.obj).then(function () {
        $scope.isSaving = false;
        $mdDialog.hide($scope.obj);
        $scope.$apply();

        $translate('SAVED').then(function (str) {
          Toast.show(str);
        });

      }, function (error) {
        $scope.isSaving = false;
        Toast.show(error.message);
        $scope.$apply();
      });

    };

  });