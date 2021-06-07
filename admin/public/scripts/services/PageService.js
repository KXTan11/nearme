angular.module('app').factory('Page', function ($q) {

  var Page = Parse.Object.extend('Page', {

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

  Object.defineProperty(Page.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (val) {
      this.set('title', val);
    }
  });

  Object.defineProperty(Page.prototype, 'content', {
    get: function () {
      return this.get('content');
    },
    set: function (val) {
      this.set('content', val);
    }
  });

  Object.defineProperty(Page.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  Object.defineProperty(Page.prototype, 'deletedAt', {
    get: function () {
      return this.get('deletedAt');
    },
    set: function (val) {
      this.set('deletedAt', val);
    }
  });

  return Page;

});