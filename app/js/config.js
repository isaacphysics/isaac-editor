require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        jquery: '../../bower_components/jquery/dist/jquery',
        modernizr: '../../bower_components/modernizr/modernizr',
        foundation: '../../bower_components/foundation/js/foundation',
        angular: '../../bower_components/angular/angular',
        "angular-route": '../../bower_components/angular-route/angular-route',
    },

    shim: {

        "foundation": ['jquery', 'modernizr'],
        "angular-route": ['angular'],
        "angular": ['jquery'],

    }
});

var app = {}

require(["app/app"]);