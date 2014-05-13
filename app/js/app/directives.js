'use strict';

define(["angular", "angular-route", "app/filters", "jsx!app/directives/content_editor", "app/directives/FileBrowser", "app/directives/ModalUnsaved"], function() {

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
			scope.$watch("document", function(newVal, oldVal, scope) {
				console.log("document changed!", scope.document);
				scope.editor = new ContentEditor(element[0], scope.document);
			})

			element.on("docChanged", function(e, oldDoc, newDoc) {
	            var newJson = JSON.stringify(newDoc, null, 2);
	            scope.onChange(newJson);
	        });
		}

		return {

			scope: {
				document: "=",
				onChange: "=",
			},

			restrict: "EA",

			link: link,
		};
	}])

	.directive("fileBrowser", require("app/directives/FileBrowser"))

	.directive("modalUnsaved", require("app/directives/ModalUnsaved"))

});
