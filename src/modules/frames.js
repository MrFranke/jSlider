define([
    'jquery'
], function(
    $
) {

    function Frames (slider) {
        
        var $slider = slider.$slider
          , settings = slider.settings
          , settingsFrames = settings.frames
          ;

        $slider.on('jSlider.start', init);

        var $frames
          , $framesItems
          , framesWidth
          , allElSize
          , isVisable
          , numItems
          , $firstEl
          , $review
          , $prev
          , $next
          , direction
          ;

        allElSize *= numItems;
         
        function init () {
            updateVars();
            bindEvents();
            
            if ( isVisable ) {
                alignImage();
            }
        }

        function updateVars () {
            $frames         = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames');
            $framesItems    = $('.'+settings.SLIDER_CSS_CLASS+'__frames__item', $frames);
            $framesList     = $('.'+settings.SLIDER_CSS_CLASS+'__frames__list', $frames);
            $framesOverflow = $('.'+settings.SLIDER_CSS_CLASS+'__frames__overflow', $frames);
            $prev           = $('.'+settings.SLIDER_CSS_CLASS+'__frames__prev', $frames);
            $next           = $('.'+settings.SLIDER_CSS_CLASS+'__frames__next', $frames);
            $firstEl        = $framesItems.first();
            framesWidth     = $('.'+settings.SLIDER_CSS_CLASS+'__frames__overflow', $frames).width();
            allElSize       = settings.verticalDirection? $firstEl.height() : $firstEl.width();
            numItems        = slider.GLOBALS.numItems;
            direction       = settings.verticalDirection? 'top' : 'left';
            isVisable       = $slider.is(':visible');

            // Если нет активного элемента, то устанавливаем его сами
            if ( !$framesItems.filter('active').length ) {
                $framesItems.eq(settings.activEl).addClass('active');
            }
            
            // Дублируем элементы для использования их в других модулях
            settings.frames.elements = {
                $frames        : $frames,
                $framesItems   : $framesItems,
                $framesList    : $framesList,
                $framesOverflow: $framesOverflow,
                $prev          : $prev,
                $next          : $next
            };

            if ( numItems <= 1 ) {
                $prev.hide();
                $next.hide();
            }

        }

        function bindEvents () {

            $slider.on('jSlider.activeElementChanged', function (e, index) {
                move(index);
            });

            // Вешаем события только если слайдов больше 1, иначе дизейблим стрелки
            if ( shouldMove() ) {
                $next.on('click.slider.review, tap.slider.review', function () {
                   slider.changeActiveElement( settings.activEl+1 );
                   return false;
                });
                $prev.on('click.slider.review, tap.slider.review', function () {
                    slider.changeActiveElement( settings.activEl-1 );
                    return false;
                });

            } else {
                disableSlider();
            }
        }
        
        /**
         * Ширина каждого слайда равна ширине всего слайдера
         */
        function alignImage () {
            framesWidth = $('.'+settings.SLIDER_CSS_CLASS+'__frames__overflow', $frames).width();
            $framesItems.css({width: framesWidth});
        }

        /**
         * Дизейблит стрелки слайдера
         */
        function disableSlider () {
            $prev.addClass('disable');
            $next.addClass('disable');
        }
        
        /**
         * Если элеменов меньше чем должно быть в видимой области, возвращаем false
         */
        function shouldMove () {
            return 1 < numItems;
        }

        /**
         * Перемещает изображения на слайдере
         * @method move
         * @param index {Number} Индекс элемента, на который нужно переключить
         * @public
         */
        function move ( index ) {
            var $el = $framesItems.eq( index )
              , pos = settings.verticalDirection? $el.position().top : $el.position().left
              , diff = Math.abs( index - settings.activEl );
            

            $prev.removeClass('disable');
            $next.removeClass('disable');

            if ( index === 0 ) {
                $prev.addClass('disable');
            }
            if ( index === numItems-1 ) {
                $next.addClass('disable');
            }


            $framesItems.removeClass('active');
            $el.addClass('active');

            settings.activEl = index;
            settings.activEl = index;

            // Если пользователь передал функцию, то выполняем ее вместо стандартной анимации
            if ( typeof settingsFrames.animation === 'function' ) {
                settingsFrames.animation.apply( this, [$framesList, $el, diff, index] );
                return false;
            }

            
            // Если нужно переместить изображение больше чем на 5 слайдев,
            // то не крутим картинки, а скрываем и показываем нужную
            if ( diff > settingsFrames.maxDiffForImageRotating && settingsFrames.animation ) {
                $framesItems.animate({opacity: 0}, 100, function (){
                    $framesList.css(direction, -pos);
                });
                $framesItems.animate({opacity: 1});
            }else{
                rotateAnimation(pos);
            }
        }

        /**
         * Меняем анимацию в зависимости от настройки слайдера
         * @method rotateAnimation
         * @private
         */
        function rotateAnimation (pos) {
            var animateObj = {};
            animateObj[ direction ] = -pos;
            
            if ( settingsFrames.animation ) {
                $framesList
                    .stop(true, false)
                    .animate(animateObj);
            }else{
                $framesList.css(animateObj);
            }
        }

        return{
              init: init
            , move: move
        };

    }


    return Frames;
});