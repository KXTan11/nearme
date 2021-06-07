'use strict';
angular.module('app').factory('Review', function () {

  var Review = Parse.Object.extend('Review', {

  }, {

    save: function (obj) {
      return obj.save();
    },

    destroy: function (obj) {
      return obj.destroy();
    },

    count: function () {
      var query = new Parse.Query(this);
      return query.count();
    },

    all: function (params) {

      var query = new Parse.Query(this);

      query.descending('createdAt');
      query.include(['user', 'place']);
      query.limit(params.limit);
      query.skip((params.page * params.limit) - params.limit);
      return query.find();
    },

  });

  Object.defineProperty(Review.prototype, 'user', {
    get: function () {
      return this.get('user');
    }
  });

  Object.defineProperty(Review.prototype, 'place', {
    get: function () {
      return this.get('place');
    }
  });

  Object.defineProperty(Review.prototype, 'comment', {
    get: function () {
      return this.get('comment');
    }
  });

  Object.defineProperty(Review.prototype, 'rating', {
    get: function () {
      return this.get('rating');
    }
  });

  Object.defineProperty(Review.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (val) {
      this.set('status', val);
    }
  });

  return Review;

});