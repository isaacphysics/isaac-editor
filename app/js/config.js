require.config({

    baseUrl: 'js/lib',

    waitSeconds : 0,

    paths: {
        "app": '../app',
        "jquery": '../../bower_components/jquery/dist/jquery',
        "foundation": '../../bower_components/foundation/js/foundation',
        "angular": '../../bower_components/angular/angular',
        "angular-route": '../../bower_components/angular-route/angular-route',
        "react": '../../bower_components/react/react-with-addons',
        "JSXTransformer": '../../bower_components/react/JSXTransformer',
        "remarkable": '../../bower_components/remarkable/dist/remarkable',
        "angulartics": '../../bower_components/angulartics/src/angulartics',
        "angulartics-ga": '../../bower_components/angulartics/src/angulartics-ga',
        "mathjax": 'https://cdn.isaacphysics.org/vendor/mathjax/2.7.5/MathJax.js?delayStartupUntil=configured',
    },

    shim: {
        "foundation": ['jquery'],
        "angular-route": ['angular'],
        "angular": ['jquery'],
        "angulartics-ga": ["angulartics"],
        "angulartics": ["angular"],
        "showdown/extensions/table": ["showdown/showdown"],
    }
});

var app = {}

require(["app/app"]);