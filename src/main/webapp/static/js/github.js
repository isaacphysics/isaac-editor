
(function() {

    // Create GitHub 'class'
    GitHub = function(user, token)
    {
        this.user = user;
        this.token = token;
        this.branch = "master";
    };
    
    GitHub.enableLogging = true;
    
    /////////////////////////////////
    // Private static methods
    /////////////////////////////////

    function getUser(token, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/user",
            {data: {"access_token": token},
             type: "GET"})
             .success(successCallback)
             .error(errorCallback);
    }
    
    /////////////////////////////////
    // Static methods
    /////////////////////////////////
    
    GitHub.login = function(token, successCallback, errorCallback)
    {
        getUser(token, function(u) {
            successCallback(new GitHub(u, token));
        }, errorCallback);
    };

    /////////////////////////////////
    // Public instance methods
    /////////////////////////////////
    
    GitHub.prototype.getRepo = function(user, repoName, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/repos/" + user + "/" + repoName,
            {data: {"access_token": this.token}})
            .success(successCallback)
            .error(errorCallback);
    };

    GitHub.prototype.forkRepo = function(repoOwner, repoName, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/forks",
            {headers: {"Authorization": "token " + this.token},
             type: "POST",
             })
             .success(function(r)
             {
                if (GitHub.enableLogging)
                    console.log("GITHUB:","Repository \"" + repoOwner + "/" + repoName + "\" forking started successfully.");
                if (successCallback)
                    successCallback(r);
             })
             .error(errorCallback);
    };

    GitHub.prototype.createFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
            {
                type: "PUT",
                headers: {"Authorization": "token " + this.token},
                data:
                JSON.stringify({
                    message: "Creating " + path,
                    branch: this.branch,
                    content: btoa(" "),
            })})
            .success(function(f)
            {
                if (GitHub.enableLogging)
                    console.log("GITHUB:","Successfully created \"" + path + "\" in repo \"" + repoOwner + "/" + repoName + "\".");
                if (successCallback)
                    successCallback(f);
            })
            .error(errorCallback);
    };

    GitHub.prototype.getFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
            {
                data: {"access_token": this.token,
                	   "ref": this.branch},
                type: "GET",
                cache: false
            })
            .success(successCallback)
            .error(errorCallback);
    };
    /*
     * DOESN'T YET SUPPORT BRANCHES
    GitHub.prototype.getTree = function(repoOwner, repoName, sha, successCallback, errorCallback)
    {
        $.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/git/trees/" + sha + "?recursive=1",
            {
                data: {"access_token": this.token},
                type: "GET",
                cache: true
            })
            .success(successCallback)
            .error(errorCallback);
    };*/

    GitHub.prototype.getOrCreateFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        gh = this;
        this.getFile(repoOwner, repoName, path, successCallback, function()
        {
            // getFile failed. Create the file.
            // TODO: Only do this if it failed for the right reason!
            
            console.warn("GITHUB:", "File \"" + path + "\" not found in repo \"" + repoOwner + "/" + repoName + "\". Creating.");
            gh.createFile(repoOwner, repoName, path, function()
            {
                gh.getFile(repoOwner, repoName, path, successCallback,errorCallback);
            }, errorCallback);
        });
    };

    GitHub.prototype.listFiles = function(repoOwner, repoName, directory, successCallback, errorCallback)
    {
        this.getFile(repoOwner, repoName, directory, successCallback, errorCallback);
    };

    GitHub.prototype.commitChange = function(originalFile, newContent, message, successCallback, errorCallback)
    {
        $.ajax(originalFile.url,
            {type: "PUT",
             headers: {"Authorization": "token " + this.token},
             data: JSON.stringify(
             {
                message: message,
                content: btoa(newContent), // base-64 encode
                sha: originalFile.sha,
                branch: this.branch
             })
             })
             .success(function(f)
             {
                if (GitHub.enableLogging)
                    console.log("GITHUB:","File \"" + originalFile.path + "\" updated successfully.");
                if (successCallback)
                    successCallback(f);
             })
             .error(errorCallback);
    };
    
    GitHub.prototype.listBranches = function(repoOwner, repoName, successCallback, errorCallback)
    {
    	$.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/branches",
			{
				data: {"access_token": this.token},
				type: "GET",
				//cache: false
			})
			.success(successCallback)
			.error(errorCallback);
    };
})();



