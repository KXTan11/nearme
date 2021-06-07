'use strict';
angular.module('app').service('Toast', function ($mdToast) {

	return {
		show: function (message) {
			$mdToast.show(
				$mdToast.simple()
				.content(message)
				.action('OK')
				.position('bottom right')
				.hideDelay(3000)
			);
		}
	};

});