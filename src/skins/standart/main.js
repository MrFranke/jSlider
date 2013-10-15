define([
    'jquery',
    'text!./main.css',
    'text!./tmp.html',
    '../skin.prototype',
    'underscore'
], function(
    $,
    styles,
    tmp,
    prototype
) {
    
    function Standart ( $slider ) {
        console.log($slider);
        this.style = styles;
        this.tmp = tmp;
        this.frames = [];
        this.preview = [];
        //this.$deployTag = $('.')
    }

    Standart.prototype = new prototype;

    return Standart;
});