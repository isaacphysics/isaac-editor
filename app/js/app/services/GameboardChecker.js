define([], function(helpers) {
    return ["$http", "LiveServer", function($http, live) {
        var api = live + "/api/any/api";
        return function(gameboardId) {
            return new Promise(function(resolve, reject) {
                if (!gameboardId) {
                    return resolve(null);
                }
                $http.get(api + "/gameboards/" + encodeURIComponent(gameboardId)).then(function(r) {
                    if (r.status == 200) {
                        return resolve(r.data);
                    } else {
                        return resolve({id: gameboardId});
                    }
                }).catch(function (e) {
                    return resolve({id: gameboardId});
                });
            });
        }

    }];

});
