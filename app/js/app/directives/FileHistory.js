define(["github/github"], function() {

	return ["github", "Repo", function(github, repo) {

		return {

			scope: {
				filePath: "=",
			},

			restrict: 'A',

			templateUrl: "partials/directives/FileHistory.html",

			link: function(scope, element, attrs) {

				scope.history = [];

				scope.$watch("filePath", function(newPath) {
					if (!newPath)
						return;

					github.getCommits(repo.owner, repo.name, newPath).then(function(cs) {
						console.debug("Commits:", cs);

						scope.history.length = 0;

						for (var i in cs) {
							var c = cs[i];

							scope.history.push({
								date: c.commit.committer.date,
								name: c.commit.committer.name,
								sha: c.sha,
							});

						}

						scope.$apply();
					})
				})
			},
		};
	}];
});