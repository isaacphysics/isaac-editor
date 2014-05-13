define(["github/github"], function() {
	
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

		            var dataUrl = "data:" + type + ";base64," + btoa(f.decodedContent); // This is horrible. We should be able to use the raw base64 from github.
		            console.log("Retrieved", f.path, "from git:", dataUrl, f);
		            return resolve(dataUrl);
		        }).catch(function(e) {
		            console.error("Failed to retrieve", absPath, e);
		            return reject(e);
		        });
		    });
		};
	}];

});