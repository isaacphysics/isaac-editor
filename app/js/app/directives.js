'use strict';

define(["angular", "angular-route", "app/filters", "jsx!app/directives/content_editor", "app/directives/FileBrowser"], function() {

	var ContentEditor = require("jsx!app/directives/content_editor");

	/* Directives */

	angular.module('scooter.directives', [])

	.directive('appVersion', ['version', function(version) {
	    return function(scope, elm, attrs) {
	    	elm.text(version);
	    };
	}])

	.directive("contentEditor", [function() {

		function link(scope, element, attrs) {
			scope.editor = new ContentEditor(element, scope.document || {});
		}

		return {

			scope: {
				document: "=",
			},

			link: link,
		};
	}])

	.directive("fileBrowser", require("app/directives/FileBrowser"))

});
