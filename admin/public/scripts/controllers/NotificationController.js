angular.module('app').controller('NotificationCtrl',
  function ($scope, $translate, $mdDialog, Auth, Notification, Category, Toast, NgMap, Place, Post, User) {

    $scope.notification = new Notification;
    $scope.notification.radius = 10;
    $scope.notification.latitude = 0;
    $scope.notification.longitude = 0;
    $scope.notification.address = '';

    $scope.notifications = [];

    $scope.place = null;
    $scope.autocompleteOptions = {};
    $scope.circles = {};

    $scope.coords = [0, 0];

    var circle, map;

    $scope.loadNotifications = function () {
      Auth.ensureLoggedIn().then(function () {
        Notification.all().then(function (notifications) {
          $scope.notifications = notifications;
          $scope.$apply();
        });
      });
    };

    $scope.loadNotifications();

    $scope.onAttachmentTypeChanged = function () {
      $scope.notification.place = null;
      $scope.notification.post = null;
      $scope.notification.category = null;
    };

    $scope.queryPlaces = function (query) {
      var query = query || '';
      return Place.all({
        canonical: query.toLowerCase(),
        status: 'Approved',
        orderBy: 'asc',
        orderByField: 'name',
      });
    };

    $scope.queryPosts = function (query) {
      var query = query || '';
      return Post.all({
        canonical: query.toLowerCase(),
        status: 'Active',
        orderBy: 'asc',
        orderByField: 'name',
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

    $scope.queryUsers = function (query) {
      var query = query || '';
      var ids = $scope.notification.users.map(function (user) {
        return user.id
      });
      return User.all({
        canonical: query.toLowerCase(),
        exclude: ids,
        orderBy: 'asc',
        type: 'customer',
        orderByField: 'name',
        limit: 10,
        page: 1,
      }).then(function (data) {
        return data.users;
      });
    };

    $scope.$watch(function (scope) {
      return scope.place;
    }, function (value) {

      if (value) {

        var location = value.geometry.location;
        location = new google.maps.LatLng(location.lat(), location.lng());

        map.setCenter(location);
        map.setZoom(11);

        $scope.notification.latitude = location.lat();
        $scope.notification.longitude = location.lng();
        $scope.notification.radius = 10;
        $scope.notification.address = value.formatted_address;

        $scope.coords = [
          $scope.notification.latitude,
          $scope.notification.longitude
        ];
      }
    });

    $scope.canShowCircle = function () {
      return $scope.notification.radius > 0 &&
        $scope.notification.latitude > 0 &&
        $scope.notification.longitude > 0;
    };

    $scope.onChangeType = function () {

      if ($scope.notification.type === 'All') {

        $scope.place = null;

        $scope.notification.latitude = 0;
        $scope.notification.longitude = 0;
        $scope.notification.radius = 10;
        $scope.notification.address = '';

        $scope.coords = [0, 0];

        map.setCenter({
          lat: 0, lng: 0
        });

        map.setZoom(2);
      }
    };

    $scope.onDeleteNotification = function (notification) {

      $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED'])
        .then(function (str) {

          var confirm = $mdDialog.confirm()
            .title(str.DELETE)
            .textContent(str.CONFIRM_DELETE)
            .ariaLabel(str.DELETE)
            .ok(str.CONFIRM)
            .cancel(str.CANCEL);

          $mdDialog.show(confirm).then(function () {

            notification.destroy().then(function () {
              $translate('DELETED').then(function (str) {
                Toast.show(str);
              });
              $scope.$apply();
              $scope.loadNotifications();
            }, function (error) {
              $scope.$apply();
              Toast.show(error.message)
            });
          });
        });
    };

    NgMap.getMap().then(function (objMap) {
      map = objMap;
      circle = objMap.shapes.circle;
    });

    $scope.onShapeDragEnd = function (ev) {

      var lat = ev.latLng.lat();
      var lng = ev.latLng.lng();

      $scope.notification.latitude = lat;
      $scope.notification.longitude = lng;
    };

    $scope.onShapeCenterChanged = function () {
      if (!circle) return;
      var lat = circle.center.lat();
      var lng = circle.center.lng();

      $scope.notification.latitude = lat;
      $scope.notification.longitude = lng;
    };

    $scope.onShapeRadiusChanged = function () {
      if (!circle) return;
      var radius = circle.radius;
      $scope.notification.radius = (radius / 1000);
    };

    $scope.onInputLocationChanged = function () {

      if ($scope.notification.latitude && $scope.notification.longitude && map) {

        map.setCenter(new google.maps.LatLng(
          $scope.notification.latitude,
          $scope.notification.longitude
        ));

        map.setZoom(11);

        $scope.coords = [$scope.notification.latitude, $scope.notification.longitude];
      }
    }

    $scope.onSubmit = function () {

      $scope.isSending = true;

      if ($scope.notification.type === 'Geo') {
        $scope.notification.bounds = circle.getBounds().toJSON();
      }

      Notification.save($scope.notification).then(function () {

        $translate('SENT').then(function (str) {
          Toast.show(str);
        });

        $scope.notifications.unshift($scope.notification);

        $scope.notification = new Notification;
        $scope.notification.radius = 10;
        $scope.notification.latitude = 0;
        $scope.notification.longitude = 0;
        $scope.notification.address = '';

        $scope.isSending = false;
        $scope.form.$setUntouched();
        $scope.form.$setPristine();
        $scope.$apply();
      }, function (error) {
        Toast.show(error.message);
        $scope.isSending = false;
        $scope.$apply();
      });
    }

  });