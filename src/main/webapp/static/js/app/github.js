define(["./github_application", "jquery", "base64", "rsvp"], function(gh_app, $, B64) {

    // Create GitHub 'class'
    function GitHub(user, token)
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
            a.success(function(e) { return resolve(e); })
             .error(function(e) { return reject(e.responseText); });
        });
    }

    function getUser(token)
    {
        return wrapAjax($.ajax("https://api.github.com/user",
                               {data: {"access_token": token},
                                type: "GET"}));
    }
    
    /////////////////////////////////
    // Static methods
    /////////////////////////////////
    
    GitHub.login = function(token)
    {
        return getUser(token).then(function(u) {
            return new GitHub(u, token);
        });
    };

    GitHub.application = gh_app || {hosts: {}};

    /////////////////////////////////
    // Public instance methods
    /////////////////////////////////
    
    GitHub.prototype.getRepo = function(user, repoName)
    {
        return wrapAjax($.ajax("https://api.github.com/repos/" + user + "/" + repoName,
                               {data: {"access_token": this.token}}));
    };

    GitHub.prototype.forkRepo = function(repoOwner, repoName)
    {
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

    GitHub.prototype.createFile = function(repoOwner, repoName, path, initialContent)
    {
        if (initialContent == null)
            initialContent = " ";
        var p = wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                {
                                    type: "PUT",
                                    headers: {"Authorization": "token " + this.token},
                                    data:
                                    JSON.stringify({
                                        message: "Creating " + path,
                                        branch: this.branch,
                                        content: btoa(initialContent),
                                })}));
                                
        if (GitHub.enableLogging)
            p.then(function(f) {
                console.log("GITHUB:","Successfully created \"" + path + "\" in repo \"" + repoOwner + "/" + repoName + "\".");
            });
        
        return p;
    };

    GitHub.prototype.deleteFile = function(repoOwner, repoName, path, sha)
    {
        var p = wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                {
                                    type: "DELETE",
                                    headers: {"Authorization": "token " + this.token},
                                    data:
                                    JSON.stringify({
                                        message: "Deleting " + path,
                                        branch: this.branch,
                                        sha: sha,
                                })}));
        
        if (GitHub.enableLogging)
            p.then(function(f) {
                console.log("GITHUB:","Successfully deleted \"" + path + "\" from repo \"" + repoOwner + "/" + repoName + "\".");
            });
        
        return p;
    };

    GitHub.prototype.getFile = function(repoOwner, repoName, path)
    {
        return wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                               {
                                   data: {"access_token": this.token,
                                          "ref": this.branch},
                                   dataType: "json",
                                   type: "GET",
                                   cache: false
                               }));
    };
    
    GitHub.prototype.getFolder = function(repoOwner, repoName, path)
    {
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
    
    GitHub.prototype.getTree = function(repoOwner, repoName, rootPath)
    {
        var gh = this;
        
        return gh.getFolder(repoOwner, repoName, rootPath).then(function(f) {
            return wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/git/trees/" + f.sha + "?recursive=1",
                                   {
                                       data: {"access_token": gh.token},
                                       dataType: "json",
                                       type: "GET",
                                       cache: true
                                   }));
        });
    };

    GitHub.prototype.getOrCreateFile = function(repoOwner, repoName, path)
    {
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

    GitHub.prototype.listFiles = function(repoOwner, repoName, directory)
    {
        return this.getFile(repoOwner, repoName, directory);
    };

    GitHub.prototype.commitChange = function(originalFile, newContent, message)
    {
        var p = wrapAjax($.ajax(originalFile.url,
                                {type: "PUT",
                                 headers: {"Authorization": "token " + this.token},
                                 data: JSON.stringify(
                                 {
                                    message: message,
                                    content: B64.btoa(newContent), // base-64 encode
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
    
    GitHub.prototype.listBranches = function(repoOwner, repoName)
    {
        return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/branches",
                               {
                                   data: {"access_token": this.token},
                                   type: "GET",
                                   dataType: "json",
                                   //cache: false
                               }));
    };

    GitHub.prototype.getRepo = function(repoOwner, repoName) {
        return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName,
                               {
                                    data: {"access_token": this.token},
                                    type: "GET",
                                    dataType: "json",
                               }));
    }

    GitHub.prototype.getForks = function(repoOwner, repoName) {
        return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/forks",
                               {
                                    data: {"access_token": this.token},
                                    type: "GET",
                                    dataType: "json",
                               }));
    }

    GitHub.prototype.getMyRepos = function() {
        return wrapAjax($.ajax("https://api.github.com/user/repos",
                               {
                                    data: {"access_token": this.token},
                                    type: "GET",
                                    dataType: "json",
                               }));
    }

    return GitHub;
});



