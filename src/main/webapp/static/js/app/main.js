define(["require", "base64", "rsvp", "jquery", "foundation", "codemirrorJS", "codemirrorTex", "app/github", 'jsx!app/content_editor', "tv4"], function(require, B64) {

var gitHub = app.gitHub = null;
var gitPath = app.gitPath = (localStorage.gitPath || "").split("/");
var gitFile = app.gitFile = "";
var file = app.file = null;

var repoOwner = app.repoOwner = "ucam-cl-dtg";
var repoName = app.repoName = "rutherford-content";

var GitHub = require("app/github");
var ContentEditor = require("jsx!app/content_editor");

var schema = {};

var initialBranch = "master";
var initialFile = null;

if(document.location.hash) {
    var hashParts = document.location.hash.substr(1).split(":")
    initialBranch = hashParts[0];
    initialFile = hashParts[1];
}

$.get("/static/content_schema.json").then(function(d){
    schema = JSON.parse(d);
});

ContentEditor.fileLoader = function(relativePath) {
    return new RSVP.Promise(function(resolve, reject) {

        //var fileDir = currentFilePath.substr(0,currentFilePath.lastIndexOf("/"));
        var absPath = gitPath.join("/") + "/" + relativePath;

        gitHub.getFile(repoOwner, repoName, absPath).then(function(f) {
            var dataUrl = "data:image/svg+xml;base64," + f.content.replace(/\s/g, '');
            console.log("Retrieved", f.path, "from git:", dataUrl);
            resolve(dataUrl);
        }).catch(function() {
            console.error("Failed to retrieve", absPath);
        });
    });
}

RSVP.on('error', function(reason) {
  console.error(reason);
  console.error(reason.message, reason.stack);
});

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

String.prototype.endsWith = function(str) {
    return this.indexOf(str) == this.length - str.length;
};

String.prototype.startsWith = function(str) {
    return this.substr(0, str.length) == str;
};

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");

    if (c_start == -1)
        c_start = c_value.indexOf(c_name + "=");

    if (c_start == -1)
    {
        c_value = null;
    }
    else
    {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);

        if (c_end == -1)
            c_end = c_value.length;

        c_value = unescape(c_value.substring(c_start,c_end));
    }

    return c_value;
}

function svg2png(url) {
	return new RSVP.Promise(function(resolve, reject) {
        
        $.ajax(url, {dataType: "text", headers: {"Accept": "application/vnd.github.v3.raw"}}).success(function (e) {
            00
            try {
                var cvs = $("<canvas />")[0];
                var s = new Image();
                s.src = 'data:image/svg+xml,' + encodeURI(e);
                cvs.width = s.width;
                cvs.height = s.height;

                var ctx = cvs.getContext("2d");
                ctx.drawImage(s,0,0);

                console.log("Caching PNG:", url, cvs.toDataURL("image/png"));
                resolve(cvs.toDataURL("image/png"));
            } catch (e) {
                reject(e);
            }
        }).error(function(e) {reject(e);});
    });
}

