
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
    
    function wrapAjax(a) {
        return new RSVP.Promise(function(resolve, reject) {
            a.success(function(e) { resolve(e); })
             .error(function(e) { reject(e); });
        });
    }

    function getUser(token, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        return wrapAjax($.ajax("https://api.github.com/user",
                               {data: {"access_token": token},
                                type: "GET"}));
    }
    
    /////////////////////////////////
    // Static methods
    /////////////////////////////////
    
    GitHub.login = function(token, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        return getUser(token).then(function(u) {
            return new GitHub(u, token);
        });
    };

    /////////////////////////////////
    // Public instance methods
    /////////////////////////////////
    
    GitHub.prototype.getRepo = function(user, repoName, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        return wrapAjax($.ajax("https://api.github.com/repos/" + user + "/" + repoName,
                               {data: {"access_token": this.token}}));
    };

    GitHub.prototype.forkRepo = function(repoOwner, repoName, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        var p = wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/forks",
                               { headers: {"Authorization": "token " + this.token},
                                 type: "POST",
                               }));
                               
        if (GitHub.enableLogging)
            p.then(function(r) {
                console.log("GITHUB:","Repository \"" + repoOwner + "/" + repoName + "\" forking started successfully.");
            });
             
        return p;
    };

    GitHub.prototype.createFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        var p = wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                {
                                    type: "PUT",
                                    headers: {"Authorization": "token " + this.token},
                                    data:
                                    JSON.stringify({
                                        message: "Creating " + path,
                                        branch: this.branch,
                                        content: btoa(" "),
                                })}));
                                
        if (GitHub.enableLogging)
            p.then(function(f) {
                console.log("GITHUB:","Successfully created \"" + path + "\" in repo \"" + repoOwner + "/" + repoName + "\".");
            });
        
        return p;
    };

    GitHub.prototype.getFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        return wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                               {
                                   data: {"access_token": this.token,
                                          "ref": this.branch},
                                   type: "GET",
                                   cache: false
                               }));
    };
    
    GitHub.prototype.getFolder = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        var fs = path.split("/");
        var name = fs[fs.length-1]
        var parent = path.substr(path, path.length - name.length - 1);
        
        return this.listFiles(repoOwner, repoName, parent).then(function(e) {
            for(var n in e){
                if (e[n].path == path)
                {
                    return e[n];
                }
            }
        });
    }
    
    GitHub.prototype.getTree = function(repoOwner, repoName, rootPath, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        var gh = this;
        
        return gh.getFolder(repoOwner, repoName, rootPath).then(function(f) {
            return wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/git/trees/" + f.sha + "?recursive=1",
                                   {
                                       data: {"access_token": gh.token},
                                       type: "GET",
                                       cache: true
                                   }));
        });
    };

    GitHub.prototype.getOrCreateFile = function(repoOwner, repoName, path, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        gh = this;
        
        return this.getFile(repoOwner, repoName, path).catch(function() { // NOTE 'CATCH' HERE (NOT 'THEN')!
            // getFile failed. Create the file.
            // TODO: Only do this if it failed for the right reason!
            
            console.warn("GITHUB:", "File \"" + path + "\" not found in repo \"" + repoOwner + "/" + repoName + "\". Creating.");
            return gh.createFile(repoOwner, repoName, path).then(function() {
                gh.getFile(repoOwner, repoName, path, successCallback,errorCallback);
            });
        });
    };

    GitHub.prototype.listFiles = function(repoOwner, repoName, directory, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        return this.getFile(repoOwner, repoName, directory);
    };

    GitHub.prototype.commitChange = function(originalFile, newContent, message, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
        var p = wrapAjax($.ajax(originalFile.url,
                                {type: "PUT",
                                 headers: {"Authorization": "token " + this.token},
                                 data: JSON.stringify(
                                 {
                                    message: message,
                                    content: btoa(newContent), // base-64 encode
                                    sha: originalFile.sha,
                                    branch: this.branch
                                 })
                                 }));
                                 
        if (GitHub.enableLogging)
            p.then(function(f) {
                console.log("GITHUB:","File \"" + originalFile.path + "\" updated successfully.");
            });
            
        return p;
    };
    
    GitHub.prototype.listBranches = function(repoOwner, repoName, successCallback, errorCallback)
    {
        if (successCallback || errorCallback)
            console.error("USED SUCCESS OR ERROR:", successCallback, errorCallback);
        
    	return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/branches",
                               {
                                   data: {"access_token": this.token},
                                   type: "GET",
                                   //cache: false
                               }));
    };
})();



