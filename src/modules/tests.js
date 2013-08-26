define([
    'jquery',
    'chai/chai',
    'mocha/mocha'
], function(
    $,
    chai
) {

    function Tests (slider) {

        var assert = chai.assert;
        mocha.setup('bdd');

        slider.$slider.on('jSlider.start', init);

        function init () {
            $('body').append('<div id="mocha"></div>');

            resetToDefault();
            runTests();
        }

        function resetToDefault () {
            slider.$slider.find('.js-slider_preview_item').first().click();
        }

        function runTests () {
            mocha.run();
        }

    }


    return Tests;
});