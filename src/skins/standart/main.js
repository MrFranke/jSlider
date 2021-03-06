/**
 * Стандартный шаблон для слайдера.
 * Содержит превью и слайды. Включены touch события и выравнивание превью с 4мя видимыми элементами
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
        
        this.deploy();
    }

    Standart.prototype = new prototype;

    return Standart;
});