require([
    'jquery',
    '../../../src/jquery.jslider'
], function($, jSlider) {
    $('.slider').jSlider({
        visableElements: 3,
        resizable: false,
        modules: {pagination: true}
    });
    /*$('.slider__vertical').jSlider({
        verticalDirection: true,
        alignment: true,
        visableElements: 3
    });*/
});
