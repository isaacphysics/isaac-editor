'use strict';

define([], function() {

	return [function() {

		function update(scope) {

			scope.parents = scope.path ? scope.path.split("/") : [];

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
		}

		return {

			scope: {
				path: "=",
				entries: "=",
				currentFilePath: "=",
				create: "=onCreate",
				open: "=onOpen"
			},

			restrict: 'EA',

			templateUrl: "partials/directives/FileBrowser.html",

			link: function(scope, element, attrs) {
				scope.$watch("entries", function() {
					update(scope);
				});

				scope.openParent = function(i) {
					
					scope.open(scope.parents.slice(0,i + 1).join("/"));
				};

				scope.create_click = function(e) {
    				var newName = window.prompt("Please type a name for the new file. If no extension is provided, '.json' will be assumed", "untitled");

    				if (newName) {
				        if (newName.indexOf(".") == -1)
				            newName += ".json";

						scope.create(newName);
    				}

				};
			},
		};
	}];
});