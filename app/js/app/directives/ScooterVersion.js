'use strict';

define([], function() {

	return ["$http", function($http) {

		return {

			restrict: 'EA',

			templateUrl: 'partials/directives/ScooterVersion.html',

			link: function(scope, element, attrs) {

				$http.get("../.git/refs/heads/master").then(function (r) {
					scope.sha = r.data.substr(0,7);
					scope.linkUrl = encodeURI("https://github.com/ucam-cl-dtg/scooter/issues/new?body=Issue found in " + r.data + "\n<Describe issue here>");
				});
			},
		};
	}];
});