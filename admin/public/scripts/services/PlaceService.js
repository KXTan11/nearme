'use strict';

angular.module('app').factory('Place', function ($q, moment) {

  var Place = Parse.Object.extend('Place', {
    initialize: function () {
      this.images = [];
    }
  }, {

    getInstance: function () {
      return this;
    },

    save: function (obj) {
      return obj.save();
    },

    delete: function (obj) {
      return obj.destroy();
    },

    all: function (params) {

      var query = new Parse.Query(this);

      if (params.canonical != '') {
        query.contains('canonical', params.canonical);
      }

      if (params.category && params.category !== null) {
        query.equalTo('categories', params.category);
      }

      if (params.date && params.date !== null) {
        var start = moment(params.date).startOf('day');
        var end = moment(params.date).endOf('day');
        query.greaterThanOrEqualTo('createdAt', start.toDate());
        query.lessThanOrEqualTo('createdAt', end.toDate());
      }

      if (params.status && params.status !== null) {
        query.equalTo('status', params.status);
      }

      if (params.isFeatured && params.isFeatured !== null) {
        query.equalTo('isFeatured', params.isFeatured);
      }

      query.include('categories', 'userPackage')
      query.descending('createdAt');

      if (params && params.limit) {
        query.limit(params.limit);
      }

      if (params && params.limit && params.page) {
        query.skip((params.page * params.limit) - params.limit);
      }

      return query.find();
    },

    count: function (params) {

      var query = new Parse.Query(this);

      if (params.canonical != '') {
        query.contains('canonical', params.canonical);
      }

      if (params.category && params.category !== null) {
        query.equalTo('categories', params.category);
      }

      if (params.date && params.date !== null) {
        var start = moment(params.date).startOf('day');
        var end = moment(params.date).endOf('day');
        query.greaterThanOrEqualTo('createdAt', start.toDate());
        query.lessThanOrEqualTo('createdAt', end.toDate());
      }

      if (params.status && params.status !== null) {
        query.equalTo('status', params.status);
      }

      if (params.isFeatured && params.isFeatured !== null) {
        query.equalTo('isFeatured', params.isFeatured);
      }

      return query.count();
    }

  });

  Object.defineProperty(Place.prototype, 'category', {
    get: function () {
      return this.get('category');
    },
    set: function (value) {
      this.set('category', value);
    }
  });

  Object.defineProperty(Place.prototype, 'user', {
    get: function () {
      return this.get('user');
    },
    set: function (value) {
      this.set('user', value);
    }
  });

  Object.defineProperty(Place.prototype, 'title', {
    get: function () {
      return this.get('title');
    },
    set: function (value) {
      this.set('title', value);
    }
  });

  Object.defineProperty(Place.prototype, 'description', {
    get: function () {
      return this.get('description');
    },
    set: function (value) {
      this.set('description', value);
    }
  });

  Object.defineProperty(Place.prototype, 'longDescription', {
    get: function () {
      return this.get('longDescription');
    },
    set: function (value) {
      this.set('longDescription', value);
    }
  });

  Object.defineProperty(Place.prototype, 'phone', {
    get: function () {
      return this.get('phone');
    },
    set: function (value) {
      this.set('phone', value);
    }
  });

  Object.defineProperty(Place.prototype, 'website', {
    get: function () {
      return this.get('website');
    },
    set: function (value) {
      this.set('website', value);
    }
  });

  Object.defineProperty(Place.prototype, 'address', {
    get: function () {
      return this.get('address');
    },
    set: function (value) {
      this.set('address', value);
    }
  });

  Object.defineProperty(Place.prototype, 'image', {
    get: function () {
      return this.get('image');
    },
    set: function (value) {
      this.set('image', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageTwo', {
    get: function () {
      return this.get('imageTwo');
    },
    set: function (value) {
      this.set('imageTwo', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageThree', {
    get: function () {
      return this.get('imageThree');
    },
    set: function (value) {
      this.set('imageThree', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageFour', {
    get: function () {
      return this.get('imageFour');
    },
    set: function (value) {
      this.set('imageFour', value);
    }
  });

  Object.defineProperty(Place.prototype, 'imageThumb', {
    get: function () {
      return this.get('imageThumb');
    }
  });

  Object.defineProperty(Place.prototype, 'location', {
    get: function () {
      return this.get('location');
    },
    set: function (val) {
      this.set('location', new Parse.GeoPoint({
        latitude: val.latitude,
        longitude: val.longitude
      }));
    }
  });

  Object.defineProperty(Place.prototype, 'status', {
    get: function () {
      return this.get('status');
    },
    set: function (value) {
      this.set('status', value);
    }
  });

  Object.defineProperty(Place.prototype, 'expiresAt', {
    get: function () {
      return this.get('expiresAt');
    },
    set: function (value) {
      this.set('expiresAt', value);
    }
  });

  Object.defineProperty(Place.prototype, 'isFeatured', {
    get: function () {
      return this.get('isFeatured');
    },
    set: function (value) {
      this.set('isFeatured', value);
    }
  });

  Object.defineProperty(Place.prototype, 'facebook', {
    get: function () {
      return this.get('facebook');
    },
    set: function (value) {
      this.set('facebook', value);
    }
  });

  Object.defineProperty(Place.prototype, 'instagram', {
    get: function () {
      return this.get('instagram');
    },
    set: function (value) {
      this.set('instagram', value);
    }
  });

  Object.defineProperty(Place.prototype, 'youtube', {
    get: function () {
      return this.get('youtube');
    },
    set: function (value) {
      this.set('youtube', value);
    }
  });

  Object.defineProperty(Place.prototype, 'images', {
    get: function () {
      return this.get('images');
    },
    set: function (value) {
      this.set('images', value);
    }
  });

  Object.defineProperty(Place.prototype, 'ratingAvg', {
    get: function () {
      return this.get('ratingAvg');
    },
    set: function (val) {
      this.set('ratingAvg', val);
    }
  });

  Object.defineProperty(Place.prototype, 'tags', {
    get: function () {
      return this.get('tags');
    },
    set: function (val) {
      this.set('tags', val);
    }
  });

  Object.defineProperty(Place.prototype, 'categories', {
    get: function () {
      return this.get('categories');
    },
    set: function (val) {
      this.set('categories', val);
    }
  });

  Object.defineProperty(Place.prototype, 'icon', {
    get: function () {
      return this.get('icon');
    },
    set: function (val) {
      this.set('icon', val);
    }
  });

  Object.defineProperty(Place.prototype, 'featuredExpiresAt', {
    get: function () {
      return this.get('featuredExpiresAt');
    },
    set: function (val) {
      this.set('featuredExpiresAt', val);
    }
  });

  Object.defineProperty(Place.prototype, 'userPackage', {
    get: function () {
      return this.get('userPackage');
    },
    set: function (val) {
      this.set('userPackage', val);
    }
  });

  return Place;

});