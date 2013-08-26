define([
    'jquery'
], function(
    $
) {

    function Frames (slider) {
        var $slider = slider.$slider
          , settings = slider.settings
          ;

        $slider.on('jSlider.start', init);

        var $reviewItems
          , reviewWidth
          , allElSize
          , isVisable
          , numItems
          , interval
          , $firstEl
          , $review
          , $prev
          , $next
          , direction;
          ;

        allElSize *= numItems;
         
        function init () {
            updateVars();
            bindEvents();
            alignImage();
        }

        function updateVars () {
            $reviewItems    = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item');
            $firstEl        = $reviewItems.first();
            reviewWidth     = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_overflow').width();
            allElSize       = settings.verticalDirection? $firstEl.height() : $firstEl.width();
            isVisable       = $slider.is(':visible');
            numItems        = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item').length;
            interval        = false;
            $review         = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review');
            $prev           = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_prev');
            $next           = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_next');
            direction       = settings.verticalDirection? 'top' : 'left';
        }

        function bindEvents () {

            $slider.on('jSlider.activeElementChanged', function (e, index) {
                move(index);
            });
            
            $slider.on('jSlider.remove', function(e, index){
                remove(index);
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
        
        function alignImage () {
            $reviewItems.css({width: reviewWidth});
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
            var $el = $reviewItems.eq( index )
              , pos = $el.position().left
              , diff = Math.abs( index - settings.activEl );

            $prev.removeClass('disable');
            $next.removeClass('disable');

            if ( index === 0 ) {
                $prev.addClass('disable');
            }
            if ( index === numItems-1 ) {
                $next.addClass('disable');
            }


            $reviewItems.removeClass('active');
            $el.addClass('active');

            settings.activEl = index;
            settings.activEl = index;

            // Если пользователь передал функцию, то выполняем ее вместо стандартной анимации
            if ( typeof settings.animation === 'function' ) {
                settings.animation.apply( this, [$review, $el, diff, index] );
                return false;
            }

            if ( settings.verticalDirection ) {
                $review.animate({ top: -$el.position().top });
            }
            
            // Если нужно переместить изображение больше чем на 5 слайдев,
            // то не крутим картинки, а скрываем и показываем нужную
            if ( diff > settings.maxDiffForImageRotating && settings.animation ) {
                $reviewItems.animate({opacity: 0});
                $review.css({left: -pos});
                $reviewItems.animate({opacity: 1});
                
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
            
            if ( settings.animation ) {
                $review.stop(true, true);
                $review.animate(animateObj);
            }else{
                $review.css(animateObj);
            }
        }
        
        function remove ( index ) {
            $reviewItems.eq(index).remove();
        }

        function stopAutoRatating () {
            if ( interval ) {
                clearInterval(interval);
                return true;
            }
        }

        return{
              init: init
            , move: move
        }

    }


    return Frames;
});