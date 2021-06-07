angular.module('app').factory('Post', function () {

  var Post = Parse.Object.extend('Post', {

  }, {

    getInstance: function () {
      return this;
    },

    all: function (params) {

      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
      }

      if (params && params.status) {
        query.equalTo('status', params.status);
      }

      if (params && params.limit && params.page) {
        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
      }

      if (params && params.orderBy == 'asc') {
        query.ascending(params.orderByField);
      } else if (params && params.orderBy == 'desc') {
        query.descending(params.orderByField);
      } else {
        query.descending('createdAt');
      }

      query.include('place');

      return query.find();

    },

    count: function (params) {

      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
      }

      return query.count()

    },

    save: function (obj) {
      return obj.save()
    },

    delete: function (obj) {
      return obj.destroy()
    }

  });

  Object.defineProperty(Post.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (val) {
      this.set('title', val);
    }
  });

  Object.defineProperty(Post.prototype, 'body', {
    get: function () {
      return this.get('body');
    },
    set: function (val) {
      this.set('body', val);
    }
  });

  Object.defineProperty(Post.prototype, 'image', {
    get: function () {
      return this.get('image');
    },
    set: function (val) {
      this.set('image', val);
    }
  });

  Object.defineProperty(Post.prototype, 'imageThumb', {
    get: function () {
      return this.get('imageThumb');
    },
    set: function (val) {
      this.set('imageThumb', val);
    }
  });

  Object.defineProperty(Post.prototype, 'place', {
    get: function () {
      return this.get('place');
    },
    set: function (val) {
      this.set('place', val);
    }
  });

  Object.defineProperty(Post.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  Object.defineProperty(Post.prototype, 'htmlBody', {
    get: function () {
      return this.get('htmlBody');
    },
    set: function (val) {
      this.set('htmlBody', val);
    }
  });

  Object.defineProperty(Post.prototype, 'isPushEnabled', {
    get: function () {
      return this.get('isPushEnabled');
    },
    set: function (val) {
      this.set('isPushEnabled', val);
    }
  });

  Post.prototype.toString = function () {
    return this.title;
  };

  return Post;

});