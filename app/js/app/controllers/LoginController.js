'use strict';

define(["angular", "github/github"], function() {
	
	return ['$location', 'github', function($location, github) {
		var url = github.getLoginRedirectUrl();
		document.location.href = url + "#!?target=" + ($location.search()['target'] || "");
	}];
});