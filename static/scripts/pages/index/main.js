define([
      'jquery'

    , 'jslider'
    , 'colorbox'
], function(
    $
) {
    function init() {
        var API = $('.slider').jSlider({
              slideOnLastFirstEl: true
            , visableElements: 3
            , activEl: 1
            , fullscreen: true
        });
    }

    return {
        init: init
    };
});