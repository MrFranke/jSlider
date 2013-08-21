define([
    'jquery'
], function(
    $
) {

    function Preview (slider) {

        var $slider = slider.$slider
          , settings = slider.settings
          ;

        var indexActiveItem = settings.activEl - 1 < 0 ? 0 : settings.activEl - 1
          , numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item').length
          , isVisable = $slider.is(':visible')
          ;

        // Элементы управления превью слайдера
        var $preview = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview')
          , $previewOverflow = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow')
          , $previewItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item')
          , $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_nav_prev')
          , $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_nav_next')
          , lastOrFirstRotatorItems = {
              first: $previewItems.eq(0)
            , last: $previewItems.eq( settings.visableElements-1 )
          }
          , notClick = false
          ;
         
        function init () {
            // Выравнивание элементов превью по ширине видимой области
            if ( settings.alignment ){ alignmentItems(); }

            $previewItems.eq( indexActiveItem ).addClass('active');

            bindEvents();
        }

        function bindEvents () {
            $slider.on('jSlider.activeElementChanged', function (e, index) {
                slideOnSideElements( index );    // Если это крайний элемент, то двигаем слайдер
                checkActiveOverBounds( index );  // Если активный элемент за видимой обастью, скроллим до него
                changeCurrentEl( index );        // Меняет активный элимент в превью (необходимо для смены рамки вокруг активного элемента)
            });

            $slider.on('jSlider.start', function (e, index) {
                
            });
            
            // Вешаем события на стрелки, только если необходимо листать превью
            if ( shouldMove() ) {
                $next.bind('click.slider.rotator', function () {
                    move( settings.step );
                    slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                    return false;
                });
                $prev.bind('click.slider.rotator', function () {
                    move( -settings.step );
                    slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                    return false;
                });
            
            // Если превью не нужно листать дизейблим стрелки
            } else {
                disableRotator();
            }

            $(window).on('resize', resize);

            bindMobileEvent();

            $previewItems.on('click.slider.rotator, tap.slider.rotator', click);
        }

        /**
         * Выравниваем элементы при ресайзе окна
         */
        function resize (e) {
            alignmentItems();
        }

        /**
         * Вешает события для тачскринов
         */
        function bindMobileEvent () {
            var direction = slider.verticalDirection? 'top' : 'left'
              , size = slider.verticalDirection? 'height' : 'width'
              , offset = 0
              
              , startTime   // Время начала жеста
              , startPoint  // Точка положения списка превью на начало жеста
              ;


            $preview.on('touchstart.slider.review, mousedown.slider.review', touchStart);
            $preview.on('touchmove.slider.review', touchMove);
            $preview.on('touchend.slider.review, mouseup.slider.review', touchEnd);

            function touchStart (e) {
                var eventObj = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent;

                startTime = new Date().getTime();
                startPoint = parseInt($preview.css( direction ), 10);

                offset = slider.verticalDirection? eventObj.clientY : eventObj.clientX;

                $(document).on('mousemove.slider.review', touchMove);
                $(document).on('mouseup.slider.review', touchEnd);

                return false;
            }

            function touchMove ( e ) {
                var eventObj = e.originalEvent.changedTouches ? e.originalEvent.changedTouches['0'] : e.originalEvent
                  , currentOffset = slider.verticalDirection? eventObj.clientY : eventObj.clientX
                  , distance = parseInt($preview.css( direction ), 10) || 0
                  , newOffset = 0;

                newOffset = offset - currentOffset;
                offset = currentOffset;

                $preview.css(direction, distance - newOffset);
                notClick = true;
                return false;
            }

            function touchEnd (e) {
                var offsetList = parseInt($preview.css( direction ), 10)
                  , $checkEl = numItems > 1? $previewItems.eq(1) : $previewItems.eq(0)
                  , itemSize = direction === 'left'? $checkEl.outerWidth(true) : $checkEl.outerHeight(true)
                  , activIndex = Math.round(-offsetList/itemSize)

                  // Переменные для инерции
                  , MASS = 100
                  , stopTime = new Date().getTime() // Время остановки жеста
                  , stopPoint = parseInt($preview.css( direction ), 10) // Точка остановки жеста
                  , duration = stopTime - startTime
                  , distance = stopPoint - startPoint
                  , speed = distance/duration
                  , impulse = MASS*speed
                  , anim = {}
                  ;


                // Если имульс слишком мал, то не создаем инерцию
                if ( Math.abs(impulse) < 100 ) {impulse = 0;}

                $(document).off('mousemove.slider.review', touchMove);
                $(document).off('mouseup.slider.review', touchEnd);
                
                // Если переместили превью за границу, возвращаем их обратно без инерции
                if ( activIndex <= 0 || activIndex >= (numItems-1)-Math.round(settings.visableElements/2) ) {
                    
                    if ( activIndex <= 0 ) {
                        checkActiveOverBounds(0);
                        return;
                    }

                    if ( activIndex >= (numItems-1)-Math.round(settings.visableElements/2) ) {
                        checkActiveOverBounds(numItems-1);
                        return;
                    }

                // Продолжает движение по инерции
                }else{
                    anim[direction] = '+='+impulse+'px';
                    $preview.animate(anim, MASS, function () {
                        notClick = false; // Возвращаем возможность выбрать картинку после анимации
                        offsetList = parseInt($preview.css( direction ), 10);
                        activIndex = Math.round(-offsetList/itemSize);
                        

                        if ( activIndex <= 0 ) {
                            checkActiveOverBounds(0);
                            return;
                        }

                        if ( activIndex >= (numItems-1)-Math.round(settings.visableElements/2) ) {
                            checkActiveOverBounds(numItems-1);
                            return;
                        }

                    });
                }
            }
        }

        /**
         * Если элеменов меньше чем должно быть в видимой области, возвращаем false
         */
        function shouldMove () {
            return settings.visableElements <= numItems;
        }

        function disableRotator () {
            $next.addClass('disable');
            $prev.addClass('disable');
        }

        /**
         * Обрабатывает нажатие на превью слайдера
         * @method click
         * @private
         */
        function click () {
            if ( notClick ) {return false;}
            var i = $(this).index();
            slider.changeActiveElement( i ); // Меняет картинку
            changeCurrentEl( i );
            return false;
        }

        /**
         * Меняет класс .active для превью.
         * @method changeCurrentEl
         * 
         */
        function changeCurrentEl ( i ) {
            $previewItems
            .removeClass('active')
                .eq(i)
                .addClass('active');
        }

        /**
         * Определяет первый или последний видимый элемент превью, переданный функции
         * @method slideOnSideElements
         * @param item {Object}, {Number} Можно передать jquery объект или индекс превью
         * @public
         */
        function slideOnSideElements ( item ) {
            if ( !settings.slideOnLastFirstEl ) {return false;}

            var item = typeof item !== 'number' ? item : $previewItems.eq( item );

            if ( item.get(0) === lastOrFirstRotatorItems.first.get(0) ) {
                move(-1);
                return;
            }
            if ( item.get(0) === lastOrFirstRotatorItems.last.get(0) ) {
                move(1);
                return;
            }
        }

        /**
         * Если активный элемент ушел за границы видимой области, то прокручиваем превью так, 
         * что бы он оказался по середине.
         * @method checkActiveOverBounds
         * @param i Индекс нового активного элемента
         * @private
         */
        function checkActiveOverBounds ( i ) {
            var f = lastOrFirstRotatorItems.first.index()
              , l = lastOrFirstRotatorItems.last.index()
              , offset = Math.floor( settings.visableElements/2 ) // Средний видимый элемент
              , diff = f-i; // То, на сколько нужно прокрутить превью, что бы активный элемент был виден 

            if ( i >= l || i <= f ) {
                if (settings.verticalDirection) {
                    move( -diff );
                    return;
                }

                move( -diff - offset );
            }
        }

        /**
         * Обертка для функций вращения превью.
         * @method move
         * @param step {Number} Колличество превью, на которое необходимо провернуть слайдер
         * @private
         */
        function move ( step ) {
            if ( settings.motionlessPreview ) { return false; }
            if ( settings.verticalDirection ) {
                moveVertical( step );
            } else {
                moveHorizontal( step );
            }
        }

        /**
         * Движение слайдера по горизонтали
         * @method moveHorizontal
         * @param step {Number} Колличество элементов, на которое нужно пролестнуть слайдер. <br>
         *               Положительное значение - листает вправо <br>
         *               Отрицательное значение - листает влево <br>
         * @private
         */
        function moveHorizontal ( step ) {
            var newFirstItemIndex = lastOrFirstRotatorItems.first.index() + step
              , newItems = changeLastNFirstEl( newFirstItemIndex,
                                               settings.visableElements,
                                               $previewItems,
                                               lastOrFirstRotatorItems)
              , $newFirstItem = newItems.first
              , $newLastItem = newItems.last
              , fIndex = $newFirstItem.index()
              , lIndex = $newLastItem.index()

              , marginItem = parseInt( $newFirstItem.css('marginLeft') , 10)
              , positionItem = $newFirstItem.position().left + marginItem;
            
            $prev.removeClass('disable');
            $next.removeClass('disable');


            if ( fIndex === 0 ) {
                $prev.addClass('disable');
            }
            if ( lIndex === numItems-1 ) {
                $next.addClass('disable');
            }

            $preview.animate({
                left: -positionItem
            }, function () {
                notClick = false; // Возвращаем возможность кликать
            });
        }

        /**
         * Движение слайдера по вертикале
         * @method moveVertical
         * @param step {Number} Колличество элементов, на которое нужно пролестнуть слайдер.
         * @private
         */
        function moveVertical ( step ) {
            var fEl = lastOrFirstRotatorItems.first.index()
              , newActiveIndex = fEl + step
              , newItems = changeLastNFirstEl( newActiveIndex,
                                               settings.visableElements,
                                               $previewItems,
                                               lastOrFirstRotatorItems)
              , $newFirstItem = newItems.first

              , fIndex = newItems.first.index()
              , lIndex = newItems.last.index()

              , marginItem = $newFirstItem.css('marginTop') === 'auto'? 0 : $newFirstItem.css('marginTop')
              , marginItem = parseInt(marginItem, 10)
              , positionItem = $newFirstItem.position().top + marginItem;
            
            $prev.removeClass('disable');
            $next.removeClass('disable');
            
            if ( fIndex === 0 ) {
                $prev.addClass('disable');
            }
            if ( lIndex === numItems-1 ) {
                $next.addClass('disable');
            }

            $preview.animate({
                top: -positionItem
            }, function () {
                notClick = false; // Возвращаем возможность кликать
            });
        }

        
        /**
         * Вызывает нужный метод для выравнивания превью
         * @method: alignmentItems
         * @private
         */
        function alignmentItems () {
            if ( settings.verticalDirection ) {
                verticalAlignmentItems();
            }else{
                horizontalAlignmentItems();
            }
            
        }

        /**
         * Выравнивает превьюшки так, что бы в видимую область влезало необходимое колличество элементов
         * @method: horizontalAlignmentItems
         * @returns itemMargin {Number} Новый "margin-left" у элементов
         * @private
         */
        function horizontalAlignmentItems () {
            var visableElements = settings.visableElements-1
              , itemWidth = $previewItems.first().width()
              , previewsWidth = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow').width()
              , marginLeft
              , marginLeft
              , $img = $previewItems.first().find('img')
              ;

            
            
            if (settings.resizable) {
                visableElements = settings.visableElements = parseInt((previewsWidth/itemWidth).toFixed(0), 10)-2 || 1;
            }


            // При загрузке слайдера ждем подгрузки картинок
            if ( !itemWidth ) {
                $img.load(function () {
                    itemWidth = $previewItems.first().width();
                    
                    if (settings.resizable) {
                        visableElements = parseInt((previewsWidth/itemWidth).toFixed(0), 10)-2 || 1;
                    }
                    
                    marginLeft = ( previewsWidth - ( itemWidth * (visableElements+1) ) ) / visableElements;
                    marginLeft = marginLeft.toFixed(0);

                    $previewItems.css({
                        marginLeft: marginLeft + 'px'
                    });
                });
            }else{
                marginLeft = ( previewsWidth - ( itemWidth * (visableElements+1) ) ) / visableElements;
                marginLeft = marginLeft.toFixed(0);

                $previewItems.css({
                    marginLeft: marginLeft + 'px'
                });
            }

            return marginLeft;
        }

        /**
         * Выравнивает превьюшки так, что бы в видимую область влезало необходимое колличество элементов
         * @method: verticalAlignmentItems
         * @returns itemMargin {Number} Новый "margin-top" у элементов
         * @private
         */
        function verticalAlignmentItems () {
            var visableElements = settings.visableElements-1
              , itemHeight = $previewItems.first().height()
              , previewsHeight = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow').height()
              , $img = $previewItems.first().find('img')
              , marginTop
              ;

                           
            $img.load(function () {
                itemWidth = $previewItems.first().height();
                marginTop = ( previewsHeight - ( itemHeight * (visableElements+1) ) ) / visableElements
                marginTop = marginTop.toFixed(0);

                $previewItems.css({
                    marginTop: marginTop + 'px'
                });
            });


            return marginTop;
        }

        /**
         * Меняет первый и последний элементы видимой части списка<br>
         * Не дает им выйти за рамки слайдера, что бы предотвратить прокрутку за пределы списка.<br>
         * Используется в rotationList()
         * @method changeCurrentsItem
         * @param fIndex {Number} Новый индекс первого элемента
         * @param visableElNum {Number} Колличество видимых элементов
         * @param $items {Object} jQuery набор всех элементов списка
         * @param lastNfirstElObj {Object} Объект, в котором хранятся первый и последний элемент
         * @param navEl {Object} Объект, содержащий войства:<br>
         *                       <i>prev</i> - стрелка влево<br>
         *                       <i>next</i> - стрелка вправо
         * @returns Возвращает объект со свойствами:<br> 
         *              <i>first</i> - 1й элемент в видимой области<br>
         *              <i>last</i> - последний элемент
         */
        function changeLastNFirstEl ( fIndex, visableElNum, $items, lastNfirstElObj ) {
            var first = fIndex < 0 ? 0 : fIndex  // Первый элемент может быть только 0 или больше
              , newLastIndex = first + visableElNum-1
              , newFirstIndex = first
              , newLast
              , newFirst;

            // Если последний элемент выходит за пределы списка
            if ( newLastIndex > numItems-1 ) { 
                newLastIndex = numItems-1;
                newFirstIndex = (numItems-1) - (visableElNum-1);
                newFirstIndex = newFirstIndex < 0 ? 0 : newFirstIndex; // Если элементов в слайдере меньше видимых элиментов
            }

            newLast = $items.eq( newLastIndex );
            newFirst = $items.eq( newFirstIndex );


            lastNfirstElObj.first = newFirst;
            lastNfirstElObj.last = newLast;

            return{
                  first: newFirst
                , last: newLast
            }
        }

        init();

        return {
              init: init
            , slideOnSideElements: slideOnSideElements
            , alignmentItems: alignmentItems
            , checkActiveOverBounds: checkActiveOverBounds
            , changeCurrentEl: changeCurrentEl
        }

    }
    
    return Preview;
});