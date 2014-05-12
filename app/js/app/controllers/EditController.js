'use strict';

define(["github/github"], function() {

	var repoOwner = "ucam-cl-dtg";
	var repoName = "rutherford-content";

	return ['$scope', '$routeParams', 'github', '$location', function(scope, routeParams, github, location) {

		scope.createFile = function(fullPath) {
			console.log("Creating file", fullPath);
		}
		scope.openFile = function(fullPath) {
			console.log("Open file", fullPath);
			location.url("/edit/" + scope.branch + "/" + fullPath);
		}

		scope.branch = routeParams.branch || "master";
		scope.path = routeParams.path || "";

		github.branch = scope.branch;

		if (scope.path[scope.path.length - 1] == "/")
			scope.path = scope.path.substr(0, scope.path.length - 1);

		github.getFile(repoOwner, repoName, scope.path).then(function(file) {

			var loadDir = null;

			if (file.type == "file") {
				scope.pathType = "file";

				scope.filePath = file.path;
				scope.file = file;

				scope.dirPath = scope.path.substr(0, scope.path.lastIndexOf("/"));

				loadDir = github.listFiles(repoOwner, repoName, scope.dirPath).then(function(files) {
					scope.dir = files;

				}).catch(function(e) {
					console.error("Unable to list directory containing", scope.path, e);
				});

			} else {
				scope.pathType = "dir";

				scope.filePath = null;
				scope.file = null;

				scope.dirPath = scope.path;
				scope.dir = file;

				loadDir = Promise.resolve();
			}
			
			loadDir.then(function() {
				console.log("Dir loaded:", scope.dir);

				// Now we have scope.{filePath, file, dirPath, dir}

				scope.$apply();

			}).catch(function(e) {
				console.error("What?", e);
			});


		}).catch(function(e) {
			console.error("Unable to list files:", e);
		});

	}];
});