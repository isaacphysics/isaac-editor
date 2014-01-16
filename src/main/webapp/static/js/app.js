var gitHub = null;
var gitPath = ["src", "main", "resources", "concepts", "maths"];//[];
var gitFile = "";

var repoOwner = "daviesian";
var repoName = "rutherford-content";

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


function getCookie(c_name)
{
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

$(function() {
	$(document).foundation();
	
	$("#content-panel").height($(window).height() - $("#content-panel").offset().top - 20);
	
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
                    clearTealightCookies();
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
        GitHub.login(getCookie("segue-token"), function(g)
        {
            gitHub = g;
            updateFileBrowser();
            displayGithubStatus();
        	updateBranchList();
        }, function(e)
        {
            clearTealightCookies();
            modalError("Login failed", "Github returned the following error message during login: <p><code>" + e.responseJSON.message + "</code>. <p>Your access token may have expired, in which case refreshing this page should fix the problem.");
            ajaxError(e);
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

$("body").on("click", ".save:not(.disabled)", function(e) {
	console.log("Save", file);
	saveFile(file);
});


function modalError(title, message) {
	console.error(title, message);
}

function displayGithubStatus(){
	console.warn("Displaying github status", gitHub);
}




function updateFileBrowser(){
	if (gitHub == null) {
		console.error("Cannot update file browser.");
		return;
	}
	
	gitHub.listFiles(repoOwner, repoName, gitPath.join("/"), function(fs) {
		
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
	}, function(e) { 
		console.error("Could not list files:", e);
	});
}

function loadFile(path) {
	console.log("Load", path);
	gitHub.getFile(repoOwner, repoName, path, function(f) {
		
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
	}, function(e) {
		console.error("Could not load file:", e);
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
	loadFile($(e.target).data("git-path"));
	
});

function loadFileRaw(file) {
	$("#content-panel").empty();
	
	var content = atob(file.content.replace(/\s/g, ''));
	
	var cm = CodeMirror($("#content-panel")[0], 
			{mode: "",
			 theme: "eclipse",//"solarized light",
			 lineNumbers: false,
			 value: content,
			 lineWrapping: true});
	
	
	cm.on("change", function(inst, changeObj) { 
		
		file.editedContent = cm.getValue();
		updateSaveButtons();
	});
	
	return cm;
}

function loadJsonRaw(file)
{
	var cm = loadFileRaw(file);
	cm.setOption("mode", {name: "javascript", json: true});
}

function loadTexRaw(file)
{
	var cm = loadFileRaw(file);
	cm.setOption("mode", "stex");
}

function loadJsonEditor(file)
{
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
	                       	
	var jsonEditor = new jsoneditor.JSONEditor(holder[0], {mode: mode, indentation: indentation});
	
	var json = atob(file.content.replace(/\s/g, ''));


	jsonEditor.setText(json);
	

	var currentJson = jsonEditor.getText();
	setInterval(function(e) {
		var newJson = jsonEditor.getText();
		
		if (mode === "tree")
			newJson = JSON.stringify(jsonEditor.get(), null, indentation);
		
		if (currentJson != newJson)
		{
			console.log("JSON updated:", newJson);
			file.editedContent = newJson;
			updateSaveButtons();
			currentJson = newJson;
		}
	}, 100);
	
}

function closeFile()
{
	$("#content-panel").empty();
	return true;
}

var file = null;

function updateSaveButtons() {
	if (file == null)
	{
		// We don't have a file open.
		$(".save").hide();
	}
	else if (file.editedContent == null || file.editedContent == undefined)
	{
		// We have not edited the file
		$(".save").addClass("disabled")
		  		  .addClass("secondary")
		  		  .removeClass("alert")
		  		  .html("Saved")
		  		  .show();	
			
	}
	else
	{
		// We have edited the file
		$(".save").removeClass("disabled")
        		  .removeClass("secondary")
        		  .addClass("alert")
        		  .html("Save")
        		  .show();	
	}
}


function updateBranchList() {
	gitHub.listBranches(repoOwner, repoName, function(branches) {
		console.log("Branches:", branches);
		
		$("#branch-list").empty();
		for(var b in branches)
		{
			b = branches[b];
			var li = $("<li/>").append($("<a href=\"#\"/>").html(b.name).data("git-branch-name", b.name).click(chooseBranch));
			$("#branch-list").append(li);
		}
		
	}, function(e) {
		console.error("Error listing branches:", e);
	});
}

function chooseBranch(e) {
	var branch = $(e.target).data("git-branch-name");
	var openFile = file;
	
	if (closeFile())
	{
		gitHub.branch = branch;
		updateFileBrowser();
		$(".current-branch").html(branch);
		
		if (openFile != null) {
			loadFile(openFile.path);
		}
	}	
}

function saveFile(file) 
{
	gitHub.commitChange(file, file.editedContent, "Edited " + file.name, function(f) {
		console.log("File saved:", f);
		loadFile(f.content.path);
		updateSaveButtons();
	}, function(e) {
		console.error("Could not save file:", e);
	});
}


