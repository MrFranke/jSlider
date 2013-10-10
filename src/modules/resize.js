define([
    'jquery'
], function(
    $
) {

    function Resize (slider) {

        var $slider = slider.$slider
          , settings = slider.settings
          , settingsResize = settings.resize

          , $frameItems
          , $frameOverflow
          , $frameList

          , previewOverflowWidth
          , $previewItems
          , $previewOverflow

          , frameWidth
          , windowWidth
          , timeout
          , direction;

        $slider.on('jSlider.start', init);

        function init () {
            updateVars();
            bindEvents();
            frames();
        }

        function updateVars () {
            $frameItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__item');
            $frameOverflow = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__overflow');
            $frameList = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__list');
            frameWidth = $frameOverflow.width();

            $previewItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item');
            $previewOverflow = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow');
            $previewList = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__list');
            previewOverflowWidth = $previewOverflow.width();

            windowWidth = $(window).width();
            direction = settings.verticalDirection? 'top' : 'left';

            // Устанавливаем минимальные размеры окна
            if ( settingsResize.width ) {
                $slider.css({minWidth: settingsResize.width});
            }
            if ( settingsResize.height ) {
                $frameOverflow.css({minHeight: settingsResize.height});
            }
        }

        function bindEvents () {
            $(window).resize(resize);
        }

        function resize (e) {
            clearTimeout(timeout);
            timeout = setTimeout(reload, 100);
            frames(e);
            preview(e);
        }

        /**
         * Ресайзит слайды и не дает слайду вылезти за пределы экрана
         */
        function frames (e) {
            frameWidth = $frameOverflow.width();
            var offset = $frameItems.eq(slider.settings.activEl).position()
              , position = offset[direction]
              , newHeight = $frameItems.first().find('img').height();


            if ( settingsResize.width ) {
                $frameItems.css({width: frameWidth});
            }

            if ( settingsResize.height ) {
                $frameOverflow.css({height: newHeight});
            }

            $frameList.css(direction, -position); // Недает сдвигаться элементу относительно видимой обасти при ресайзе
        }

        /**
         * Ресайзит превью
         */
        function preview () {
            settings.preview.visableElements = Math.floor($previewOverflow.width() / $previewItems.first().outerWidth());
            $previewOverflow.css({width: 'inherit'});
        }

        /**
         * При ресайзе слайды смещаются, эта функция выравнивает слайды
         */
        function reload () {
            slider.changeActiveElement( settings.activEl );
            windowWidth = $(window).width();

            if ( $previewList.width() < $previewOverflow.width() ) {
                $previewOverflow.css({width: $previewList.width()});
            }
        }
        
        return {
            init: init
        };
    }

    return Resize;

});