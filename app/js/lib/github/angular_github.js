define(["angular", "github/github"], function(ng, Github) {

	angular.module("github", [])

	.service("github", Github);

});