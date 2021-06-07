angular.module('app')
  .controller('UserCtrl', function(User, $scope, $translate, $mdDialog, Toast, Auth) {

    // Pagination options.
    $scope.rowOptions = [5, 25, 50, 100];

    $scope.query = {
      canonical: '',
      limit: 25,
      page: 1,
      total: 0
    }

    $scope.users = [];

    var loadUsers = function() {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = User.all($scope.query).then(function (data) {
          $scope.users = data.users;
          $scope.query.total = data.total;
          $scope.$apply();
        });
      });
    }

    $scope.onInit = function (type) {
      $scope.query.type = type;
      loadUsers();
    };

   	$scope.onRefresh = function () {
   		$scope.query.page = 1;
   		loadUsers();
   	}

   	$scope.onPaginationChange = function (page, limit) {
   		$scope.query.page = page;
   		$scope.query.limit = limit;
   		loadUsers();
   	}

    $scope.onEdit = function(ev, obj) {

      $mdDialog.show({
          controller: 'DialogUserController',
          templateUrl: '/views/partials/user.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            obj: obj || null
          },
          clickOutsideToClose: true
        }).then(function (response) {
          if (response) {
            loadUsers();
          }
        });
    }

    $scope.onDelete = function (ev, user) {

      $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED']).then(function(str) {
        
        var confirm = $mdDialog.confirm()
          .title(str.DELETE)
          .textContent(str.CONFIRM_DELETE)
          .ariaLabel(str.DELETE)
          .ok(str.CONFIRM)
          .cancel(str.CANCEL);
        $mdDialog.show(confirm).then(function() {
  
          User.delete({ id: user.id }).then(function() {
            $translate('DELETED').then(function(str) {
              Toast.show(str);
            });
            loadUsers();
          }, function (error) {
            Toast.show(error.message);
          });
        });
  
      });
    };

  }).controller('DialogUserController',
    function(User, File, $scope, $translate, $mdDialog, Toast, obj) {

    $scope.obj = obj || {};

    $scope.uploadImage = function (file) {

      if (file === null || file.type.match(/image.*/) === null) {
				return $translate('FILE_NOT_SUPPORTED').then(function(str) {
          Toast.show(str);
        });
			}

      $scope.isUploading = true;

      File.upload(file).then(function(savedFile) {
        $scope.obj.photo = savedFile;
        $scope.isUploading = false;
        $scope.$apply();
      }, function(error) {

        Toast.show(error.message);
        $scope.isUploading = false;
        $scope.$apply();
      });
    }

    $scope.onSubmit = function () {

      if ($scope.obj.password && $scope.obj.password.length < 6) {
        return $translate('PASSWORD_AT_LEAST_SIX_CHARACTERS').then(function(str) {
          Toast.show(str);
        });
      }

      $scope.isSaving = true;

      User.save($scope.obj).then(function(user) {
        $translate('SAVED').then(function(str) {
          Toast.show(str);
        });
        $mdDialog.hide(user);
        $scope.isSaving = false;
        $scope.$apply();
      }, function(error) {
        Toast.show(error.message);
        $scope.isSaving = false;
        $scope.$apply();
      });
      
    }

    $scope.onClose = function() {
			$mdDialog.cancel();
    }

  });
