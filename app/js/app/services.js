'use strict';

define(["angular", "app/services/LoginChecker", "app/services/FileLoader", "app/services/FigureUploader", "app/services/SnippetLoader", "app/services/TagLoader", "app/services/IdLoader"], function() {

	/* Services */

	angular.module('scooter.services', [])

	.constant('Repo', {
		owner: "ucam-cl-dtg",
		name: "rutherford-content"
	})

	.constant('ApiServer', "https://dev.isaacphysics.org/api/docker/api")

	.service('LoginChecker', require("app/services/LoginChecker"))

	.factory('FileLoader', require("app/services/FileLoader"))

	.factory('FigureUploader', require("app/services/FigureUploader"))

	.service('SnippetLoader', require("app/services/SnippetLoader"))

	.factory('TagLoader', require("app/services/TagLoader"))

	.factory('IdLoader', require("app/services/IdLoader"))


});