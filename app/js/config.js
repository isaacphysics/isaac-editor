require.config({

    baseUrl: 'js/lib',

    waitSeconds : 0,

    paths: {
        "app": '../app',
        "jquery": '../../../node_modules/jquery/dist/jquery',
        "foundation": '../../../node_modules/foundation-sites/js/foundation',
        "angular": '../../../node_modules/angular/angular',
        "angular-route": '../../../node_modules/angular-route/angular-route',
        "react": 'react-bower-0.10.0/react-with-addons',
        "JSXTransformer": 'react-bower-0.10.0/JSXTransformer',
        "remarkable": '../../../node_modules/remarkable/dist/remarkable',
        "angulartics": '../../../node_modules/angulartics/src/angulartics',
        "angulartics-ga": '../../../node_modules/angulartics/src/angulartics-ga',
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