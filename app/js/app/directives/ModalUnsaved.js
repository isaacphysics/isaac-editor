'use strict';

define([], function() {

	return function() {

		function show(scope, element) {

			var deferred = Promise.defer();

			scope.cancel = function() {
				deferred.reject();
			}

			scope.save = function() {
				deferred.resolve(true);
			}

			scope.discard = function() {
				deferred.resolve(false);
			}

			function hide() {
				scope.modal.foundation("reveal", "close");
			}

			deferred.promise.then(hide, hide);


			scope.modal.foundation("reveal", "open");

			return deferred.promise;
		}

		return {

			scope: {
				ctrl: "=",
			},

			restrict: 'EA',

			templateUrl: "partials/directives/ModalUnsaved.html",

			link: function(scope, element, attrs) {

				scope.modal = element.find(".reveal-modal");
				$(document).foundation();

				scope.ctrl.show = show.bind(this, scope, element);

			},
		};
	};
});