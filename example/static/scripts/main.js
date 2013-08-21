require([
    'jquery',
    '../../../src/jquery.jslider'
], function($, jSlider) {
    $('.slider').jSlider({
        visableElements:3,
        resizable: false,
        tests: true
    });
    $('.slider__vertical').jSlider({
    	alignment: true,
    	verticalDirection: true
    });
});
