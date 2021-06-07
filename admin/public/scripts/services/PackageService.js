angular.module('app').factory('Package', function ($q) {

  var Package = Parse.Object.extend('Package', {

    initialize: function () {
      this.type = 'paid_listing';
    },

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

      var defer = $q.defer();
      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
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

      query.find().then(function (objs) {
        defer.resolve(objs);
      }, function (error) {
        defer.reject(error);
      })

      return defer.promise;

    },

    count: function (params) {

      var defer = $q.defer();
      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
      }

      query.doesNotExist('deletedAt');

      query.count().then(function (count) {
        defer.resolve(count);
      }, function (error) {
        defer.reject(error);
      })

      return defer.promise;

    },

    save: function (obj) {

      var defer = $q.defer();

      obj.save().then(function (obj) {
        defer.resolve(obj);
      }, function (error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    delete: function (obj) {

      var defer = $q.defer();
      obj.deletedAt = new Date;
      obj.save().then(function (result) {
        defer.resolve(result);
      }, function (error) {
        defer.reject(error);
      });

      return defer.promise;

    }

  });

  Object.defineProperty(Package.prototype, 'name', {
    get: function () {
      return this.get('name');
    },
    set: function (val) {
      this.set('name', val);
    }
  });

  Object.defineProperty(Package.prototype, 'description', {
    get: function () {
      return this.get('description');
    },
    set: function (val) {
      this.set('description', val);
    }
  });

  Object.defineProperty(Package.prototype, 'sort', {
    get: function () {
      return this.get('sort');
    },
    set: function (val) {
      this.set('sort', val);
    }
  });

  Object.defineProperty(Package.prototype, 'price', {
    get: function () {
      return this.get('price');
    },
    set: function (val) {
      this.set('price', val);
    }
  });

  Object.defineProperty(Package.prototype, 'salePrice', {
    get: function () {
      return this.get('salePrice');
    },
    set: function (val) {
      this.set('salePrice', val);
    }
  });

  Object.defineProperty(Package.prototype, 'finalPrice', {
    get: function () {
      return this.get('finalPrice');
    },
    set: function (val) {
      this.set('finalPrice', val);
    }
  });

  Object.defineProperty(Package.prototype, 'disableMultiplePurchases', {
    get: function () {
      return this.get('disableMultiplePurchases');
    },
    set: function (val) {
      this.set('disableMultiplePurchases', val);
    }
  });

  Object.defineProperty(Package.prototype, 'listingLimit', {
    get: function () {
      return this.get('listingLimit');
    },
    set: function (val) {
      this.set('listingLimit', val);
    }
  });

  Object.defineProperty(Package.prototype, 'listingDuration', {
    get: function () {
      return this.get('listingDuration');
    },
    set: function (val) {
      this.set('listingDuration', val);
    }
  });

  Object.defineProperty(Package.prototype, 'markListingAsFeatured', {
    get: function () {
      return this.get('markListingAsFeatured');
    },
    set: function (val) {
      this.set('markListingAsFeatured', val);
    }
  });

  Object.defineProperty(Package.prototype, 'autoApproveListing', {
    get: function () {
      return this.get('autoApproveListing');
    },
    set: function (val) {
      this.set('autoApproveListing', val);
    }
  });

  Object.defineProperty(Package.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  Object.defineProperty(Package.prototype, 'type', {
    get: function () {
      return this.get('type');
    },
    set: function (val) {
      this.set('type', val);
    }
  });

  Object.defineProperty(Package.prototype, 'deletedAt', {
    get: function () {
      return this.get('deletedAt');
    },
    set: function (val) {
      this.set('deletedAt', val);
    }
  });

  return Package;

});