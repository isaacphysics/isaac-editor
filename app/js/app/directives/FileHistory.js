define(["github/github"], function() {

	return ["github", "Repo", "$routeParams", "$location", function(github, repo, $routeParams, $location) {

		return {

			scope: {
				filePath: "=",
			},

			restrict: 'A',

			templateUrl: "partials/directives/FileHistory.html",

			link: function(scope, element, attrs) {

				scope.history = [];

				var refreshHistory = function() {
					if (!scope.filePath)
						return;

					scope.previewPastVersion = function(sha) {
						$location.url("/edit/" + sha + "/" + scope.filePath);
					}

					github.getCommits(repo.owner, repo.name, scope.filePath).then(function(cs) {
						console.debug("Commits:", cs);

						scope.history.length = 0;

						for (var i in cs) {
							var c = cs[i];

							scope.history.push({
								date: new Date(c.commit.committer.date).toString().substring(0,21),
								name: c.commit.committer.name,
								sha: c.sha,
							});

						}

						scope.$apply();
					});
				};

				scope.$watch("filePath", refreshHistory);
				scope.$on("fileSaved", refreshHistory);


				scope.sha = $routeParams.branch;
			},
		};
	}];
});