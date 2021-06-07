'use strict';
angular.module('app').factory('File', function () {

  return {
    upload: function (file, name) {
      return new Parse.File(name || 'image.jpg', file).save();
    }
  };
});
