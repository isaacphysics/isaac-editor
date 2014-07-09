define([], function(helpers) {
	
	return ["$http", "ApiServer", function($http, api) {

		return function() {
			return new Promise(function(resolve, reject) {
				$http.get(api + "/content/tags").then(function(r) {
					var tags = r.data;
					console.log("Received content tags:", tags);
					return resolve(tags);
				}).catch(function (e) {
					console.error("Error requesting content tags:", e);
					return reject(e);
				})
			});
		}

	}];

});