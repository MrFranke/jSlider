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

          , direction

          , $substrate
          , tmpSubstrate = '<div id="'+settings.SLIDER_CSS_CLASS+'__substrate" style="'
                            +'width: 100px;'
                            +'height: 100px;'
                            +'position: absolute;'
                            +'display: none;">'
                           +'</div>';

         
        function init () {
            updateVars();
            bindEvents();
        }

        function updateVars () {
            $frames = $('.'+settings.SLIDER_CSS_CLASS+'__frames', $slider);
            $framesList  = $('.'+settings.SLIDER_CSS_CLASS+'__frames__list', $frames);
            $framesItems  = $('.'+settings.SLIDER_CSS_CLASS+'__frames__item', $frames);
            $framesWrapper = $('.'+settings.SLIDER_CSS_CLASS+'__frames__overflow', $frames);
            
            $preview = $('.'+settings.SLIDER_CSS_CLASS+'__preview', $slider);
            $previewList = $('.'+settings.SLIDER_CSS_CLASS+'__preview__list', $preview);
            $previewItems = $('.'+settings.SLIDER_CSS_CLASS+'__preview__item', $preview);
            $previewWrapper = $('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow', $preview);
            $previewLastEl = $previewItems.eq( $previewItems.last().index()+1 - (settings.visableElements) );

            direction = settings.verticalDirection? 'top' : 'left';   // Вертикальный или горизонтальный слайдер
            size = settings.verticalDirection? 'height' : 'width';    // Вертикальный или горизонтальный слайдер
            offset = 0;                                               // Начальное положение списка
            $('body').append(tmpSubstrate);
            $substrate = $('#'+settings.SLIDER_CSS_CLASS+'__substrate');
        }
            

        /**
         * Вешает события для тачскринов
         */
        function bindEvents () {
            $framesList.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent',
                       { 
                           $wrapper: $framesWrapper, 
                           $list: $framesList, 
                           $items: $framesItems,
                           lastBounds: $framesItems.last().position()[ direction ],
                           $lastItem: $framesItems.last(),
                           directFrames: true   // if false -> не меняем активный кадр при перетаскивании мышкой (нужно для слайдов - при перетаскивании меняется активный кадр)
                       }, touchStart);
            
            var margin = settings.verticalDirection? parseInt($previewLastEl.css('marginTop'), 10) : parseInt($previewLastEl.css('marginLeft'), 10);
            
            $previewList.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent',
                        {
                            $wrapper: $previewWrapper, 
                            $list: $previewList, 
                            $items: $previewItems,
                            $lastItem: $previewItems.last(),
                            lastBounds: $previewLastEl.position()[ direction ] + margin
                        }, touchStart);
        }

        function touchStart (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , startCoords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , listPosition = e.data.$list.position()[ direction ]
              , cursorOffset = startCoords - listPosition; // Узнаем позицию относительно элемента, который нужно перемещать
              

            
            // Останавливаем анимацию для того что бы исключить дерганность
            e.data.$list.stop(true, false);
            
            // Передаем опции для события touchend и touchMove
            e.data.startCoords = startCoords;
            e.data.offset = cursorOffset;
            
            $(document).on('touchmove.slider.touchEvent, mousemove.slider.touchEvent', e.data, touchMove);
            $(document).on('touchend.slider.touchEvent, mouseup.slider.touchEvent', e.data, touchEnd);
            
            // Добовляем слой, что бы при перетаскивании нелзя было нажать на превью
            $substrate.css({left:0,top:0}).show();

            slider.stopAutoRatating();
            e.preventDefault();
        }

        function touchMove ( e ) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , coords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , newPosition = coords - e.data.offset
              , newPositionOffset = settings.verticalDirection ? newPosition-e.data.$wrapper.height() : newPosition-e.data.$wrapper.width()  // Для правильного определения правой границы
              , padding = settings.verticalDirection? e.data.$lastItem.outerHeight() / 2 : e.data.$lastItem.outerWidth() / 2
              , lastBounds = settings.verticalDirection ? e.data.$list.height() : e.data.$list.width()
              ;

            // Перемещаем подложку за мышкой
            moveSubstrate(originalEvent.clientX, originalEvent.clientY);

            lastBounds = e.data.$list.width()
            if ( newPosition > padding ) { return false; }
            if ( newPositionOffset < -lastBounds - padding ) { return false; }
            
            e.data.$list.css(direction, newPosition); // Перемещаем элемент за мышкой, учитывая позицию курсора на элементе

            e.preventDefault();
        }

        function touchEnd (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , endCoords = settings.verticalDirection? originalEvent.clientY : originalEvent.clientX
              , position = e.data.$list.position()[ direction ]
              , $middleVisEl = e.data.$items.eq( e.data.$lastItem.index() - (settings.visableElements-1) ) // К этому элементу мы будем подтягивать слайдер, если он выйдет за рамки с правой стороны
              , margin = parseInt($middleVisEl.css('marginLeft'), 10) || parseInt($middleVisEl.css('marginTop'), 10)
              , positionForRightBound = settings.verticalDirection? e.data.$list.height()-e.data.$wrapper.height() : e.data.$list.width()-e.data.$wrapper.width()
              , animateObj = {}
              , newPos = null // Новые координаты слайдера
              ;
            
            $(document).off('touchmove.slider.touchEvent, mousemove.slider.touchEvent', touchMove);
            $(document).off('touchend.slider.touchEvent, mouseup.slider.touchEvent', touchEnd);
            $substrate.hide();

            // Если слайды вылезли за границы, то возвращаем их к активному элементу
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
                positionForRightBound = 
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
            e.stopPropagation();
        }

        /**
         * Проверяет переданные координаты на соответствие границам.
         */
        function checkBounds ( coords, $item, $wrapper ) {
            var size = settings.verticalDirection? $item.last().outerHeight() : $item.last().outerWidth()
              , margin = settings.verticalDirection? $item.last().css('marginTop') : $item.last().css('marginLeft')
              , position = $item.position()[ direction ];
            coords *= -1;
            margin = parseInt(margin, 10);
            // находим границу слайдераs
            var bound = ( position + size + margin ) - $wrapper.width();
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

        /**
         * Перемещает скрытую подложку и не дает ей выйти за границу экрана
         * @param x,y {Number} - позиция подложки
         */
        function moveSubstrate (x,y) {
            x = x - 50;
            y = y - 50;

            if ( x + 100 > $(window).width() ) {
                x = $(window).width()-100;
            }

            if ( y + 100 > $(window).height() ) {
                y = $(window).height()-100;
            }

            $substrate.css({
                left: x,
                top: y
            });
        }

        return{
            init: init
        };

    }

    return Touch;
});