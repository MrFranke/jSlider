define([
      'jquery'

    , 'jslider'
    , 'colorbox'
], function(
    $
) {
    function init() {

        $('.slider').jSlider({
              animation: true
            , slideOnLastFirstEl: true
            , visableElements: 3
            , pagination: true
            , activEl: 1
            , fullscreen: true
        });


        $('.slider__vertical').jSlider({
              animation: function ( $list, $activeEl, diff, newIndex ) {
                  $list.animate({ top: -$activeEl.position().top });
              }
            , visableElements: 3
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