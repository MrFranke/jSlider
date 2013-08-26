require([
    'jquery',
    '../../../src/jquery.jslider'
], function($, jSlider) {
    $('.slider').jSlider({
        visableElements: 3,
        resizable: false,
        pagination: true
    });
    $('.slider__vertical').jSlider({
    	verticalDirection: true
    });
});
