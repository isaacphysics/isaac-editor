define([], function(helpers) {
	
	return ["$http", "ApiServer", function($http, api) {

		return function(searchText) {
			return new Promise(function(resolve, reject) {
				$http.get(api + "/content/search/" + searchText + "?types=isaacConceptPage,isaacQuestionPage").then(function(r) {
					var results = r.data;
					console.log("Received content search results:", results);

					var ids = [];

					for (var i in results.results) {
						ids.push({id: results.results[i].id, title: results.results[i].title});
					}

					return resolve(ids);
				}).catch(function (e) {
					console.error("Error searching for content ids:", e);
					return reject(e);
				})
			});
		}

	}];

});