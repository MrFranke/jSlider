define([
    'jquery'
], function(
    $
) {

    function Resize (slider) {

        var $slider = slider.$slider
          , settings = slider.settings
          , settingsResize = settings.resize

          , $framesItems
          , $framesOverflow
          , $framesList

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
            if ( slider.settings.frames ) {frames();}
        }

        function updateVars () {
            windowWidth = $(window).width();
            direction = settings.vertical? 'top' : 'left';

            if ( slider.settings.previews ) {
                $previewItems = settings.preview.elements.$previewItems;
                $previewList = settings.preview.elements.$previewList;
                $previewOverflow = settings.preview.elements.$previewOverflow;
                previewOverflowWidth = $previewOverflow.width();
            }

            if ( slider.settings.frames ) {
                $framesItems = settings.frames.elements.$framesItems;
                $framesOverflow = settings.frames.elements.$framesOverflow;
                $framesList = settings.frames.elements.$framesList;
                frameWidth = $framesOverflow.width();

                if ( settingsResize.height ) {
                    $framesOverflow.css({minHeight: settingsResize.height});
                }
            }

            // Устанавливаем минимальные размеры окна
            if ( settingsResize.width ) {
                $slider.css({minWidth: settingsResize.width});
            }
        }

        function bindEvents () {
            $(window).resize(resize);
        }

        function resize (e) {
            clearTimeout(timeout);
            timeout = setTimeout(reload, 100);
            
            if ( slider.settings.frames ) {frames(e);}
            if ( slider.settings.previews ) {preview(e);}
        }

        /**
         * Ресайзит слайды и не дает слайду вылезти за пределы экрана
         */
        function frames (e) {
            frameWidth = $framesOverflow.width();
            var offset = $framesItems.eq(slider.settings.activEl).position()
              , position = offset[direction]
              , newHeight = $framesItems.first().find('img').height();


            if ( settingsResize.width ) {
                $framesItems.css({width: frameWidth});
            }

            if ( settingsResize.height ) {
                $framesOverflow.css({height: newHeight});
            }

            
            $framesList.css(direction, -position); // Недает сдвигаться элементу относительно видимой обасти при ресайзе
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

            if ( slider.settings.previews ) {
                if ( $previewList.width() < $previewOverflow.width() ) {
                  $previewOverflow.css({width: $previewList.width()});
                }
            }
        }
        
        return {
            init: init
        };
    }

    return Resize;

});