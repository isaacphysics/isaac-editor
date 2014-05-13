'use strict';

define(["github/github", "app/helpers"], function() {

	var repoOwner = "daviesian";
	var repoName = "rutherford-content";

	return ['$scope', '$routeParams', 'github', '$location', '$rootScope', 'FileLoader', 'FigureUploader', function(scope, routeParams, github, location, $rootScope, fileLoader, figureUploader) {

		scope.createFile = function(fullPath) {
			console.log("Creating file", fullPath);
		}
		scope.openFile = function(fullPath) {
			location.url("/edit/" + scope.branch + "/" + fullPath);
		}
		scope.editedFile = function(newContent) {

			if (scope.file.decodedContent == newContent)
				return;

			scope.file.editedContent = newContent;

			scope.fileIsEdited = true;
			scope.$apply();
		}


		scope.saveFile = function() {
			console.log("Saving file", scope.file.path);

			// Do actual saving here.
			return new Promise(function(resolve, reject) {

				if (scope.file == null)
					return resolve();

				if (!scope.fileIsEdited)
					return resolve();

				github.commitChange(scope.file, scope.file.editedContent, "Edited " + scope.file.name).then(function(f) {

		            // Merge the new git attributes of the file after save. This includes the updated SHA, so that the next save is correctly based on the new commit.
		            for (var attr in f.content) {
		                scope.file[attr] = f.content[attr];
		            }
		            scope.file.decodedContent = scope.file.editedContent;
		            delete scope.file.editedContent;

					scope.fileIsEdited = false;
					scope.$apply();

					return resolve();
				}).catch(function(e) {
					console.error("Could not save file:", e);
					return reject();
				})
			});
		}

		var allowNavigation = false;
		scope.$on('$locationChangeStart', function (event, next, current) {

	        if (scope.fileIsEdited && !allowNavigation) {
	            event.preventDefault();

				scope.modalUnsavedCtrl.show().then(function(save) {
					var continueNavigation = function() {
						allowNavigation = true;
	                    location.url(location.url(next).hash().substr(1)); // Ugh.
	                    $rootScope.$apply();
					}
					if (save) {
						scope.saveFile().then(continueNavigation);
					} else {
						continueNavigation();
					}
				});
	        }
	    });

		scope.modalUnsavedCtrl = {};

		var confirmNavigate = function() {
			if (scope.fileIsEdited)
				return "This file is unsaved. Are you sure you want to leave?";
		}

		var keydown = function(e) {
		    if (e.which == 83 && e.ctrlKey) {
		        e.preventDefault();
		        e.stopPropagation();
		        scope.saveFile();
		    }
		}

		// Keep a reference to this controller in the root scope. This is useful for, say, buttons on the nav bar.
		$rootScope.editorScope = scope;
		$(window).on("beforeunload", confirmNavigate);
		$("body").on("keydown", keydown);

		scope.$on("$destroy", function() {
			// We are leaving the editor page.

			// Undo our changes to the root scope.
			$rootScope.editorScope = undefined;

			// Don't warn us about leaving anymore.
			$(window).off("beforeunload", confirmNavigate);

			// Remove event handlers
			$("body").off("keydown", keydown);
		});




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

				scope.documentString = file.decodedContent;
				scope.document = null;

				try {
					scope.document = JSON.parse(file.decodedContent);
				} catch (e) { /* File is not a valid JSON document. Probably not a big deal, it may not even be a JSON file. */ }

			} else {
				scope.pathType = "dir";

				scope.filePath = null;
				scope.file = null;

				scope.dirPath = scope.path;
				scope.dir = file;

				loadDir = Promise.resolve();
			}
			
			loadDir.then(function() {
				// Now we have scope.{filePath, file, dirPath, dir}

				scope.fileLoader = fileLoader.bind(null, repoOwner, repoName, scope.dirPath);
				scope.figureUploader = figureUploader.bind(null, repoOwner, repoName, scope.dirPath);

				scope.$apply();

			}).catch(function(e) {
				console.error("What?", e);
			});


		}).catch(function(e) {
			console.error("Unable to list files:", e);
		});

	}];
});