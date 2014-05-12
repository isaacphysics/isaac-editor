'use strict';

define(["angular", "app/services/LoginChecker"], function() {

	/* Services */

	// Demonstrate how to register services
	// In this case it is a simple value service.
	angular.module('scooter.services', [])

	.service('LoginChecker', require("app/services/LoginChecker"))

});