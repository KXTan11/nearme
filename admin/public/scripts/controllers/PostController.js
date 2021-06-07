angular.module('app')
  .controller('PostCtrl', function ($scope, $mdDialog, $translate, Post, Toast, Auth) {

    $scope.posts = [];
    $scope.rowOptions = [5, 25, 50, 100];
    $scope.query = {
      canonical: '',
      limit: 25,
      page: 1,
      total: 0,
    };

    $scope.onRefreshTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Post.all($scope.query).then(function (posts) {
          $scope.posts = posts;
          $scope.$apply();
        });

      });
    };

    $scope.onCountTable = function () {
      Auth.ensureLoggedIn().then(function () {
        $scope.promise = Post.count($scope.query).then(function (total) {
          $scope.query.total = total;
          $scope.$apply();
        });
      });
    }

    $scope.onRefreshTable();
    $scope.onCountTable();

    $scope.onRefresh = function () {
      $scope.query.page = 1;
      $scope.onRefreshTable();
      $scope.onCountTable();
    };

    $scope.onReorder = function (field) {

      var indexOf = field.indexOf('-');
      var field1 = indexOf === -1 ? field : field.slice(1, field.length);
      $scope.query.orderBy = indexOf === -1 ? 'asc' : 'desc';
      $scope.query.orderByField = field1;
      $scope.onRefreshTable();
    };

    $scope.onPaginationChange = function (page, limit) {
      $scope.query.page = page;
      $scope.query.limit = limit;
      $scope.onRefreshTable();
    };

    $scope.onEdit = function (event, obj) {

      $mdDialog.show({
        controller: 'DialogPostController',
        scope: $scope.$new(),
        templateUrl: '/views/partials/post.html',
        parent: angular.element(document.body),
        locals: {
          obj: obj || null
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

      $translate(['DELETE', 'CONFIRM_DELETE', 'CONFIRM', 'CANCEL', 'DELETED'])
        .then(function (str) {

          var confirm = $mdDialog.confirm()
            .title(str.DELETE)
            .textContent(str.CONFIRM_DELETE)
            .ariaLabel(str.DELETE)
            .ok(str.CONFIRM)
            .cancel(str.CANCEL);

          $mdDialog.show(confirm).then(function () {

            Post.delete(obj).then(function () {

              $translate('DELETED').then(function (str) {
                Toast.show(str);
              });

              $scope.onRefreshTable();
              $scope.onCountTable();
              $scope.$apply();
            }, function (error) {
              Toast.show(error.message);
              $scope.$apply();
            });

          });
        });
    };

  }).controller('DialogPostController', function (Post, File, Place, $scope, $mdDialog,
    $translate, Toast, obj) {

    $scope.obj = obj || new Post;

    $scope.tinymceOptions = {
      height: 500,
      skin: 'lightgray',
      theme: 'modern',
      content_style: "img { max-width: 100%; height: auto; }",
      image_dimensions: false,
      media_dimensions: false,
      media_live_embeds: true,
      file_picker_types: 'image media',
      relative_urls: false,
      remove_script_host: false,
      file_picker_callback: function (cb, value, meta) {

        var input = document.createElement('input');
        input.setAttribute('type', 'file');

        if (meta.filetype == 'image') {
          input.setAttribute('accept', 'image/*');
        }

        if (meta.filetype == 'media') {
          input.setAttribute('accept', 'video/*');
        }

        input.onchange = function () {
          var file = this.files[0];

          File.upload(file, file.name).then(function (savedFile) {
            cb(savedFile.url(), {
              title: savedFile.name()
            });
          })

        };

        input.click();
      },
      extended_valid_elements: 'iframe[src|width|height|name|align|frameborder|scrolling]',
      plugins: 'link image code media imagetools hr table lists searchreplace wordcount visualblocks visualchars code fullscreen emoticons',
      toolbar: 'formatselect | bold italic strikethrough forecolor backcolor | link image media emoticons | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat'
    };

    $scope.queryPlaces = function (query) {
      var query = query || '';
      return Place.all({
        canonical: query.toLowerCase(),
        status: 'Approved'
      });
    };

    $scope.onCancel = function () {
      if ($scope.obj.dirty()) $scope.obj.revert();
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
    };

    $scope.onSubmit = function () {

      $scope.isSaving = true;

      Post.save($scope.obj).then(function () {
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