'use strict';

define(["angular", "app/services/LoginChecker", "app/services/FileLoader", "app/services/FigureUploader"], function() {

	/* Services */

	// Demonstrate how to register services
	// In this case it is a simple value service.
	angular.module('scooter.services', [])

	.service('LoginChecker', require("app/services/LoginChecker"))

	.factory('FileLoader', require("app/services/FileLoader"))

	.factory('FigureUploader', require("app/services/FigureUploader"))



});