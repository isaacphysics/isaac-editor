define([], function() {

	return ["$rootScope", "$location", function($rootScope, $location) {

		$rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
			if (rejection == "unauthorized") {
				var url = $location.url();
				console.warn("Login required for", url, ". Redirecting to /login.");
				$location.url("/login");
				$location.search("target", url);
			}
		});

		this.requireLogin = function() {
			return $rootScope.user ? Promise.resolve() : Promise.reject("unauthorized");
		};
	}];
});