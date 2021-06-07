angular.module('app')
  .controller('UserPackageCtrl', function ($scope, $mdDialog, $translate, UserPackage, Auth, User) {

    $scope.rowOptions = [5, 25, 50, 100];
    $scope.userPackages = [];

    $scope.query = {
      canonical: '',
      status: null,
      user: null,
      limit: 25,
      page: 1,
      total: 0,
    };

    $scope.onRefreshTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = UserPackage.all($scope.query)
          .then(function (userPackages) {
            $scope.userPackages = userPackages;
          });
      });
    };

    $scope.onCountTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = UserPackage.count($scope.query)
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

    $scope.queryUsers = function (query) {
      var query = query || '';
      return User.all({
        canonical: query.toLowerCase(),
        orderBy: 'asc',
        type: 'customer',
        orderByField: 'name',
        limit: 10,
        page: 1,
      }).then(function (data) {
        return data.users;
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

            UserPackage.delete(obj).then(function () {
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
    };

    $scope.onChargeClicked = function (userPackage) {
      window.open('https://dashboard.stripe.com/payments/' + userPackage.charge.id, '_blank');
    };

  }).controller('DialogUserPackageController', function (UserPackage, $scope, $mdDialog, obj) {

    $scope.obj = obj || new UserPackage;

    $scope.onClose = function () {
      $mdDialog.cancel();
    };

  });