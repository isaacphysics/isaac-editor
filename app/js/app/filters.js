'use strict';

define(["angular", "angular-route"], function() {

	/* Filters */

	angular.module('scooter.filters', [])

	.filter('interpolate', ['version', function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		};
	}]);

});