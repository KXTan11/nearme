angular.module('app').factory('AppConfig', function () {

  var AppConfig = Parse.Object.extend('AppConfig', {
    initialize: function () {
      this.email = {};
      this.about = {};
      this.reviews = {};
    }
  }, {

    loadOne: function () {
      var query = new Parse.Query('AppConfig');
      return query.first();
    }
  });

  Object.defineProperty(AppConfig.prototype, 'email', {
    get: function () {
      return this.get('email');
    },
    set: function (val) {
      this.set('email', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'about', {
    get: function () {
      return this.get('about');
    },
    set: function (val) {
      this.set('about', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'reviews', {
    get: function () {
      return this.get('reviews');
    },
    set: function (val) {
      this.set('reviews', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'places', {
    get: function () {
      return this.get('places');
    },
    set: function (val) {
      this.set('places', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'slides', {
    get: function () {
      return this.get('slides');
    },
    set: function (val) {
      this.set('slides', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'adMob', {
    get: function () {
      return this.get('adMob');
    },
    set: function (val) {
      this.set('adMob', val);
    }
  });

  Object.defineProperty(AppConfig.prototype, 'auth', {
    get: function () {
      return this.get('auth');
    },
    set: function (val) {
      this.set('auth', val);
    }
  });

  return AppConfig;

});