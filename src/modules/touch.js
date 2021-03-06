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
          , $previewOverflow
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

            // Запускаем события только для тех модулей, которые подключенны
            if ( slider.settings.frames && slider.settings.touch.frames ) {framesInit();}
            if ( slider.settings.preview && slider.settings.touch.previews ) {previewInit();}
        }

        function updateVars () {
            direction = settings.vertical? 'top' : 'left';   // Вертикальный или горизонтальный слайдер
            size = settings.vertical? 'height' : 'width';    // Вертикальный или горизонтальный слайдер
            offset = 0;                                               // Начальное положение списка
            $('body').append(tmpSubstrate);
            $substrate = $('#'+settings.SLIDER_CSS_CLASS+'__substrate');
        }

        function framesInit () {
            $frames = settings.frames.elements.$frames;
            $framesList = settings.frames.elements.$framesList;
            $framesItems = settings.frames.elements.$framesItems;
            $framesOverflow = settings.frames.elements.$framesOverflow;

            $framesList.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent',
                       { 
                           $wrapper: $framesOverflow, 
                           $list: $framesList, 
                           $items: $framesItems,
                           lastBounds: $framesItems.last().position()[ direction ],
                           $lastItem: $framesItems.last(),
                           directFrames: true   // if false -> не меняем активный кадр при перетаскивании мышкой (нужно для слайдов - при перетаскивании меняется активный кадр)
                       }, touchStart);
        }

        function previewInit () {
            var margin;
            
            $preview = settings.preview.elements.$preview;
            $previewList = settings.preview.elements.$previewList;
            $previewItems = settings.preview.elements.$previewItems;
            $previewOverflow = settings.preview.elements.$previewOverflow;

            lastElIndex = $previewItems.last().index()+1 - (settings.preview.visableElements);
            lastElIndex = lastElIndex  < 0 ? 0 : lastElIndex;
            $previewLastEl = $previewItems.eq( lastElIndex );
            margin = settings.vertical? parseInt($previewLastEl.css('marginTop'), 10) : parseInt($previewLastEl.css('marginLeft'), 10);

            $previewList.on('touchstart.slider.touchEvent, mousedown.slider.touchEvent',
                        {
                            $wrapper: $previewOverflow,
                            $list: $previewList,
                            $items: $previewItems,
                            $lastItem: $previewItems.last(),
                            lastBounds: $previewLastEl.position()[ direction ] + margin
                        }, touchStart);
        }

        function touchStart (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , startCoords = settings.vertical? originalEvent.clientY : originalEvent.clientX
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
              , coords = settings.vertical? originalEvent.clientY : originalEvent.clientX
              , newPosition = coords - e.data.offset
              , padding = settings.vertical? e.data.$lastItem.outerHeight() / 2 : e.data.$lastItem.outerWidth() / 2
              , listWidth = settings.vertical ? e.data.$list.height() : e.data.$list.width()
              , wrapperSize = settings.vertical ? e.data.$wrapper.height() : e.data.$wrapper.width()
              ;

            // Перемещаем подложку за мышкой
            moveSubstrate(originalEvent.clientX, originalEvent.clientY);
            
            // Проверяем границы слайдера
            if ( newPosition > padding ) { return false; }
            if ( newPosition < wrapperSize-listWidth-padding ) { return false; }
            
            e.data.$list.css(direction, newPosition); // Перемещаем элемент за мышкой, учитывая позицию курсора на элементе

            e.preventDefault();
        }

        function touchEnd (e) {
            var originalEvent = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
              , endCoords = settings.vertical? originalEvent.clientY : originalEvent.clientX
              , position = e.data.$list.position()[ direction ]
              , $middleVisEl = e.data.$items.eq( e.data.$lastItem.index() - (settings.preview.visableElements-1) ) // К этому элементу мы будем подтягивать слайдер, если он выйдет за рамки с правой стороны
              , margin = parseInt($middleVisEl.css('marginLeft'), 10) || parseInt($middleVisEl.css('marginTop'), 10)
              , positionForRightBound = settings.vertical? e.data.$list.height()-e.data.$wrapper.height() : e.data.$list.width()-e.data.$wrapper.width()
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
            var size = settings.vertical? $item.last().outerHeight() : $item.last().outerWidth()
              , margin = settings.vertical? $item.last().css('marginTop') : $item.last().css('marginLeft')
              , position = $item.position()[ direction ]
              , wrapperSize = settings.vertical? $wrapper.height() : $wrapper.width();
            coords *= -1;
            margin = parseInt(margin, 10);
            // находим границу слайдераs
            var bound = ( position + size + margin ) - wrapperSize;
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