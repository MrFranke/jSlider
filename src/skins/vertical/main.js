/**
 * Вертикальный слайдер
 */
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
    
    function Standart ( slider ) {
        this.style = styles;
        this.tmp = tmp;
        this.slider = slider;
        chsngeSettings();
        this.deploy();

        function chsngeSettings () {
            var settings = slider.settings;

            settings.vertical = true;
        }
    }

    Standart.prototype = new prototype;

    return Standart;
});