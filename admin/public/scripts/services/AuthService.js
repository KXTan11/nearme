angular.module('app').factory('Auth', function ($q) {

  var mSessionToken = null;

  return {

    getLoggedUser: function () {
      return Parse.User.current();
    },

    setSessionToken: function (sessionToken) {
      mSessionToken = sessionToken;
    },

    ensureLoggedIn: function () {
      var defer = $q.defer();

      if (mSessionToken === null) {
        defer.reject('Session token invalid');
        return defer.promise;
      }

      if (!Parse.User.current()) {
        Parse.User.become(mSessionToken)
          .then(function (user) {
            defer.resolve(user);
          }, function (error) {
            defer.reject(error);
          });
      } else {
        defer.resolve(Parse.User.current());
      }

      return defer.promise;
    },

    resetPassword: function (email) {
      return Parse.User.requestPasswordReset(email);
    },

    logOut: function () {
  	  Parse.User.logOut();
  	}

  }
});
