define(["app/helpers", "github/github"], function(helpers) {
	
	return ["$http", "github", function($http, github) {

		// This is a constructor function for the singleton SnippetLoader service. It will be called exactly once by the AngularJS Dependecy Injector.


		this.loadContentTemplate = function(contentType) {

			return new Promise(function(resolve, reject) {
				console.log("Loading content template of type:", contentType);

				if (!contentType)
					contentType = "_undefined";

				$http.get("snippets/content_templates/" + contentType + ".json").then(function(r) {
					var template = r.data;
					console.log("Received content template:", template);
					resolve(template);
				}).catch(function (e) {
					console.error("Error requesting content template:", e);
					reject(e);
				})
			});
		};

		this.loadPageTemplate = function(type) {

			return this.loadContentTemplate(type).then(function(t) {
				t.author = github.user.login;
				t.id = helpers.generateGuid();
				return t;
			}).catch(function(e) {
				console.error("Unable to load page template", e);
			});
		}

		this.loadQuestionTemplate = function(type) {

			return this.loadContentTemplate(type).then(function(t) {
				t.id = helpers.generateGuid();
				return t;
			}).catch(function(e) {
				console.error("Unable to load question template", e);
			});
		}

	}];

});