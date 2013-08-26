define([
    'jquery'
], function(
    $
) {

    function Touch (slider) {
        var $slider = slider.$slider
          , settings = slider.settings;

          
        $slider.on('jSlider.start', init);

        var $preview
          , $previewItems
          , $previewWrapper
          , $prevLastEl

          , $review
          , $reviewItems
          , $reviewWrapper

          , direction;

         
        function init () {
            updateVars();
            bindEvents();
        }

        function updateVars () {
            $review  = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review');
            $reviewItems  = $review.find('.'+settings.SLIDER_CSS_CLASS+'_review_item');
            $reviewWrapper = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_overflow');

            $preview = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview');
            $previewItems = $preview.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item');
            $previewWrapper = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow');
            $previewLastEl = $previewItems.eq( $previewItems.last().index()+1 - (settings.visableElements) );

            direction = settings.verticalDirection? 'top' : 'left';   // Вертикальный или горизонтальный слайдер
            size = settings.verticalDirection? 'height' : 'width';    // Вертикальный или горизонтальный слайдер
            offset = 0;                                               // Начальное положение списка
        }
            

        /**
         * Вешает события для тачскринов
         */
        function bindEvents () {
            $review.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent', 
                       { 
                           $wrapper: $reviewWrapper, 
                           $list: $review, 
                           $items: $reviewItems,
                           lastBounds: $reviewItems.last().position()[ direction ],
                           $lastItem: $reviewItems.last(),
                           directFrames: true   // if false -> не меняем активный кадр при перетаскивании мышкой (нужно для слайдов - при перетаскивании меняется активный кадр)
                       }, touchStart);
            
            var margin = settings.verticalDirection? parseInt($previewLastEl.css('marginTop'), 10) : parseInt($previewLastEl.css('marginLeft'), 10);
            
            $preview.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent', 
                        {
                            $wrapper: $previewWrapper, 
                            $list: $preview, 
                            $items: $previewItems,
                            $lastItem: $previewItems.last(),
                            lastBounds: $previewLastEl.position()[ direction ] + margin
                        }, touchStart);
        }

        function touchStart (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , startCoords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , listPosition = e.data.$list.position()[ direction ]
              , cursorOffset = startCoords - listPosition // Узнаем позицию относительно элемента, который нужно перемещать
              

            
            // Останавливаем анимацию для того что бы исключить дерганность
            e.data.$list.stop(true, false);
            
            // Передаем опции для события touchend и touchMove
            e.data.startCoords = startCoords;
            e.data.offset = cursorOffset;
            
            $(document).on('touchmove.slider.touchEvent, mousemove.slider.touchEvent', e.data, touchMove);
            $(document).on('touchend.slider.touchEvent, mouseup.slider.touchEvent', e.data, touchEnd);
            
            slider.stopAutoRatating();

            e.preventDefault();
        }

        function touchMove ( e ) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , coords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , newPosition = coords - e.data.offset
              , padding = settings.verticalDirection? e.data.$lastItem.outerHeight() / 2 : e.data.$lastItem.outerWidth() / 2
              ;
            
            
            if ( newPosition > padding ) { return false; }
            if ( newPosition < -e.data.lastBounds - padding ) { return false; }
            
            e.data.$list.css(direction, newPosition); // Перемещаем элемент за мышкой, учитывая позицию курсора на элементе

            e.preventDefault();
        }

        function touchEnd (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , endCoords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , position = e.data.$list.position()[ direction ]
              , $middleVisEl = e.data.$items.eq( e.data.$lastItem.index() - (settings.visableElements-1) ) // К этому элементу мы будем подтягивать слайдер, если он выйдет за рамки с правой стороны
              , margin = parseInt($middleVisEl.css('marginLeft'), 10) || parseInt($middleVisEl.css('marginTop'), 10)
              , positionForRightBound = $middleVisEl.position()[ direction ] + margin
              , animateObj = {}
              , newPos = null // Новые координаты слайдера
              ;
            
            $(document).off('touchmove.slider.touchEvent, mousemove.slider.touchEvent', touchMove);
            $(document).off('touchend.slider.touchEvent, mouseup.slider.touchEvent', touchEnd);
            
            if ( e.data.directFrames && !checkBounds(position, e.data.$lastItem, e.data.$wrapper) ) {
                newPos = e.data.$items.filter('.active').position()[ direction ];
                animateObj[ direction ] = -newPos;
                e.data.$list.animate(animateObj);
                return;
            }

            // Если превью вылезли за левую/верхнюю границу
            if ( position > 0 && !checkBounds(position, e.data.$lastItem, e.data.$wrapper) ) {
                animateObj[ direction ] = 0;
                e.data.$list.animate(animateObj);
                return;
            }
                        
            // Если превью вылезли за правую/нижнюю границу
            if ( position < 0 && !checkBounds(position, e.data.$lastItem, e.data.$wrapper) ) {
                animateObj[ direction ] = -positionForRightBound;
                e.data.$list.animate(animateObj);
                return;
            }
            
            // Если это слайды, то отслеживаем направление жеста и прокручиваем в ту сторону слайдер
            if ( e.data.directFrames ) {
                var inc = findDirection( e.data.startCoords, endCoords );
                slider.changeActiveElement( settings.activEl + inc );
            }

            e.preventDefault();
        }

        /**
         * Проверяет переданные координаты на соответствие границам.
         * Границы высчитывает для 
         */
        function checkBounds ( coords, $item, $wrapper ) {
            var size = settings.verticalDirection? $item.last().outerHeight() : $item.last().outerWidth()
              , position = $item.position()[ direction ];
            coords *= -1;
            // находим границу слайдераs
            var bound = ( position + size ) - $wrapper.width();
            if ( coords < 0 ) { return false; }
            if ( coords > bound ) { return false; }
            return true;
        }

                
        function findDirection ( startCoords, endCoords ) {
            var direction = startCoords - endCoords;
            
            if ( Math.abs(direction) < 30 ) { return 0; }
            if ( direction < 0 ) { return -1; }
            if ( direction > 0 ) { return 1; }
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

        return{
            init: init
        };

    }

    return Touch;
});