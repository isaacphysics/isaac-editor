define(["github/base64", "github/github"], function(B64) {
	
	return ['github', function(github) {
		return function(repoOwner, repoName, currentGitDir, relativePath) {
			// Return a promise that resolves to a dataUrl of the requested file.

		    return new Promise(function(resolve, reject) {

		        var absPath = currentGitDir + "/" + relativePath;

		        github.getFile(repoOwner, repoName, absPath).then(function(f) {
		            if(f.name.toLowerCase().endsWith(".png"))
		                var type = "image/png";
		            else if (f.name.toLowerCase().endsWith(".svg"))
		                var type = "image/svg+xml";
		            else if (f.name.toLowerCase().endsWith(".jpg"))
		                var type = "image/jpeg";

		            var b64 = f.content;
		            var dataUrl = "data:" + type + ";base64," +  b64;
		            console.log("Retrieved", f.path, "from git.", f);
		            return resolve(dataUrl);
		        }).catch(function(e) {
		            console.error("Failed to retrieve", absPath, e);
		            return reject(e);
		        });
		    });
		};
	}];

});