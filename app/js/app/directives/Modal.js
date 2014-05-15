'use strict';

define([], function() {

	return function() {

		function show(scope, element, title, lead, text, buttons) {

			var deferred = Promise.defer();

			element.find(".modal-title").html(title);
			element.find(".lead").html(lead);
			element.find(".modal-text").html(text);

			var buttonContainer = element.find(".modal-buttons");
			buttonContainer.empty();

			for (var i in buttons) {
				var b = buttons[i];

				var btn = $("<a/>");

				btn.addClass("button primary radius");
				btn.html(b.caption);

				if(b.target)
					btn.attr("target", b.target);

				if (b.href)
					btn.attr("href", b.href);

				btn.on("click", function(i, e) {
					deferred.resolve(buttons[i].value);					
				}.bind(null, i));

				buttonContainer.append(btn);
			}

			scope.cancel = function() {
				deferred.reject("cancel");
			}

			// Deal with cancel by esc.
			function keyup(e) {
				if (e.which == 27)
					scope.cancel();
			}

			function hide() {
				scope.modal.foundation("reveal", "close");
				$("body").off("keyup", keyup);
			}

			deferred.promise.then(hide, hide);

			scope.modal.foundation("reveal", "open");
			$("body").one("click", ".reveal-modal-bg", scope.cancel);
			$("body").on("keyup", keyup);

			return deferred.promise;
		}

		return {

			scope: {
				ctrl: "=",
			},

			restrict: 'EA',

			templateUrl: "partials/directives/Modal.html",

			link: function(scope, element, attrs) {

				scope.modal = element.find(".reveal-modal");
				$(document).foundation();

				scope.ctrl.show = show.bind(this, scope, element);

			},
		};
	};
});