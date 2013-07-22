var jam = {
    "packages": [
        {
            "name": "text",
            "location": "vendor/text",
            "main": "text.js"
        },
        {
            "name": "console-log",
            "location": "vendor/console-log"
        },
        {
            "name": "colorbox",
            "location": "vendor/colorbox",
            "main": "jquery.colorbox.js"
        },
        {
            "name": "jslider",
            "location": "vendor/jslider",
            "main": "jquery.jslider.js"
        },
        {
            "name": "jquery",
            "location": "vendor/jquery",
            "main": "jquery.js"
        },
        {
            "name": "css",
            "location": "vendor/css",
            "main": "css.js"
        },
        {
            "name": "respond",
            "location": "vendor/respond",
            "main": "respond.min.js"
        },
        {
            "name": "js-error-log",
            "location": "vendor/js-error-log"
        },
        {
            "name": "underscore",
            "location": "vendor/underscore",
            "main": "underscore.js"
        },
        {
            "name": "Modernizr",
            "location": "vendor/Modernizr"
        }
    ],
    "version": "0.2.5",
    "shim": {
        "underscore": {
            "exports": "_"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}