function clearSegueCookies() {
    document.cookie = 'segue-token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

$(function() {
	$(document).foundation();
	
	$("#modal-compile").height($(window).height() -200);
	$("#compile-console").height($("#modal-compile").height() - 100);
	$("#content-panel").height($(window).height() - $("#content-panel").offset().top - 120);
	
    // Document ready

    var tealightServer = GitHub.application.tealight_auth_server;
    var tealightApp = GitHub.application.hosts[document.location.host];

    if (!tealightServer)
    {
        modalError("Server not configured", "The tealight authentication server has not been configured for this deployment of tealight. Please follow the instructions in <code><a href=\"js/github_application.TEMPLATE.js\">js/github_application.TEMPLATE.js</a></code> and then refresh this page.", true);
        return;
    }

    if ("code" in urlParams)
    {
        // This is a callback from Github auth page.

        $.ajax(GitHub.application.tealight_auth_server + "?tealight_auth_code=" + tealightApp.tealight_auth_code + "&client_id=" + tealightApp.github_client_id + "&github_code=" + urlParams["code"],
               {type: "GET",
                dataType: "json"})
            .success(function(r)
            {
                if (r.access_token)
                {
                    document.cookie = "segue-token=" + r.access_token;
                    document.location.href = document.location.href.split("?")[0];
                }
                else
                {
                    clearSegueCookies();
                    modalError("Login error", "The tealight auth server returned the following error: <code>" + r.error + "</code>");
                }
            }).error(function(e)
            {
                console.error(e);

            });
    }
    else if (getCookie("segue-token"))
    {
        // We already have a token stored in the cookie, login as that user.
        GitHub.login(getCookie("segue-token")).then(function(g) {
            gitHub = g;
            gitHub.branch = initialBranch;

            if(initialFile)
                openFile(initialFile);

            updateFileBrowser();
            displayGithubStatus();
        	updateBranchList();
        }).catch(function(e) {
            clearSegueCookies();
            modalError("Login failed", "Github returned the following error message during login: <p><code>" + e.responseJSON.message + "</code>. <p>Your access token may have expired, in which case refreshing this page should fix the problem.");
        });
    }
    else
    {
        // We do not have a token in the cookie. Display login button.
        displayGithubStatus();
    }

    if ("error" in urlParams)
    {
        modalError("Login Error", "Github returned an error during login: <code>" + urlParams["error"] + "</code>");
    }

	updateSaveButtons();
});

$("body").on("click", ".login-button", function(e) {
    $(".login-button").html("loading");
    document.location.href="https://gitHub.com/login/oauth/authorize?scope=repo&client_id=" + GitHub.application.hosts[document.location.host].github_client_id + "&redirect_uri=" + encodeURIComponent(document.location.protocol + "//" + document.location.host + document.location.pathname);
});

$("body").on("click", ".logout-button", function(e) {
    closeFile().then(function() {
        clearSegueCookies();
        gitHub = null;
        displayGithubStatus();
    });
});

$("body").on("click", ".save:not(.disabled)", function(e) {
	console.log("Save", file);
	saveFile();
});

$(window).bind('beforeunload', function(){
    if (fileIsEdited())
        return 'This file is unsaved. Are you sure you want to leave?';
});

function cacheSvgsAsPngs(repoPath) {
    console.groupCollapsed("Caching and converting SVGs");
    return gitHub.getTree(repoOwner, repoName, repoPath).then(function(t) {
        
        // Build a hash of sha => (promise that will resolve to PNG data URL)
        var promises = {};
        
        for(var n in t.tree) {
            var node = t.tree[n];
            
            if (localStorage[node.sha])
                continue; // This node is already cached in local storage
                
            if (node.type === "blob" && node.path.endsWith(".svg")) // This is an SVG file.
                promises[node.sha] = svg2png("https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/src/main/resources/" + node.path + "?access_token=" + gitHub.token + "&ref=" + gitHub.branch);
        }
        
        return RSVP.hash(promises);
    }).then(function (dataUrls) {
    
        // Extract raw PNG data from hash, store in localStorage.
        for(var sha in dataUrls) 
            localStorage[sha] = atob(dataUrls[sha].split(",")[1]);
        
        console.groupEnd();
    });
}

function createPdfTex() {
    console.log("Building PDFTex File system");
    return gitHub.getTree(repoOwner, repoName, "src/main/resources").then(function(t) {
        var p = new PDFTeX();
        for(var n in t.tree) {
            var node = t.tree[n];
            if (node.type === "tree") {
                p.addExtraFolder(node.path);
            } else if (node.type === "blob") {
                if (node.path.endsWith(".svg")) {
                    p.addExtraFile(node.path.replace(".svg", ".png"), localStorage[node.sha]);
                } else {
                    p.addExtraLazyFile(node.path, "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contents/src/main/resources/" + node.path + "?access_token=" + gitHub.token + "&ref=" + gitHub.branch, node.size);
                }
            }
        }
        return p;
    });
}

$("body").on("click", ".preview-tex", function(e) {
    if (file == null || !file.name.endsWith(".tex"))
        return;

    var worker = null;

    function stdOutCallback(msg) {
        $("#compile-console").append(msg + "\n");
        $("#compile-console").scrollTop(99999999); // Scroll to bottom (!)
    }

    // Start compilation

    var compilePromise = cacheSvgsAsPngs("src/main/resources")
        .then(createPdfTex)
        .then(function (pdfTex) {
            worker = pdfTex;
            console.time("Compilation");
            console.groupCollapsed("Compiling", file.name);
            
            return pdfTex.compile(file.editedContent, stdOutCallback);
        }).then(function (files) {
            console.groupEnd();
            console.timeEnd("Compilation");
            console.log("Compiled:", files.pdf_dataurl);
            $(".compile-view-pdf").data("pdf-data-url", files.pdf_dataurl).show();
        }).finally(function () {
            console.groupEnd()
        });//.catch(function(e) { console.error("Error creating PDF:", e); });

    // Configure modal popup

    var m = $("#modal-compile");
    $(".compile-view-pdf").hide();
    m.foundation("reveal", "open");
    $("#compile-console").empty();

    m.on("closed", function (e) {
        m.off("closed");
        m.off("click");
        compilePromise.catch(function (e) { console.log("Compilation cancelled cleanly"); });
        worker.terminate();
        console.warn("Terminating Compilation");
    });

    m.on("click", ".compile-cancel", function (e) {
        m.foundation("reveal", "close");
    });

    m.on("click", ".compile-view-pdf", function (e) {
        previewPdf($(e.target).data("pdf-data-url"));
        m.off("closed");
        m.off("click");
        m.foundation("reveal", "close");
    });
});

function previewPdf(dataUrl) {
    window.open(dataUrl, "_blank");
}

function modalError(title, message) {
	console.error(title, message);
}

function displayGithubStatus(){
	console.warn("Displaying github status", gitHub);
	if (gitHub == null) {
		$(".require-logout").show();
		$(".require-login").hide();
	} else {
		$(".require-logout").hide();
		$(".require-login").show();
	}
}	

function updateFileBrowser(){
	if (gitHub == null) {
		console.error("Cannot update file browser - no gitHub instance available.");
		return;
	}
	
	gitHub.listFiles(repoOwner, repoName, gitPath.join("/")).then(function(fs) {
		
		var pathNav = $("#git-path").html("");
		
		var a = $("<a/>").attr("href","javascript:void(0)").html("ROOT").addClass("git-type-dir");
		a.data("git-path", "");
		if (gitPath.length == 0)
			a.addClass("current disabled");
		pathNav.append(a);
		
		for(var p = 0; p < gitPath.length; p++) {
			var a = $("<a/>").attr("href","javascript:void(0)").html(gitPath[p]).addClass("git-type-dir");
			var fullPath = gitPath.slice(0,p+1).join("/");

			a.data("git-path", fullPath);
			
			if (p == gitPath.length - 1)
				a.addClass("current disabled");
			
			pathNav.append(a);
		}
		
        localStorage.gitPath = gitPath.join("/");
		
		
		var browser = $("#git-files").html("");
		for(var f in fs){
			f = fs[f];
			
			var li = $("<li/>");
			var a = $("<a/>").html(f.name).addClass("git-type-" + f.type).addClass("foundicon-idea").data("git-path", f.path);
			
			li.append(a);
			
			browser.append(li);
		}
	}).catch(function(e) { 
		console.error("Could not list files. Let's assume it's because we requested an invalid path or branch. Resetting.");
        gitPath = [];
        gitHub.branch = "master";
        document.location.hash = "";
        updateFileBrowser();
	});
}

function openFile(path) {
    console.log("Loading", path);
	
	closeFile().then(function(){
		
		// We succeeded in closing the file
		gitHub.getFile(repoOwner, repoName, path).then(function(f) {
			
			f.originalContent = B64.atob(f.content.replace(/\s/g, ''));
            f.editedContent = f.originalContent;
			
			if (path.endsWith(".json")) {
				loadJsonEditor(f);
			} else if (path.endsWith(".tex")) {
				loadTexRaw(f);
			} else {
				loadFileRaw(f);
			}
			
            document.location.hash = gitHub.branch + ":" + path;
			file = f;
			updateSaveButtons();
			
			$(".git-file-name").show().html(file.name);
			
			gitFile = f.name;
			updateFileBrowser();
		}).catch(function(e) {
			console.error("Could not load file:", e);
		});
	}).catch(function() {
        console.warn("Aborting file load - previous file not closed");
    });
}

$("body").on("click", ".git-type-dir", function(e) {
	var targetPath = $(e.target).data("git-path");
	console.log("Switching to", targetPath);
	if (targetPath !== "")
		gitPath = targetPath.split("/");
	else
		gitPath = [];
	
	updateFileBrowser();
});

$("body").on("click", ".git-type-file", function(e) {
	
	var path = $(e.target).data("git-path");
	
	if (file != null && path == file.path)
		return;
	
	openFile(path);
});

$("body").on("click", ".create-file", function(e) {
    e.preventDefault();

    var newName = window.prompt("Please type a name for the new file. If no extension is provided, \".json\" will be assumed", "untitled");

    if (newName) {

        if (newName.indexOf(".") == -1)
            newName += ".json";

        var newPath = gitPath.join("/") + "/" + newName;

        console.log("Creating", newPath);

        if (newName.endsWith(".json")) {
            var stubPage = {
                type: "page",
                encoding: "markdown",
                value: "# New Page\n\nAdd page content here"
            }
        }

        gitHub.createFile(repoOwner, repoName, newPath, JSON.stringify(stubPage, null, 2)).then(function(f) {
            openFile(newPath);
            updateFileBrowser();

        }).catch(function(e) {
            console.error("Could not create file. Perhaps it already exists.", e);
        });
    }

    return false;
})

$("body").on("click", ".git-file-name", function(e) {
    e.preventDefault();

    var m = $("#modal-file-details");
    m.find("#file-name").html(file.name);
    m.foundation("reveal", "open");

    $(".file-view-github").attr("href", file.html_url);

    return false;
});

$("#modal-file-details").on("click", ".file-delete", function(e) {

    if (confirm("Do you really want to delete this file?")) {
        console.log("Deleting", file.path);

        gitHub.deleteFile(repoOwner, repoName, file.path, file.sha).then(function(f){
            $("#content-panel").empty();
            file = null;
            $(".git-file-name").hide().empty();
            document.location.hash = gitHub.branch + ":";
            updateFileBrowser();            
        });


        $("#modal-file-details").foundation("reveal", "close");
    }
});

$("#modal-file-details").on("click", ".file-modal-close", function(e) {
    $("#modal-file-details").foundation("reveal", "close");
});


function loadFileRaw(file) {
	$("#content-panel").empty();
	
	var cm = app.cm = CodeMirror($("#content-panel")[0], 
			{mode: "",
			 theme: "eclipse",//"solarized light",
			 lineNumbers: false,
			 value: file.originalContent,
			 lineWrapping: true});
	
	
	cm.on("change", function(inst, changeObj) { 
		
		file.editedContent = cm.getValue();
		updateSaveButtons();
	});
	
	return cm;
}

function loadJsonRaw(file) {
	var cm = loadFileRaw(file);
	cm.setOption("mode", {name: "javascript", json: true});
}

function loadTexRaw(file) {
	var cm = loadFileRaw(file);
	cm.setOption("mode", "stex");
}

function loadJsonEditor(file) {

    try {
        // Try to load the file as a JSON object.
        var obj = JSON.parse(file.originalContent);

        console.log("VALIDATION", tv4.validate(obj, schema), tv4.error);

        $("#content-panel").empty();
        var editor = app.editor = new ContentEditor($("#content-panel")[0], obj);

        var indentation = 2;

        $("#content-panel").on("docChanged", function(e, oldDoc, newDoc) {

            newJson = JSON.stringify(newDoc, null, indentation);
            file.editedContent = newJson;
            updateSaveButtons();
        });
    
    } catch (e) {
        console.warn("Loading invalid JSON file, probably.", e);
        // Could not parse JSON. Load as a raw file instead.
        loadJsonRaw(file);
    } 
}

function closeFile() {
    return new RSVP.Promise(function(resolve, reject) {
        if (fileIsEdited()) 
        {
            $("#modal").on("closed", function(e) {
                $("#modal").off("closed");
                reject("Close cancelled");
            });
            
            $("#modal").on("click", ".close-cancel", function(e) {
                $("#modal").off("click");			
                $("#modal").foundation("reveal", "close");
            });
            
            $("#modal").on("click", ".close-save", function(e) {
                $("#modal").off("click");
                $("#modal").off("closed");
                
                saveFile().then(function() {
                    $("#content-panel").empty();
                    file = null;
                    $(".git-file-name").hide().empty();
                    resolve();
                });

                $("#modal").foundation("reveal", "close");
            });
            
            $("#modal").on("click", ".close-discard", function(e) {
                $("#modal").off("click");
                $("#modal").off("closed");
                
                $("#content-panel").empty();
                file = null;
                resolve();

                $("#modal").foundation("reveal", "close");
            });
            
            $("#modal").foundation("reveal", "open");
        }
        else
        {
            $("#content-panel").empty();
            file = null;
            $(".git-file-name").hide().empty();
            resolve();
        }
    });
}

function fileIsEdited() {
	if (file == null)
		return false;
	if (file.editedContent == null || file.editedContent == undefined || file.editedContent == file.originalContent)
		return false;
	return true;
}

function updateSaveButtons() {
	if (file == null)
	{
		// We don't have a file open.
		$(".save").hide();
	}
	else if (fileIsEdited())
	{
		// We have edited the file
		$(".save").removeClass("disabled")
        		  .removeClass("secondary")
        		  .addClass("success")
        		  .html("Save")
        		  .show();	
			
	}
	else
	{
		// We have not edited the file
		$(".save").addClass("disabled")
		  		  .addClass("secondary")
		  		  .removeClass("success")
		  		  .html("Saved")
		  		  .show();	
	}
    
    if (file == null || !file.name.endsWith(".tex")) {
        $(".preview-tex").hide();
    } else {
        $(".preview-tex").show();
    }
}

function updateBranchList() {
	gitHub.listBranches(repoOwner, repoName).then(function(branches) {
		console.log("Branches:", branches);
		
		$("#branch-list").empty();
		for(var b in branches)
		{
			b = branches[b];
			var li = $("<li/>").append($("<a href=\"javascript:void(0)\"/>").html(b.name).data("git-branch-name", b.name).click(chooseBranch));
			$("#branch-list").append(li);
		}
        $(".current-branch").html(gitHub.branch);
		
	}).catch(function(e) {
		console.error("Error listing branches:", e);
	});
}

function chooseBranch(e) {
	var branch = $(e.target).data("git-branch-name");
	var currentFile = file;

	closeFile().then(function() {
		gitHub.branch = branch;
		updateFileBrowser();
		$(".current-branch").html(branch);
		
		if (currentFile != null) {
			openFile(currentFile.path);
		} else {
            document.location.hash = branch + ":";
        }
	});
}

function saveFile() {
    return new RSVP.Promise(function(resolve, reject) {
        if (file == null)
            resolve();
            
        gitHub.commitChange(file, file.editedContent, "Edited " + file.name).then(function(f) {
            console.log("File saved:", f);
            
            // Merge the new git attributes of the file after save. This includes the updated SHA, so that the next save is correctly based on the new commit.
            for (var attr in f.content) {
                file[attr] = f.content[attr];
            }
            file.originalContent = file.editedContent;

            updateSaveButtons();
            resolve();
            
        }).catch(function(e) {
            console.error("Could not save file:", e);
            reject();
        });
    });
}

});