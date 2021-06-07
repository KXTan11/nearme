angular.module('app').factory('SlideIntro', function () {

  var SlideIntro = Parse.Object.extend('SlideIntro', {}, {

    all: function (params) {

      var query = new Parse.Query(this);

      if (params && params.limit && params.page) {
        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
      }

      query.ascending('sort');

      return query.find();

    },

    count: function () {
      var query = new Parse.Query(this);
      return query.count();
    },

    save: function (obj) {
      return obj.save();
    },

    delete: function (obj) {
      return obj.destroy();
    }

  });

  Object.defineProperty(SlideIntro.prototype, 'sort', {
    get: function () {
      return this.get('sort');
    },
    set: function (val) {
      this.set('sort', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'image', {
    get: function () {
      return this.get('image');
    },
    set: function (val) {
      this.set('image', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'isActive', {
    get: function () {
      return this.get('isActive');
    },
    set: function (val) {
      this.set('isActive', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (val) {
      this.set('title', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'text', {
    get: function () {
      return this.get('text');
    },
    set: function (val) {
      this.set('text', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'bgColor', {
    get: function () {
      return this.get('bgColor');
    },
    set: function (val) {
      this.set('bgColor', val);
    }
  });

  Object.defineProperty(SlideIntro.prototype, 'color', {
    get: function () {
      return this.get('color');
    },
    set: function (val) {
      this.set('color', val);
    }
  });

  return SlideIntro;

});