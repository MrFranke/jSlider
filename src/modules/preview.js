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
          , numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item').length
          , isVisable = $slider.is(':visible')
          ;

        $slider.on('jSlider.start', init);

        // Элементы управления превью слайдера
        var $preview = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview')
          , $previewOverflow = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow')
          , $previewItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item')
          , $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__nav__prev')
          , $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__nav__next')
          , lastOrFirstRotatorItems = {
              first: $previewItems.eq(0)
            , last: $previewItems.eq( settings.visableElements-1 )
          }
          ;
         
        function init () {
            bindEvents();

            // Выравнивание элементов превью по ширине видимой области
            if ( settings.alignment && !settings.verticalDirection ){ alignmentItems(); }

            $previewItems.eq( indexActiveItem ).addClass('active');
            
            // Если нет выравнивания, то мы сами определяем количество видимых элементов
            if ( !settings.alignment && $slider.is(':visible') ) {
                settings.visableElements = Math.floor($previewOverflow.width() / $previewItems.first().outerWidth());
            }
        }

        function bindEvents () {
            $slider.on('jSlider.activeElementChanged', function (e, index) {
                slideOnSideElements( index );    // Если это крайний элемент, то двигаем слайдер
                checkActiveOverBounds( index );  // Если активный элемент за видимой обастью, скроллим до него
                changeCurrentEl( index );        // Меняет активный элимент в превью (необходимо для смены рамки вокруг активного элемента)
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

            

            $previewItems.on('click.slider.rotator, tap.slider.rotator', click);
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
        function click (e) {
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

            $preview.stop(true, true).animate({
                left: -positionItem
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

            $preview.stop(true, true).animate({
                top: -positionItem
            });
        }

        /**
         * Выравнивает превьюшки так, что бы в видимую область влезало необходимое колличество элементов
         * @method: horizontalAlignmentItems
         * @returns itemMargin {Number} Новый "margin-left" у элементов
         * @private
         */
        function alignmentItems () {
            var visableElements = settings.visableElements-1
              , itemWidth = $previewItems.first().width()
              , previewsWidth = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow').width()
              , marginLeft
              , marginLeft
              , $img = $previewItems.first().find('img')
              ;


            // При загрузке слайдера ждем подгрузки картинок
            if ( !itemWidth ) {
                $img.load(function () {
                    itemWidth = $previewItems.first().width();
                    
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
            };
        }
      

        return {
              init: init
            , slideOnSideElements: slideOnSideElements
            , alignmentItems: alignmentItems
            , checkActiveOverBounds: checkActiveOverBounds
            , changeCurrentEl: changeCurrentEl
        };

    }
    
    return Preview;
});