define([
    'jquery',
    'chai/chai',
    'mocha/mocha'
], function(
    $,
    chai
) {

    function Tests (slider) {

        var assert = chai.assert
          , activeEl
          ;
        mocha.setup('bdd');

        function init () {
            $('body').append('<div id="mocha"></div>');

            resetToDefault();
            runTests();
        }

        function resetToDefault () {
            activeEl = slider.settings.activEl;
            slider.$slider.find('.js-slider_preview_item').first().click();
            slider.settings.animation = false;
        }

        function resetToUserSettings () {
            slider.settings.animation = false;
        }

        function runTests () {
            describe('Слайдер', function() {
                describe('Стрелки', function() {
                      it('Нажатие на next должно прокрутить слайдер на следующий кадр', function() {
                        slider.$slider.find('.js-slider_review_next').click();
                        assert.equal(slider.settings.activEl, 1, '2-й кадр активен');
                      });
                      it('Нажатие на prev должно прокрутить слайдер на предыдущий кадр', function() {
                        slider.$slider.find('.js-slider_review_prev').click();
                        assert.equal(slider.settings.activEl, 0, '1-й кадр активен');
                      });
                });
            });

            mocha.run();
        }

        init();

    }


    return Tests;
});