define([
    'jquery',
    'text!./main.css',
    'text!./tmp.html',
    '../skin.prototype'
], function(
    $,
    styles,
    tmp,
    prototype
) {

    function Simple ( slider ) {
        this.style = styles;
        this.tmp = tmp;
        this.slider = slider;
        
        changeSettings();
        this.deploy();

        // Меняем настройки для скина
        function changeSettings () {
            var settings = slider.settings;
            settings.preview = false;
        }
    }

    Simple.prototype = new prototype;

    return Simple;
});