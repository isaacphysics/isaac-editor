define(["github/base64", "app/github_application", "jquery"], function(B64, app, $) {

    var authServer = app.authServer;
    var authCode = app.hosts[document.location.host].authCode;
    var clientId = app.hosts[document.location.host].clientId;

    Github = function() {
            
        function wrapAjax(a) {
            return new Promise(function(resolve, reject) {
                a.success(function(e) { return resolve(e); })
                 .error(function(e) { return reject(e.responseText); });
            });
        }

        function getUser(token)
        {
            return wrapAjax($.ajax("https://api.github.com/user",
                                   {data: {"access_token": token},
                                    type: "GET",
                                    dataType: "json"}));
        }

        this.enableLogging = true;

        /////////////////////////////////
        // Public instance methods
        /////////////////////////////////

        this.getLoginRedirectUrl = function() {
            return "https://gitHub.com/login/oauth/authorize?scope=repo&client_id=" + clientId + "&redirect_uri=" + encodeURIComponent(document.location.protocol + "//" + document.location.host + document.location.pathname);
        }

        this.initWithCode = function(code) {

            return wrapAjax($.ajax(authServer + "?tealight_auth_code=" + authCode + "&client_id=" + clientId + "&github_code=" + code,
                   {type: "GET",
                    dataType: "json"})).then(function(r) {
                if (r.access_token) {
                    return this.initWithToken(r.access_token);
                } else {
                    throw("Could not exchange github code for token: " + r);
                }
            }.bind(this));
        };

        this.initWithToken = function(token) {
            return getUser(token).then(function(u) {
                this.user = u;
                this.token = token;
                this.branch = "master";
            }.bind(this));
        };
        
        this.getRepo = function(user, repoName)
        {
            return wrapAjax($.ajax("https://api.github.com/repos/" + user + "/" + repoName,
                                   {data: {"access_token": this.token}, dataType: "json"}));
        };

        this.forkRepo = function(repoOwner, repoName)
        {
            var p = wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/forks",
                                   { headers: {"Authorization": "token " + this.token},
                                     type: "POST",
                                     dataType: "json",
                                   }));
                                   
            if (this.enableLogging)
                p.then(function(r) {
                    console.log("GITHUB:","Repository \"" + repoOwner + "/" + repoName + "\" forking started successfully.");
                });
                 
            return p;
        };

        this.createFile = function(repoOwner, repoName, path, initialContent)
        {
            if (initialContent == null)
                initialContent = " ";
            var p = wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                    {
                                        type: "PUT",
                                        headers: {"Authorization": "token " + this.token},
                                        dataType: "json",
                                        data:
                                        JSON.stringify({
                                            message: "Creating " + path,
                                            branch: this.branch,
                                            content: B64.btoa(initialContent),
                                    })}));
                                    
            if (this.enableLogging)
                p.then(function(f) {
                    console.log("GITHUB:","Successfully created \"" + path + "\" in repo \"" + repoOwner + "/" + repoName + "\".");
                });
            
            return p;
        };

        this.deleteFile = function(repoOwner, repoName, path, sha)
        {
            var p = wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                    {
                                        type: "DELETE",
                                        headers: {"Authorization": "token " + this.token},
                                        dataType: "json",
                                        data:
                                        JSON.stringify({
                                            message: "Deleting " + path,
                                            branch: this.branch,
                                            sha: sha,
                                    })}));
            
            if (this.enableLogging)
                p.then(function(f) {
                    console.log("GITHUB:","Successfully deleted \"" + path + "\" from repo \"" + repoOwner + "/" + repoName + "\".");
                });
            
            return p;
        };

        this.getFile = function(repoOwner, repoName, path)
        {
            return wrapAjax($.ajax("https://api.github.com/repos/"+ repoOwner +"/"+ repoName + "/contents/" + path,
                                   {
                                       data: {"access_token": this.token,
                                              "ref": this.branch},
                                       dataType: "json",
                                       type: "GET",
                                       cache: false
                                   })).then(function(f) {
                if (f.content)
                    f.decodedContent = B64.atob(f.content.replace("\n", ""));
                return f;
            });
        };
        
        this.getFolder = function(repoOwner, repoName, path)
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
        
        this.getTree = function(repoOwner, repoName, rootPath)
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

        this.getOrCreateFile = function(repoOwner, repoName, path)
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

        this.listFiles = function(repoOwner, repoName, directory)
        {
            return this.getFile(repoOwner, repoName, directory);
        };

        this.commitChange = function(originalFile, newContent, message)
        {
            var p = wrapAjax($.ajax(originalFile.url,
                                    {type: "PUT",
                                     headers: {"Authorization": "token " + this.token},
                                     dataType: "json",
                                     data: JSON.stringify(
                                     {
                                        message: message,
                                        content: B64.btoa(newContent), // base-64 encode
                                        sha: originalFile.sha,
                                        branch: this.branch
                                     })
                                     }));
                                     
            if (this.enableLogging)
                p.then(function(f) {
                    console.log("GITHUB:","File \"" + originalFile.path + "\" updated successfully.");
                });
                
            return p;
        };
        
        this.listBranches = function(repoOwner, repoName)
        {
            return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/branches",
                                   {
                                       data: {"access_token": this.token},
                                       type: "GET",
                                       dataType: "json",
                                       //cache: false
                                   }));
        };

        this.getRepo = function(repoOwner, repoName) {
            return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName,
                                   {
                                        data: {"access_token": this.token},
                                        type: "GET",
                                        dataType: "json",
                                   }));
        }

        this.getForks = function(repoOwner, repoName) {
            return wrapAjax($.ajax("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/forks",
                                   {
                                        data: {"access_token": this.token},
                                        type: "GET",
                                        dataType: "json",
                                   }));
        }

        this.getMyRepos = function() {
            return wrapAjax($.ajax("https://api.github.com/user/repos",
                                   {
                                        data: {"access_token": this.token},
                                        type: "GET",
                                        dataType: "json",
                                   }));
        }

    }

    return Github;

});