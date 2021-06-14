'use strict';

define(["angular", "app/services/LoginChecker", "app/services/FileLoader", "app/services/FigureUploader", "app/services/SnippetLoader", "app/services/TagLoader", "app/services/IdLoader", "app/services/GameboardChecker"], function() {

    /* Services */
    var SITE_SUBJECT = {
        "localhost:8421": "CS",
        "editor.isaacphysics.org": "PHY",
        "editor.isaaccomputerscience.org": "CS"
    }[document.location.host];

    angular.module('scooter.services', [])

    .constant('SiteSubject', SITE_SUBJECT)

    .constant('Repo', {
        "PHY": {owner: "isaacphysics", name: "rutherford-content"},
        "CS": {owner: "isaacphysics", name: "isaac-content-2"}
    }[SITE_SUBJECT])

    .constant('StagingServer', {
        "PHY": "https://staging.isaacphysics.org",
        "CS": "https://staging.isaaccomputerscience.org"
    }[SITE_SUBJECT])

    .constant('LiveServer', {
         "PHY": "https://isaacphysics.org",
         "CS": "https://isaaccomputerscience.org"
    }[SITE_SUBJECT])

    .service('LoginChecker', require("app/services/LoginChecker"))

    .factory('FileLoader', require("app/services/FileLoader"))

    .factory('FigureUploader', require("app/services/FigureUploader"))

    .service('SnippetLoader', require("app/services/SnippetLoader"))

    .factory('TagLoader', require("app/services/TagLoader"))

    .factory('IdLoader', require("app/services/IdLoader"))

    .factory('GameboardChecker', require("app/services/GameboardChecker"))
});
