'use strict';

define(["angular", "app/services/LoginChecker", "app/services/FileLoader", "app/services/FigureUploader", "app/services/SnippetLoader"], function() {

	/* Services */

	angular.module('scooter.services', [])

	.constant('Repo', {
		owner: "ucam-cl-dtg",
		name: "rutherford-content"
	})

	.service('LoginChecker', require("app/services/LoginChecker"))

	.factory('FileLoader', require("app/services/FileLoader"))

	.factory('FigureUploader', require("app/services/FigureUploader"))

	.service('SnippetLoader', require("app/services/SnippetLoader"))


});