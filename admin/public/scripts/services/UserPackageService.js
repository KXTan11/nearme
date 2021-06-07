angular.module('app').factory('UserPackage', function ($q) {

  var UserPackage = Parse.Object.extend('UserPackage', {

    isPaid: function () {
      return this.status === 'paid';
    },

    isUnpaid: function () {
      return this.status === 'unpaid';
    }

  }, {

    getInstance: function () {
      return this;
    },

    all: function (params) {

      var defer = $q.defer();

      const clonedParams = Object.assign({}, params)

      if (params.user) {
        clonedParams.user = params.user.toPointer();
      }

      Parse.Cloud.run('getUserPackages', clonedParams).then(function (res) {
        defer.resolve(res);
      }, function (err) {
        defer.reject(err);
      });

      return defer.promise;
    },

    count: function (params) {

      var defer = $q.defer();
      var query = new Parse.Query(this);

      if (params && params.canonical) {
        query.contains('canonical', params.canonical);
      }

      if (params && params.status) {
        query.equalTo('status', params.status);
      }

      if (params && params.user) {
        query.equalTo('user', params.user);
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

  Object.defineProperty(UserPackage.prototype, 'package', {
    get: function () {
      return this.get('package');
    },
    set: function (val) {
      this.set('package', val);
    }
  });

  Object.defineProperty(UserPackage.prototype, 'user', {
    get: function () {
      return this.get('user');
    },
    set: function (val) {
      this.set('user', val);
    }
  });

  Object.defineProperty(UserPackage.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  Object.defineProperty(UserPackage.prototype, 'charge', {
    get: function () {
      return this.get('charge');
    },
    set: function (val) {
      this.set('charge', val);
    }
  });

  Object.defineProperty(UserPackage.prototype, 'deletedAt', {
    get: function () {
      return this.get('deletedAt');
    },
    set: function (val) {
      this.set('deletedAt', val);
    }
  });

  return UserPackage;

});