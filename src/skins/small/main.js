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
    
    function Standart ( slider, done ) {
        this.style = styles;
        this.tmp = tmp;
        this.slider = slider;
        
        changeSettings();
        
        this.deploy();

        function changeSettings () {
            var settings = slider.settings;
            settings.frames = false;

            settings.preview.alignment = false;
        }
    }

    Standart.prototype = new prototype;

    return Standart;
});