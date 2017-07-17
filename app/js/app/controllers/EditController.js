'use strict';

define(["github/github", "app/helpers", "angulartics"], function(github, helpers, angulartics) {

	return ['$scope', '$routeParams', 'Repo', 'github', '$location', '$rootScope', 'FileLoader', 'FigureUploader', 'SnippetLoader', '$analytics', function(scope, routeParams, repo, github, location, $rootScope, fileLoader, figureUploader, snippetLoader, $analytics) {

		scope.createFile = function(relativePath) {
			console.log("Creating file", relativePath);

			var fullPath = scope.dirPath + "/" + relativePath;

			var doCreate = function(initialContent) {
				github.createFile(repo.owner, repo.name, fullPath, initialContent).then(function(f) {
					location.url("/edit/" + scope.branch + "/" + fullPath);
					$rootScope.$apply();
				}).catch(function(e) {
					console.error("Couldn't create file. Perhaps it already exists.", e);
				})
			}

			if (fullPath.endsWith(".json")) {
				$rootScope.modal.show("Choose Page Type", "What type of page would you like to create?", "", [
					{
						caption: "Wildcard",
						value: "isaacWildcard"
					},
					{
						caption: "Question",
						value: "isaacQuestionPage"
					},
					{
						caption: "Concept",
						value: "isaacConceptPage"
					},
					{
						caption: "General",
						value: "page"
					},
					{
						caption: "Event",
						value: "isaacEventPage"
					},
					{
						caption: "Email template",
						value: "emailTemplate"
					}
				]).then(function(r) {

					snippetLoader.loadPageTemplate(r.value).then(function(t) {
						t.author = github.user.login;
						t = JSON.stringify(t, null, 2);
						doCreate(t);
					})
				}).catch(function(e) {
					if (e == "cancel") {
						console.log("File creation cancelled.");
					} else {
						console.error("Something went wrong choosing new file type:", e);
					}
				});
			} else {
				doCreate("");
			}
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

				var doSave = function() {

					$analytics.eventTrack("save", {category: "git", label: scope.file.path});

					var msg = $('<input type="text" value="' + "Edited " + scope.file.name + '" />');

					var onShow = function(buttonContainer) {
						// Deal with enter key
						function keyup(e) {
							if (e.which == 13) {
								buttonContainer.children(":first").click();
							}
						}

						msg.on("keyup", keyup);
						msg.focus();
						msg.val(msg.val()); // Hackery to put the caret at the end of the textbox
					}

					$rootScope.modal.show("Enter commit message", "Enter commit message, or accept default suggestion.", msg, [{caption: "Save", value: "save"}], onShow).then(function() {

						github.commitChange(scope.file, scope.file.editedContent, msg.val()).then(function(f) {

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
				};

				var buttons = [];

				buttons.push({
					caption: "Save anyway",
					value: "save"
				});

				var doc = null;
				try {
					doc = JSON.parse(scope.file.editedContent);
				} catch (e) { /* File is not a valid JSON document. Probably not a big deal, it may not even be a JSON file. */ }

				// TODO Improve the logic here (af599)
				if(doc && doc.type == "emailTemplate") {
					if (doc && (!doc.id || doc.id == "")) {
						return $rootScope.modal.show("Missing Metadata", "The content you are trying to save is missing an ID. All pages should have an ID.", "", buttons).then(function(r) {
							if (r.value == "save") {
								r.closedPromise.then(doSave);
							} else {
								// Cancel the save operation.
							}
						});
					} else {
						doSave();
					}
				} else if (doc && (!doc.title || !doc.id || doc.title == "" || doc.id == "")) {
					return $rootScope.modal.show("Missing Metadata", "The content you are trying to save is missing an ID, or a title, or both. All pages should have both.", "", buttons).then(function(r) {
						if (r.value == "save") {
							r.closedPromise.then(doSave);
						} else {
							// Cancel the save operation.
						}
					});
				} else {
					doSave();
				}

			});
		}

		var deleteFile = function() {
		    if (confirm("Do you really want to delete " + scope.file.name + "?")) {
		        console.log("Deleting", scope.file.path);

		        github.deleteFile(repo.owner, repo.name, scope.file.path, scope.file.sha).then(function(f){
		            location.url("/edit/" + scope.branch + "/" + scope.dirPath);
		            $rootScope.$apply();
		        }).catch(function(e) {
		            window.alert("Unable to delete file.", e);
		        });
		    }
		}

		var renameFile = function() {

			if (scope.fileIsEdited) {
		        if (!window.confirm("This will save the current contents of this file. Are you sure you want to continue?"))
		            return;
		    }

		    scope.saveFile().then(function() {

		        var newName = window.prompt("Please type a new name for the file. If no extension is provided, \".json\" will be assumed", scope.file.name);

		        if (newName) {

		            var oldPath = scope.file.path;

		            if (newName.indexOf(".") == -1 && oldPath.toLowerCase().endsWith(".json"))
		                newName += ".json";

		            var newPath = scope.dirPath + "/" + newName;

		            console.log("Creating", newPath);

		            github.createFile(repo.owner, repo.name, newPath, scope.file.decodedContent).then(function(f) {

		                github.deleteFile(repo.owner, repo.name, oldPath, scope.file.sha).then(function() {
		                    location.url("/edit/" + scope.branch + "/" + newPath);
		                    $rootScope.$apply();
		                }).catch(function(e) {
		                    console.error("Could not delete old file.", e);
		                })
		            }).catch(function(e) {
		                window.alert("Could not create file. Perhaps it already exists.", e);
		            });
		        }
		    });
		}

        var saveAs = function() {
            var newName = window.prompt("Please type a new name for the file. If no extension is provided, \".json\" will be assumed", scope.file.name);
            if (newName) {
                var oldPath = scope.file.path;
                if (newName.indexOf(".") == -1 && oldPath.toLowerCase().endsWith(".json"))
                    newName += ".json";
                var newPath = scope.dirPath + "/" + newName;
                var content = scope.file.decodedContent;
                try {
                    var alteredContent = JSON.parse(content);
                    alteredContent.id = helpers.generateGuid();
                    content = JSON.stringify(alteredContent);
                } catch(e) {/* If not JSON, no need to change id */}

                console.log("Creating", newPath);
                github.createFile(repo.owner, repo.name, newPath, content).then(function(f) {
                    location.url("/edit/" + scope.branch + "/" + newPath);
                    $rootScope.$apply();
                }).catch(function(e) {
                    window.alert("Could not create file. Perhaps it already exists.", e);
                });
            }
        }

		scope.showFileInfo = function() {
			var buttons = [];

			buttons.push({
				caption: "View on GitHub",
				value: function() { },
				target: "blank",
				href: scope.file.html_url
			});


			buttons.push({
				caption: "Delete",
				value: deleteFile
			});

			buttons.push({
				caption: "Rename",
				value: renameFile
			})

			buttons.push({
				caption: "Save As",
				value: saveAs
			})

			$rootScope.modal.show(scope.file.name, scope.file.path, "", buttons).then(function(r) {
				r.closedPromise.then(r.value());
			});


		};

		var allowNavigation = false;
		scope.$on('$locationChangeStart', function (event, next, current) {

	        if (scope.fileIsEdited && !allowNavigation) {
	            event.preventDefault();

	            $rootScope.modal.show("Changes not saved", "Do you really want to close " + scope.file.name + "?", "", [{
	            	caption: "Discard",
	            	value: "discard"
	            }, {
	            	caption: "Save",
	            	value: "save"
	            }]).then(function(r) {
					var continueNavigation = function() {
						allowNavigation = true;
	                    location.url(location.url(next).hash().substr(1)); // Ugh.
	                    $rootScope.$apply();
					}
					if (r.value == "save") {
						r.closedPromise.then(function () {
							scope.saveFile().then(continueNavigation);
						});
					} else {
						continueNavigation();
					}
				});
	        }
	    });

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
			$(window).off("resize", checkSize);
		});


		function checkSize() {
			var fileBrowserRight = $(".file-browser").offset().left + $(".file-browser").width() + 20;
			var contentLeft = $("#content").offset().left;

			if (fileBrowserRight > contentLeft)
				$(".file-browser .open-arrow").addClass("file-browser-too-wide");
			else
				$(".file-browser .open-arrow").removeClass("file-browser-too-wide");
		}

		$(window).on("resize", checkSize);

		scope.branch = routeParams.branch || "master";
		scope.path = routeParams.path || "";


		github.branch = scope.branch;

		if (scope.path[scope.path.length - 1] == "/")
			scope.path = scope.path.substr(0, scope.path.length - 1);

		scope.reportIssueUrl = encodeURI("https://github.com/ucam-cl-dtg/rutherford-content/issues/new?body=Issue found in " + scope.path + " by " + github.user.login + ".\n\n<Describe issue here>");

		github.getFile(repo.owner, repo.name, scope.path).then(function(file) {

			var loadDir = null;

			if (file.type == "file") {
				scope.pathType = "file";

				scope.filePath = file.path;
				scope.file = file;

				scope.dirPath = scope.filePath.substr(0, scope.filePath.lastIndexOf("/"));

				loadDir = github.listFiles(repo.owner, repo.name, scope.dirPath).then(function(files) {
					scope.dir = files;

				}).catch(function(e) {
					console.error("Unable to list directory containing", scope.path, e);
				});

				scope.documentString = file.decodedContent;
				scope.document = null;

				try {
					scope.document = JSON.parse(file.decodedContent);

					if (scope.document.id) {
						if (scope.document.type == "isaacConceptPage") {
							scope.previewLink = "https://staging.isaacphysics.org/concepts/" + scope.document.id;
						} else if (scope.document.type == "isaacQuestionPage" || scope.document.type == "isaacFastTrackQuestionPage") {
							scope.previewLink = "https://staging.isaacphysics.org/questions/" + scope.document.id;
						} else if (scope.document.type == "isaacEventPage") {
							scope.previewLink = "https://staging.isaacphysics.org/events/" + scope.document.id;
						} else if (scope.document.type == "page") {
							scope.previewLink = "https://staging.isaacphysics.org/pages/" + scope.document.id;
						} else {
							delete scope.previewLink;
						}
					}

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

				scope.fileLoader = fileLoader.bind(null, repo.owner, repo.name, scope.dirPath);
				scope.figureUploader = figureUploader.bind(null, repo.owner, repo.name, scope.dirPath);

				scope.$apply();

				checkSize();

			}).catch(function(e) {
				console.error("What?", e);
			});


		}).catch(function(e) {
			console.error("Unable to list file(s):", scope.path, e);
			location.url("/edit");
			$rootScope.$apply();
		});

	}];
});
