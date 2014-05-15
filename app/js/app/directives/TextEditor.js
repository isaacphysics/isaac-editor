'use strict';

define([], function() {

	return [function() {

		return {

			scope: {
				value: "=",
				onChange: "=",
			},

			restrict: 'EA',

			templateUrl: "partials/directives/Modal.html",

			link: function(scope, element, attrs) {
				var cm = app.cm = CodeMirror(element[0], 
					{mode: "",
					 theme: "eclipse",
					 lineNumbers: false,
					 value: scope.value,
					 lineWrapping: true,
					 autofocus: true});

				cm.on("change", (function(inst, changeObj) { 
					var newVal = inst.getValue();

					scope.onChange(newVal);

				}).bind(this));

			},
		};
	}];
});