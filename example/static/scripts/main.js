require([
    'jquery',
    'jquery.jslider'
], function($, jSlider) {
    $('.js-slider').jSlider({
        skin: 'standart'
    });

    $('.js-slider__vertical').jSlider({
        skin: 'vertical'
    });

    $('.js-slider__small').jSlider({
        skin: 'small'
    });

    $('.js-slider__simple').jSlider({
        skin: 'simple'
    });
});