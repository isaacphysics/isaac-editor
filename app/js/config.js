require.config({

    baseUrl: 'js/lib',

    paths: {
        "app": '../app',
        "jquery": '../../bower_components/jquery/dist/jquery',
        "modernizr": '../../bower_components/modernizr/modernizr',
        "foundation": '../../bower_components/foundation/js/foundation',
        "angular": '../../bower_components/angular/angular',
        "angular-route": '../../bower_components/angular-route/angular-route',
        "react": '../../bower_components/react/react-with-addons',
        "JSXTransformer": '../../bower_components/react/JSXTransformer',
        "codemirrorJS": "codemirror/mode/javascript/javascript",
        "mathjax": "../../bower_components/MathJax/MathJax",
    },

    shim: {

        "foundation": ['jquery', 'modernizr'],
        "angular-route": ['angular'],
        "angular": ['jquery'],
        "codemirrorJS": ["codemirror/codemirror"],
    }
});

var app = {}

require(["app/app"]);