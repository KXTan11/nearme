angular.module('app')
  .controller('SliderImageCtrl', function (SliderImage, $scope, $mdDialog, $translate, Toast, Auth) {

    $scope.rowOptions = [5, 25, 50, 100];
    $scope.sliderImages = [];

    $scope.query = {
      limit: 25,
      page: 1,
      total: 0,
    };

    $scope.onRefreshTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = SliderImage.all($scope.query).then(function (slider) {
          $scope.sliderImages = slider;
          $scope.$apply();
        });
      });
    };

    $scope.onCountTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = SliderImage.count($scope.query).then(function (total) {
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
        controller: 'DialogSliderController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/slider-image.html',
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

          SliderImage.delete(obj).then(function () {

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

    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

  }).controller('DialogSliderController', function (SliderImage, Place, Category, Post, File, $scope, $translate, $mdDialog, Toast, obj) {

    $scope.obj = obj || new SliderImage;

    if ($scope.obj.isNew()) {
      $scope.obj.type = null;
    }

    $scope.onTypeChanged = function () {
      $scope.obj.place = null;
      $scope.obj.post = null;
      $scope.obj.category = null;
      $scope.obj.url = null;
    };

    $scope.queryPlaces = function (query) {
      var query = query || '';
      return Place.all({
        canonical: query.toLowerCase(),
        status: 'Approved',
        orderBy: 'asc',
        orderByField: 'title',
      });
    };

    $scope.queryPosts = function (query) {
      var query = query || '';
      return Post.all({
        canonical: query.toLowerCase(),
        status: 'Active',
        orderBy: 'asc',
        orderByField: 'title',
      });
    };

    $scope.queryCategories = function (query) {
      var query = query || '';
      return Category.all({
        canonical: query.toLowerCase(),
        status: 'Active',
        orderBy: 'asc',
        orderByField: 'title'
      });
    };

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

      SliderImage.save($scope.obj).then(function () {
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