'use strict';

define([], function() {

	return function() {

		function update(scope) {

			scope.folders = [];
			scope.files = [];

			for(var i in scope.entries) {
				var e = scope.entries[i];

				if (e.type == "file")
					scope.files.push(e);
				else if (e.type == "dir")
					scope.folders.push(e);
				else
					console.error("Got a file browser entry of unknown type:", e);
			}
			console.log("Updated Scope: ", scope);
		}

		return {

			scope: {
				path: "=",
				entries: "=",
				create: "=onCreate",
				open: "=onOpen"
			},

			restrict: 'EA',

			templateUrl: "partials/directives/FileBrowser.html",

			link: function(scope, element, attrs) {
				scope.$watch("entries", function() {
					update(scope);
				})
			},
		};
	};
});