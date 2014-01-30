var gitHub = null;
var gitPath = ["src", "main", "resources", "concepts", "maths"];//[];
var gitFile = "";
var file = null;

var repoOwner = "daviesian";
var repoName = "rutherford-content";

RSVP.on('error', function(reason) {
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
            
            try {
                var cvs = $("<canvas />")[0];
                var s = new Image();
                s.src = 'data:image/svg+xml,' + encodeURI(e);
                cvs.width = s.width;
                cvs.height = s.height;

                var ctx = cvs.getContext("2d");
                ctx.drawImage(s,0,0);

                console.warn("PNG:", url, cvs.toDataURL("image/png"));
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
	
	
	$("#content-panel").height($(window).height() - $("#content-panel").offset().top - 120);
	
    // Document ready

    if (typeof tealight_auth_server === "undefined")
    {
        modalError("Server not configured", "The tealight authentication server has not been configured for this deployment of tealight. Please follow the instructions in <code><a href=\"js/github_application.TEMPLATE.js\">js/github_application.TEMPLATE.js</a></code> and then refresh this page.", true);
        return;
    }

    if ("code" in urlParams)
    {
        // This is a callback from Github auth page.

        $.ajax(tealight_auth_server + "?tealight_auth_code=" + tealight_auth_code + "&client_id=" + github_client_id + "&github_code=" + urlParams["code"],
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

$("body").on("click", ".login-button", function(e)
		{
		    $(".login-button").html("loading");
		    document.location.href="https://gitHub.com/login/oauth/authorize?scope=repo&client_id=" + github_client_id;
		});

$("body").on("click", ".logout-button", function(e)
		{
			closeFile(function() {
				clearSequeCookies();
			    gitHub = null;
			    displayGithubStatus();
			});
		});

$("body").on("click", ".save:not(.disabled)", function(e) {
	console.log("Save", file);
	saveFile();
});

function cacheSvgsAsPngs(repoPath) {
    
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
        
    });
}

$("body").on("click", ".preview-tex", function(e) {
    if (file == null || !file.name.endsWith(".tex"))
        return;
    
    function createPdfTex() {
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
    
    
    cacheSvgsAsPngs("src/main/resources")
        .then(createPdfTex)
        .then(function(pdfTex) {
            return pdfTex.compile(file.editedContent);
        }).then(function(dataUrl) {
            console.log("DONE:", dataUrl);
        });//.catch(function(e) { console.error("Error creating PDF:", e); });
});

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
		console.error("Cannot update file browser.");
		return;
	}
	
	gitHub.listFiles(repoOwner, repoName, gitPath.join("/")).then(function(fs) {
		
		var pathNav = $("#git-path").html("");
		
		var a = $("<a/>").attr("href","#").html("ROOT").addClass("git-type-dir");
		a.data("git-path", "");
		if (gitPath.length == 0)
			a.addClass("current disabled");
		pathNav.append(a);
		
		for(var p = 0; p < gitPath.length; p++) {
			var a = $("<a/>").attr("href","#").html(gitPath[p]).addClass("git-type-dir");
			var fullPath = gitPath.slice(0,p+1).join("/");

			a.data("git-path", fullPath);
			
			if (p == gitPath.length - 1)
				a.addClass("current disabled");
			
			pathNav.append(a);
		}
		
		
		
		var browser = $("#git-files").html("");
		for(var f in fs){
			f = fs[f];
			console.log(f);
			
			var li = $("<li/>");
			
			var a = $("<a/>").html(f.name).addClass("git-type-" + f.type).addClass("foundicon-idea").data("git-path", f.path);
			
			
			
			li.append(a);
			

			
			browser.append(li);
			
			
		}
	}).catch(function(e) { 
		console.error("Could not list files:", e);
	});
}

function loadFile(path) {
	
	closeFile(function(){
		
		// We succeeded in closing the file
		
		console.log("Load", path);
		gitHub.getFile(repoOwner, repoName, path).then(function(f) {
			
			f.originalContent = atob(f.content.replace(/\s/g, ''));
            f.editedContent = f.originalContent;
			
			if (path.endsWith(".json")) {
				loadJsonEditor(f);
			} else if (path.endsWith(".tex")) {
				loadTexRaw(f);
			} else {
				loadFileRaw(f);
			}
			
			file = f;
			updateSaveButtons();
			
			$(".git-file-name").html(file.name);
			
			gitFile = f.name;
			updateFileBrowser();
		}).catch(function(e) {
			console.error("Could not load file:", e);
		});
	});
}

$("body").on("click", ".git-type-dir", function(e) {
	var targetPath = $(e.target).data("git-path");
	console.log(targetPath);
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
	
	loadFile(path);
	
});

function loadFileRaw(file) {
	$("#content-panel").empty();
	
	
	
	var cm = CodeMirror($("#content-panel")[0], 
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
	$("#content-panel").empty();
	
	var holder = $("<div/>").attr("id", "json-editor-holder");
	var indentation = 2;
	var modePanel = $("<dl/>").addClass("sub-nav")
	                          .append("<dt>Mode:</dt>");
	
	var modes = ["Text", "Code", "Tree"];
	
	var mode = "code";

	
	for(var m in modes)
	{
		m = modes[m];
		
		var dd = $("<dd/>").append($("<a href=\"#\"/>")
				.html(m)
				.data("editor-mode", m.toLowerCase())
				.click(function(e) {
					
			var newMode = $(e.target).data("editor-mode");
			
			try {
				jsonEditor.setMode(newMode);
				modePanel.find("dd").removeClass("active");
				$(e.target).parent().addClass("active");
				mode = newMode;
			} catch (e) {
				console.error("Error changing mode. Json probably not valid.");
			}

		}));
		
		if (m.toLowerCase() === mode)
			dd.addClass("active");
		
		dd.appendTo(modePanel);
	}
	
	modePanel.appendTo($("#content-panel"));
	holder.appendTo($("#content-panel"));
	                    	
	function jsonChange(e) {

		if (!jsonEditor)
			return; // We are not initialised yet.
		
		
		var newJson = jsonEditor.getText();

		if (mode === "tree")
		{
			// When changing away from Tree mode, we temporarily get invalid JSON, so the parse fails.
			// Just ignore this, as it will be valid again before the mode finishes changing.
			try {
				newJson = JSON.stringify(jsonEditor.get(), null, indentation);
			} catch (e) {
				console.error("Tree not returning valid JSON");
				//return;
			}
		}
		
		file.editedContent = newJson;
		updateSaveButtons();
	}
	
	
	var jsonEditor = new jsoneditor.JSONEditor(holder[0], 
			{mode: mode,
		     indentation: indentation,
		     change: jsonChange});

	jsonEditor.setText(file.originalContent);
}

function closeFile(successCallback, failCallback) {
	if (fileIsEdited()) 
	{
		$("#modal").on("closed", function(e) {
			$("#modal").off("closed");
			if (failCallback)
				failCallback();
		});
		
		$("#modal").on("click", ".close-cancel", function(e) {
			$("#modal").off("click");			
			$("#modal").foundation("reveal", "close");
		});
		
		$("#modal").on("click", ".close-save", function(e) {
			$("#modal").off("click");
			$("#modal").off("closed");
			
			saveFile();
			
			$("#content-panel").empty();
			file = null;
			if (successCallback)
				successCallback();

			$("#modal").foundation("reveal", "close");
		});
		
		$("#modal").on("click", ".close-discard", function(e) {
			$("#modal").off("click");
			$("#modal").off("closed");
			
			$("#content-panel").empty();
			file = null;
			if (successCallback)
				successCallback();

			$("#modal").foundation("reveal", "close");
		});
		
		$("#modal").foundation("reveal", "open");
	}
	else
	{
		$("#content-panel").empty();
		file = null;
		if (successCallback)
			successCallback();
	}
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
			var li = $("<li/>").append($("<a href=\"#\"/>").html(b.name).data("git-branch-name", b.name).click(chooseBranch));
			$("#branch-list").append(li);
		}
		
	}).catch(function(e) {
		console.error("Error listing branches:", e);
	});
}

function chooseBranch(e) {
	var branch = $(e.target).data("git-branch-name");
	var openFile = file;

	closeFile(function() {
		gitHub.branch = branch;
		updateFileBrowser();
		$(".current-branch").html(branch);
		
		if (openFile != null) {
			loadFile(openFile.path);
		}
	});
}

function saveFile() {
	if (file == null)
		return;
		
	gitHub.commitChange(file, file.editedContent, "Edited " + file.name).then(function(f) {
		console.log("File saved:", f);
		
		// Merge the new git attributes of the file after save. This includes the updated SHA, so that the next save is correctly based on the new commit.
		for (var attr in f.content) {
			file[attr] = f.content[attr];
		}
		file.originalContent = file.editedContent;
		delete file.editedContent;

		updateSaveButtons();
		
	}).catch(function(e) {
		console.error("Could not save file:", e);
	});
}


