define(["require", "base64", "rsvp", "jquery", "foundation", "codemirrorJS", "codemirrorTex", 'jsx!app/content_editor'], function(require, B64) {

var folder = "DUMMY";
var file = app.file = null;

var ContentEditor = require("jsx!app/content_editor");

RSVP.on('error', function(reason) {
  console.error(reason);
  console.error(reason.message, reason.stack);
});

String.prototype.endsWith = function(str) {
    return this.indexOf(str) == this.length - str.length;
};

String.prototype.startsWith = function(str) {
    return this.substr(0, str.length) == str;
};

$(function() {
    $(document).foundation();
    
    $("#content-panel").height($(window).height() - $("#content-panel").offset().top - 120);
});


function updateFileBrowser(){
    $("#local-files").html("");

    $.get(folder + "/").then(function(r) {

        var lis = $(r).find("a").each(function() {
            var a = $("<a/>").html($(this).html()).addClass("git-type-file").addClass("foundicon-idea").data("git-path", folder+"/" + $(this).attr("href"));
            $("#local-files").append($("<li/>").append(a));
        });
         
    })
}

function openFile(path) {
    console.log("Loading", path);
    
    closeFile().then(function(){

        $.get(path).then(function(f) {

            if (typeof(f) != "string")
                f = JSON.stringify(f);
                
            file = {
                originalContent: f,
                editedContent: f,
            };

            if (path.endsWith(".json")) {
                loadJsonEditor(file);
            } else if (path.endsWith(".tex")) {
                loadTexRaw(file);
            } else {
                loadFileRaw(file);
            }
        
            updateFileBrowser();
        });
    }).catch(function() {
        console.warn("Aborting file load - previous file not closed");
    });
}

$("body").on("click", ".choose-json-folder", function(e) {
    $(".choose-json-folder").removeClass("success");
    $(e.target).addClass("success")
    folder = $(e.target).data("json-folder");
    updateFileBrowser()
});

$("body").on("click", ".git-type-file", function(e) {
    
    var path = $(e.target).data("git-path");
    
    if (file != null && path == file.path)
        return;
    
    openFile(path);
    
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

        $("#content-panel").empty();
        var editor = app.editor = new ContentEditor($("#content-panel")[0], obj);

        var indentation = 2;

        $("#content-panel").on("docChanged", function(e, oldDoc, newDoc) {

            newJson = JSON.stringify(newDoc, null, indentation);
            file.editedContent = newJson;
        });
    
    } catch (e) {
        console.warn("Loading invalid JSON file, probably.", e, file);
        // Could not parse JSON. Load as a raw file instead.
        loadJsonRaw(file);
    } 
}

function closeFile() {
    return new RSVP.Promise(function(resolve, reject) {
        $("#content-panel").empty();
        file = null;
        resolve();
    });
}

});