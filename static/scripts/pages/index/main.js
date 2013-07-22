define([
      'jquery'

    , 'jslider'
    , 'colorbox'
], function(
    $
) {
    function init() {

        $('.slider').jSlider({
              slideOnLastFirstEl: true
            , visableElements: 3
            , activEl: 1
            , fullscreen: true
        });


        $('.slider__vertical').jSlider({
              visableElements: 3
            , step: 3
            , alignment: true
            , slideOnLastFirstEl: true
            , activEl: 10
        }, true);
    }

    return {
        init: init
    };
});