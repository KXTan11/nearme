angular.module('app')
  .controller('PackageCtrl', function ($scope, $mdDialog, $translate, Package, Toast, Auth) {

    $scope.rowOptions = [5, 25, 50, 100];
    $scope.packages = [];

    $scope.query = {
      canonical: '',
      limit: 25,
      page: 1,
      total: 0,
    };

    $scope.onRefreshTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Package.all($scope.query)
          .then(function (packages) {
            $scope.packages = packages;
          });
      });
    };

    $scope.onCountTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Package.count($scope.query)
          .then(function (total) {
            $scope.query.total = total
          });
      });
    };

    $scope.onRefreshTable();
    $scope.onCountTable();

    $scope.onRefresh = function () {
      $scope.onRefreshTable();
      $scope.onCountTable();
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      $scope.onRefreshTable();
    };

    $scope.onReorder = function (field) {

      var indexOf = field.indexOf('-');
      var field1 = indexOf === -1 ? field : field.slice(1, field.length);
      $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
      $scope.query.orderByField = field1;
      $scope.onRefreshTable();
    };

    $scope.onChangeStatus = function (obj, status) {
      obj.status = status;
      Package.save(obj).then(function () {
        $translate('SAVED').then(function (str) {
          Toast.show(str);
        });
        $scope.onRefreshTable();
        $scope.onCountTable();
      });
    };

    $scope.onEdit = function (event, obj) {

      $mdDialog.show({
        controller: 'DialogPackageController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/package.html',
        parent: angular.element(document.body),
        locals: { obj },
        clickOutsideToClose: false

      }).then(function (response) {
        if (response) {
          $scope.onRefreshTable();
          $scope.onCountTable();
        }
      });
    };

    $scope.onDelete = function (event, obj) {

      $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED'])
        .then(function (str) {

          var confirm = $mdDialog.confirm()
            .title(str.DELETE)
            .textContent(str.CONFIRM_DELETE)
            .ariaLabel(str.DELETE)
            .ok(str.CONFIRM)
            .cancel(str.CANCEL);

          $mdDialog.show(confirm).then(function () {

            Package.delete(obj).then(function () {
              $translate('DELETED').then(function (str) {
                Toast.show(str);
              });
              $scope.onRefreshTable();
              $scope.onCountTable();
            }, function (error) {
              Toast.show(error.message)
            });
          });
        });
    }

  }).controller('DialogPackageController', function (Package, File, $scope, $translate, $mdDialog, Toast, obj) {

    $scope.obj = obj || new Package;

    $scope.onClose = function () {
      if ($scope.obj.dirty()) $scope.obj.revert();
      $mdDialog.cancel();
    };

    $scope.onChangeType = function () {
      if ($scope.obj.type === 'paid_listing') {
        $scope.obj.listingLimit = null;
      } else if ($scope.obj.type === 'promote_listing') {
        $scope.obj.listingLimit = 1;
        $scope.obj.markListingAsFeatured = false;
        $scope.obj.autoApproveListing = false;
        $scope.obj.disableMultiplePurchases = false;
      }
    }

    $scope.uploadImage = function (file) {

      if (file) {

        $scope.isUploading = true;

        File.upload(file).then(function (savedFile) {
          $scope.obj.image = savedFile;
          $scope.isUploading = false;
          $translate('FILE_UPLOADED').then(function (str) {
            Toast.show(str);
          });

        }, function (error) {
          Toast.show(error.message);
          $scope.isUploading = false;
        });
      }
    }

    $scope.onSubmit = function (isFormValid) {

      if (!isFormValid) {
        return $translate('FILL_FIELDS').then(function (str) {
          Toast.show(str);
        });
      }

      $scope.isSaving = true;

      Package.save($scope.obj).then(function () {
        $scope.isSaving = false;
        $mdDialog.hide($scope.obj);
        $translate('SAVED').then(function (str) {
          Toast.show(str);
        });
      }, function (error) {
        $scope.isSaving = false;
        Toast.show(error.message);
      });
    };

  });