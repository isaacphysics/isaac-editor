'use strict';

define(["app/helpers", "angular", "github/github"], function(helpers) {
	
	return ["$location", "$rootScope", function($location, $rootScope) {
		helpers.clearCookie("github-token");
		delete $rootScope.user;
		$rootScope.loggingIn = false;
		$location.url("/home");
	}];
});