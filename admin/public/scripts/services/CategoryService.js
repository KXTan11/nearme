angular.module('app').factory('Category', function () {

  var Category = Parse.Object.extend('Category', {

    isActive: function () {
      return this.status === 'Active';
    },

    isInactive: function () {
      return this.status === 'Inactive';
    }

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

      if (params && params.isFeatured) {
        query.equalTo('isFeatured', params.isFeatured);
      }

      if (params.exclude) {
        query.notContainedIn('objectId', params.exclude);
      }

      if (params && params.limit && params.page) {
        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
      }

      if (params && params.orderBy === 'asc') {
        query.ascending(params.orderByField);
      } else if (params && params.orderBy === 'desc') {
        query.descending(params.orderByField);
      } else {
        query.descending('createdAt');
      }

      query.doesNotExist('deletedAt');

      return query.find();
    },

    count: function (params) {

      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
      }

      if (params && params.isFeatured) {
        query.equalTo('isFeatured', params.isFeatured);
      }

      query.doesNotExist('deletedAt');

      return query.count()

    },

    save: function (obj) {
      return obj.save();
    },

    delete: function (obj) {
      obj.deletedAt = new Date;
      return obj.save()
    }

  });


  Object.defineProperty(Category.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (val) {
      this.set('title', val);
    }
  });

  Object.defineProperty(Category.prototype, 'isFeatured', {
    get: function () {
      return this.get('isFeatured');
    },
    set: function (val) {
      this.set('isFeatured', val);
    }
  });

  Object.defineProperty(Category.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  Object.defineProperty(Category.prototype, 'deletedAt', {
    get: function () {
      return this.get('deletedAt');
    },
    set: function (val) {
      this.set('deletedAt', val);
    }
  });

  Object.defineProperty(Category.prototype, 'image', {
    get: function () {
      return this.get('image');
    },
    set: function (val) {
      this.set('image', val);
    }
  });

  Object.defineProperty(Category.prototype, 'imageThumb', {
    get: function () {
      return this.get('imageThumb');
    },
    set: function (val) {
      this.set('imageThumb', val);
    }
  });

  Object.defineProperty(Category.prototype, 'order', {
    get: function () {
      return this.get('order');
    },
    set: function (val) {
      this.set('order', val);
    }
  });

  
  Category.prototype.toString = function () {
    return this.title;
  };

  return Category;

});