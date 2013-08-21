define([
    'jquery'
], function(
    $
) {

    function Frames (slider) {
        var $slider = slider.$slider
          , settings = slider.settings
          ;

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
          ;

        allElSize *= numItems;
         
        function init () {
            updateVars();
            bindEvents();
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
        }

        function bindEvents () {

            $slider.on('jSlider.activeElementChanged', function (e, index) {
                move(index);
            });

            $slider.on('jSlider.start', function (e) {

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

            bindMobileEvent();
        }

        /**
         * Вешает события для тачскринов
         */
        function bindMobileEvent () {
            var direction = settings.verticalDirection? 'top' : 'left'   // Вертикальный или горизонтальный слайдер
              , size = settings.verticalDirection? 'height' : 'width'    // Вертикальный или горизонтальный слайдер
              , offset = 0  //Изначальный отступ списка с картинками
              , motionStart   // Точка начала движения
              , motionDirection;


            $reviewItems.on('touchstart.slider.review, mousedown.slider.review', touchStart);

            function touchStart (e) {
                var eventObj = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
                offset = motionStart = settings.verticalDirection? eventObj.clientY : eventObj.clientX;
                motionDirection = null;

                $(document).on('touchmove.slider.review, mousemove.slider.review', touchMove);
                $(document).on('touchend.slider.review, mouseup.slider.review', touchEnd);
                
                //review.stopAutoRatating(); // Останавливаем автоматическое вращение
                $slider.trigger('stopAutoRatating');

                e.preventDefault();
            }

            function touchMove ( e ) {
                var eventObj = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
                  , currentOffset = settings.verticalDirection? eventObj.clientY : eventObj.clientX
                  , distance = parseInt($review.css( direction ), 10)
                  , mewMotionDirection
                  , newLeftPosition
                  , newOffset = 0;

                newOffset = offset - currentOffset;
                newLeftPosition = distance - newOffset;
                
                mewMotionDirection = newOffset >= 0 ? 'next' : 'prev';
                
                // Если мы меням напровления во время перетаскивания мы возврощаем элемент
                if ( !motionDirection ) {
                    motionDirection = mewMotionDirection;
                }else if ( motionDirection && motionDirection !== mewMotionDirection ) {
                    motionDirection = 'revert';
                }

                /**
                 * Не дает утащить элемент за пределы экарна
                 * TODO: Работает не стабильно! Пофиксить
                 */
                offset = currentOffset;
                if  (   newLeftPosition*-1 < reviewWidth/-2
                     || newLeftPosition < -(allElSize - reviewWidth/2)
                    ) {
                    return false;
                }

                $review.css(direction, newLeftPosition);

                e.preventDefault();
            }

            function touchEnd (e) {
                var activIndex = settings.activEl;

                switch(motionDirection){
                    case 'prev':
                        activIndex = settings.activEl - 1;
                        break;
                    case 'next':
                        activIndex = settings.activEl + 1;
                        break;
                    default:
                        activIndex = settings.activEl;
                        break;
                }

                activIndex = activIndex < 0 ? 0 : activIndex;
                activIndex = activIndex > numItems-1 ? numItems-1 : activIndex;

                slider.changeActiveElement( activIndex );

                $(document).off('touchmove.slider.review, mousemove.slider.review');
                $(document).off('touchend.slider.review, mouseup.slider.review');
                e.preventDefault();
            }

            /**
             * Возвращает напровление движения курсора в одной плоскости
             * @param start {Number} координаты начала движения
             * @param end {Number} координаты окончания движения
             * @returns {String} 'prev'/'next' в зависиот напровления движения
             */
            function cursorMotionVector (start, end) {
                return start < end ? 'prev' : 'next';
            }
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
            
            if ( settings.animation ) {
              $review.animate({left: -pos});
            }else{
              $review.css({left: -pos});
            }
        }

        function stopAutoRatating () {
            if ( interval ) {
                clearInterval(interval);
                return true;
            }
        }

        init();  // Запускаем модуль

        return{
              init: init
            , move: move
        }

    }


    return Frames;
});