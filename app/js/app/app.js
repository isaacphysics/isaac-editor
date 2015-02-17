'use strict';

define(["rsvp", "app/helpers", "foundation", "angular", "angular-route", "github/angular_github", "app/controllers", "app/directives", "app/services", "app/filters", "angulartics", "angulartics-ga"], function() {

	window.Promise = RSVP.Promise;
	window.Promise.defer = RSVP.defer;
	
	var helpers = require("app/helpers");
	///////////////////////////////////////////
	// Main AngularJS App Module
	///////////////////////////////////////////

	angular.module('scooter', [
		'ngRoute',
		'scooter.filters',
		'scooter.services',
		'scooter.directives',
		'scooter.controllers',
		'github',
		'angulartics',
		'angulartics.google.analytics'
	])

	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	 
		function loginResolver(LoginChecker) {
			return LoginChecker.requireLogin();
		}

		loginResolver['$inject'] = ['LoginChecker'];

		$routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeController'});
		$routeProvider.when('/edit', {templateUrl: 'partials/edit.html', controller: 'EditController', resolve: {user: loginResolver}});
		$routeProvider.when('/edit/:branch', {templateUrl: 'partials/edit.html', controller: 'EditController', resolve: {user: loginResolver}});
		$routeProvider.when('/edit/:branch/:path*', {templateUrl: 'partials/edit.html', controller: 'EditController', resolve: {user: loginResolver}});
		$routeProvider.when('/edit/:branch/:path*/:sha', {templateUrl: 'partials/edit.html', controller: 'EditController', resolve: {user: loginResolver}});

		$routeProvider.when("/login", {template: "", controller: "LoginController"});
		$routeProvider.when("/login_progress", {template: "Logging in..."});
		$routeProvider.when("/logout", {template: "", controller: "LogoutController"});

		$routeProvider.otherwise({redirectTo: '/home'});

		$locationProvider.html5Mode(false).hashPrefix('!');

	}])

	.run(["$rootScope", "$location", "github", function($rootScope, $location, github) {

		$(document).foundation({reveal: {
			animation: "fade",
			animation_speed: 50,
		}});

		$rootScope.user = null;

		$rootScope.modal = {};

		// On document load, we either have a code in the query string, or a token cookie, or neither.
		var target = null;
		var githubLoaded = new Promise(function(resolve, reject) {

			var tokenCookie = helpers.getCookie("github-token");

			if (tokenCookie) {
				$rootScope.loggingIn = true;
				target = $location.url();
				// We can't leave the URL as it is - it will almost certainly get us stuck in a redirect loop because it needs authorisation that we don't have yet.
				$location.url("/login_progress");
				$rootScope.$apply();

				github.initWithToken(tokenCookie).then(function() {
					resolve();
				}).catch(function() { reject(); });
			} else if (helpers.urlParams["code"]) {
				$rootScope.loggingIn = true;
				target = $location.search()['target'];
				// We can't leave the URL as it is - it will almost certainly get us stuck in a redirect loop because it needs authorisation that we don't have yet.
				$location.url("/login_progress");
				$rootScope.$apply();

				github.initWithCode(helpers.urlParams['code']).then(function() {

					document.cookie = "github-token=" + github.token;

					// Do this to get rid of the code from the url. But it will reload the page, so be sure you've saved the token somewhere. 
					// Everything will still work with this line commented out, but the URL will be less nice.
					document.location.href = document.location.href.split("?")[0] + "#!" + target;

					resolve();
				}).catch(function(e) { reject(e); });
			}
		}).catch(function(e) {

			$rootScope.loggingIn = false;
			console.warn("Failed to load github. Clearing cookies.", e);
			helpers.clearCookie("github-token");

			$rootScope.user = null;
			$location.url("/home");
			$rootScope.$apply();

		}).then(function() {
			console.log("Github successfully loaded");
			$rootScope.loggingIn = false;

			$rootScope.user = github.user;

			if (target != null) {
				if (target == "")
					target = "/home";

				$location.url(target);
				$rootScope.$apply();
			}

		});
	}]);


	/////////////////////////////////////
	// Bootstrap AngularJS
	/////////////////////////////////////

	var root = $("html");
	angular.bootstrap(root, ['scooter']);

});
