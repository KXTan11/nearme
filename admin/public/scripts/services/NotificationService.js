angular.module('app').factory('Notification', function () {

  var Notification = Parse.Object.extend('Notification', {
    initialize: function () {
      this.type = 'Geo';
      this.attachmentType = null;
      this.users = [];
    }
  }, {

    all: function () {
      var query = new Parse.Query(this);
      query.descending('createdAt');
      return query.find();
    },

    save: function (obj) {
      return obj.save();
    }
  });

  Object.defineProperty(Notification.prototype, 'message', {
    get: function () {
      return this.get('message');
    },
    set: function (val) {
      this.set('message', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'bounds', {
    get: function () {
      return this.get('bounds');
    },
    set: function (val) {
      this.set('bounds', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'radius', {
    get: function () {
      return this.get('radius');
    },
    set: function (val) {
      this.set('radius', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'address', {
    get: function () {
      return this.get('address');
    },
    set: function (val) {
      this.set('address', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'latitude', {
    get: function () {
      return this.get('latitude');
    },
    set: function (val) {
      this.set('latitude', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'longitude', {
    get: function () {
      return this.get('longitude');
    },
    set: function (val) {
      this.set('longitude', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'type', {
    get: function () {
      return this.get('type');
    },
    set: function (val) {
      this.set('type', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'users', {
    get: function () {
      return this.get('users');
    },
    set: function (val) {
      this.set('users', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'attachmentType', {
    get: function () {
      return this.get('attachmentType');
    },
    set: function (val) {
      this.set('attachmentType', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'place', {
    get: function () {
      return this.get('place');
    },
    set: function (val) {
      this.set('place', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'post', {
    get: function () {
      return this.get('post');
    },
    set: function (val) {
      this.set('post', val);
    }
  });

  Object.defineProperty(Notification.prototype, 'category', {
    get: function () {
      return this.get('category');
    },
    set: function (val) {
      this.set('category', val);
    }
  });

  return Notification;

});