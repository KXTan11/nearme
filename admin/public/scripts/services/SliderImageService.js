angular.module('app').factory('SliderImage', function () {

  var SliderImage = Parse.Object.extend('SliderImage', {}, {


    all: function (params) {

      var query = new Parse.Query(this);

      if (params && params.limit && params.page) {
        query.limit(params.limit);
        query.skip((params.page * params.limit) - params.limit);
      }

      query.include('place', 'post', 'category');
      query.ascending('sort');

      return query.find();
    },

    count: function () {
      var query = new Parse.Query(this);
      return query.count();
    },

    save: function (obj) {
      return obj.save()
    },

    delete: function (obj) {
      return obj.destroy()
    }

  });

  Object.defineProperty(SliderImage.prototype, 'sort', {
    get: function () {
      return this.get('sort');
    },
    set: function (val) {
      this.set('sort', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'image', {
    get: function () {
      return this.get('image');
    },
    set: function (val) {
      this.set('image', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'isActive', {
    get: function () {
      return this.get('isActive');
    },
    set: function (val) {
      this.set('isActive', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'type', {
    get: function () {
      return this.get('type');
    },
    set: function (val) {
      this.set('type', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'place', {
    get: function () {
      return this.get('place');
    },
    set: function (val) {
      this.set('place', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'post', {
    get: function () {
      return this.get('post');
    },
    set: function (val) {
      this.set('post', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'category', {
    get: function () {
      return this.get('category');
    },
    set: function (val) {
      this.set('category', val);
    }
  });

  Object.defineProperty(SliderImage.prototype, 'url', {
    get: function () {
      return this.get('url');
    },
    set: function (val) {
      this.set('url', val);
    }
  });

  return SliderImage;

});