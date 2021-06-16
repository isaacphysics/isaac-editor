'use strict';

define(["angular", "app/services/LoginChecker", "app/services/FileLoader", "app/services/FigureUploader", "app/services/SnippetLoader", "app/services/TagLoader", "app/services/IdLoader", "app/services/GameboardChecker"], function() {

    /* Services */

    angular.module('scooter.services', [])

    // Which repo is edited depends on the hostname:
    .constant('Repo', {
        "localhost:8421": {owner: "isaacphysics", name: "rutherford-content"},
        "editor.isaacphysics.org": {owner: "isaacphysics", name: "rutherford-content"},
        "editor.isaaccomputerscience.org": {owner: "isaacphysics", name: "isaac-content-2"}
    }[document.location.host])

    // Where to preview content also depends on hostname:
    .constant('StagingServer', {
        "localhost:8421": "https://staging.isaacphysics.org",
        "editor.isaacphysics.org": "https://staging.isaacphysics.org",
        "editor.isaaccomputerscience.org": "https://staging.isaaccomputerscience.org"
    }[document.location.host])

    .constant('LiveServer', {
         "localhost:8421": "https://isaacphysics.org",
         "editor.isaacphysics.org": "https://isaacphysics.org",
         "editor.isaaccomputerscience.org": "https://isaaccomputerscience.org"
    }[document.location.host])

    .service('LoginChecker', require("app/services/LoginChecker"))

    .factory('FileLoader', require("app/services/FileLoader"))

    .factory('FigureUploader', require("app/services/FigureUploader"))

    .service('SnippetLoader', require("app/services/SnippetLoader"))

    .factory('TagLoader', require("app/services/TagLoader"))

    .factory('IdLoader', require("app/services/IdLoader"))

    .factory('GameboardChecker', require("app/services/GameboardChecker"))


});
