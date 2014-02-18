require.config({
    //By default load any module IDs from static/js/lib
    baseUrl: 'static/js/lib',

    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        react: 'react/react-with-addons',
        JSXTransformer: 'react/JSXTransformer',
        app: '../app',
        jquery: '../vendor/jquery'
    }
});

var app = {}

require(["app/main"]);