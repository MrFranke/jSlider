require([
    'jquery',
    '../../../src/jquery.jslider'
], function($, jSlider) {
    $('.slider').jSlider({
        visableElements:3,
        step:1,
        resizable: false
    });
    $('.slider__vertical').jSlider({alignment: true}, true);
});
