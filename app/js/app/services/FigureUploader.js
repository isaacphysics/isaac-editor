define(["github/github"], function() {
	
	return ['github', function(github) {

		return function(repoOwner, repoName, currentGitPath, fileContentToUpload, originalName) {

		    var folder = currentGitPath + "/figures";

		    return new Promise(function(resolve, reject) {
		        github.listFiles(repoOwner, repoName, folder).then(function(figures) {
		            return resolve(figures);
		        }).catch(function() {
		            return resolve([]);
		        });
		    }).then(function(figures) {
		        var figurePaths = figures.map(function(f) {return f.path});
		        var i = 0;

		        do {
		            var proposedName = originalName.substr(0,originalName.lastIndexOf(".")) + ( i ? "_" + (i+1) : "") + originalName.substr(originalName.lastIndexOf("."));
		            var proposedPath = folder + "/" + proposedName;
		            i++;
		        } while(figurePaths.indexOf(proposedPath) > -1)

		        console.log("Proposed Path:", proposedPath);

		        return github.createFile(repoOwner, repoName, proposedPath, fileContentToUpload).then(function(f) {
		            var absPath = f.content.path;
		            var srcPath = currentGitPath;

		            // TODO: Should probably do a proper absolute-to-relative path conversion here. But we know it went in the "figures" subdirectory, so just fake it.

		            var relativePath = "figures/" + f.content.name;

		            return relativePath;
		        });
		    });
		};
	}];

});