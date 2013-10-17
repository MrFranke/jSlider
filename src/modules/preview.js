define([
    'jquery'
], function(
    $
) {

    function Preview (slider) {
        var $slider = slider.$slider
          , settings = slider.settings
          , settingsPreview = slider.settings.preview
          , numItems

          , $preview
          , $previewList
          , $previewOverflow
          , $previewItems
          , $prev
          , $next
          , extremeItems;

        $slider.on('jSlider.start', init);
         
        function init () {
            updateVars();
            bindEvents();

            // Выравнивание элементов превью по ширине видимой области
            if ( settingsPreview.alignment && !settings.vertical ){
                alignmentItems();
            }else{
                normolizeWidth();
            }

            $previewItems.eq( settings.activEl ).addClass('active');
        }

        function updateVars () {
            $preview = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview');
            $previewList = $('.'+settings.SLIDER_CSS_CLASS+'__preview__list', $preview);
            $previewOverflow = $('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow', $preview);
            $previewItems = $('.'+settings.SLIDER_CSS_CLASS+'__preview__item', $preview);
            
            $prev = $('.'+settings.SLIDER_CSS_CLASS+'__preview__nav__prev', $preview);
            $next = $('.'+settings.SLIDER_CSS_CLASS+'__preview__nav__next', $preview);

            settings.preview.elements = {
                $preview         : $preview,
                $previewList     : $previewList,
                $previewItems    : $previewItems,
                $previewOverflow : $previewOverflow,
                $prev            : $prev,
                $next            : $next
            };

            numItems = slider.GLOBALS.numItems;

            extremeItems = {
                first: $previewItems.eq(0)
              , last: $previewItems.eq( settingsPreview.visableElements-1 )
            };

            // Если нет выравнивания, то мы сами определяем количество видимых элементов
            if ( !settingsPreview.alignment && $slider.is(':visible') ) {
                settingsPreview.visableElements = Math.floor($previewOverflow.width() / $previewItems.first().outerWidth());
            }

            // Если нет активного элемента, то устанавливаем его сами
            if ( !$previewItems.filter('active').length ) {
                $previewItems.eq(settings.activEl).addClass('active');
            }

            // Если картинок <= 1 скрываем превью
            if ( numItems <= 1 ) {
                $preview.hide();
            }
        }

        function bindEvents () {
            $slider.on('jSlider.activeElementChanged', function (e, index) {
                slideOnExtremeEl( index );    // Если это крайний элемент, то двигаем слайдер
                checkActiveOverBounds( index );  // Если активный элемент за видимой обастью, скроллим до него
                changeCurrentEl( index );        // Меняет активный элимент в превью (необходимо для смены рамки вокруг активного элемента)
            });
            
            // Вешаем события на стрелки, только если необходимо листать превью
            if ( shouldMove() ) {
                $next.bind('click.slider.rotator', function () {
                    move( settingsPreview.step );
                    slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                    return false;
                });
                $prev.bind('click.slider.rotator', function () {
                    move( -settingsPreview.step );
                    slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                    return false;
                });
            
            // Если превью не нужно листать дизейблим стрелки
            } else {
                disablePreview();
            }

            $previewItems.on('click.slider.rotator, tap.slider.rotator', click);
        }

        /**
         * Если размеры списка меньше размеров видимой облости - уменьшаем видиму область и выравниваем список по центру
         */
        function normolizeWidth () {
            if ( $previewList.width() < $previewOverflow.width() ) {
                $previewOverflow.css({width: $previewList.width()});
            }
        }

        /**
         * Выравнивает превьюшки так, что бы в видимую область влезало необходимое колличество элементов
         * @method: horizontalAlignmen
         * @returns itemMargin {Number} Новый "margin-left" у элементов
         * @private
         */
        function alignmentItems () {
            var visableElements = settingsPreview.visableElements-1
              , itemWidth = $previewItems.first().width()
              , overflowWidth = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__overflow').width()
              , marginLeft
              , $img = $previewItems.first().find('img')
              ;


            // При загрузке слайдера ждем подгрузки картинок
            if ( !itemWidth ) {
                $img.load(function () {
                    itemWidth = $previewItems.first().width();
                    
                    marginLeft = ( overflowWidth - ( itemWidth * (visableElements+1) ) ) / visableElements;
                    marginLeft = marginLeft.toFixed(0);

                    $previewItems.css({
                        marginLeft: marginLeft + 'px'
                    });
                });
            }else{
                marginLeft = ( overflowWidth - ( itemWidth * (visableElements+1) ) ) / visableElements;
                marginLeft = marginLeft.toFixed(0);

                $previewItems.css({
                    marginLeft: marginLeft + 'px'
                });
            }

            return marginLeft;
        }


        /**
         * Если элеменов меньше чем должно быть в видимой области, возвращаем false
         */
        function shouldMove () {
            return settingsPreview.visableElements <= numItems;
        }

        function disablePreview () {
            $next.addClass('disable');
            $prev.addClass('disable');
        }

        /**
         * Обрабатывает нажатие на превью слайдера
         * @method click
         * @private
         */
        function click (e) {
            if ( $(this).hasClass('active') ) {return false;}
            
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
         * Обрабатывает нажатия на крайние элементы превью.
         * @method slideOnExtremeEl
         * @param item {Object}, {Number} Можно передать jquery объект или индекс превью
         * @public
         */
        function slideOnExtremeEl ( item ) {
            if ( !settingsPreview.slideOnExtremeEl ) {return false;}

            var item = typeof item !== 'number' ? item : $previewItems.eq( item );

            if ( item.get(0) === extremeItems.first.get(0) ) {
                move(-1);
                return;
            }

            if ( item.get(0) === extremeItems.last.get(0) ) {
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
            var f = extremeItems.first.index()
              , l = extremeItems.last.index()
              , offset = Math.floor( settingsPreview.visableElements/2 ) // Средний видимый элемент
              , diff = f-i; // То, на сколько нужно прокрутить превью, что бы активный элемент был виден 

            if ( i >= l || i <= f ) {
                if (settings.vertical) {
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
            if ( settingsPreview.dontRotate ) { return false; }
            if ( settings.vertical ) {
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
            var newFirstItemIndex = extremeItems.first.index() + step
              , newItems = changeExtremeItems( newFirstItemIndex)
              , $newFirstItem = newItems.first
              , $newLastItem = newItems.last
              , fIndex = $newFirstItem.index()
              , lIndex = $newLastItem.index()

              , marginItem = parseInt( $newFirstItem.css('marginLeft') , 10)
              , positionItem = $newFirstItem.position().left + marginItem
              , lastBound = $previewList.width() - $previewOverflow.width();
            
            $prev.removeClass('disable');
            $next.removeClass('disable');


            if ( fIndex === 0 ) {
                $prev.addClass('disable');
            }
            if ( lIndex === numItems-1 ) {
                $next.addClass('disable');
            }

            // Выравнивает список по правой границе слайдера
            if ( lastBound < positionItem && lIndex === numItems-1 ) {
                positionItem = lastBound;
            }

            $previewList.stop(true, true).animate({
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
            var fEl = extremeItems.first.index()
              , newActiveIndex = fEl + step
              , newItems = changeExtremeItems( newActiveIndex)
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

            $previewList.stop(true, true).animate({
                top: -positionItem
            });
        }

        /**
         * Меняет первый и последний элементы видимой части списка<br>
         * Не дает им выйти за рамки слайдера, что бы предотвратить прокрутку за пределы списка.<br>
         * @method changeCurrentsItem
         * @param fIndex {Number} Новый индекс первого элемента
         * @returns Возвращает объект со свойствами:<br> 
         *              <i>first</i> - 1й элемент в видимой области<br>
         *              <i>last</i> - последний элемент
         */
        function changeExtremeItems ( newIndex ) {
            var first = newIndex < 0 ? 0 : newIndex  // Первый элемент может быть только 0 или больше
              , newLastIndex = first + settingsPreview.visableElements-1
              , newFirstIndex = first
              , newLast
              , newFirst;

            // Если последний элемент выходит за пределы списка
            if ( newLastIndex > numItems-1 ) { 
                newLastIndex = numItems-1;
                newFirstIndex = (numItems-1) - (settingsPreview.visableElements-1);
                newFirstIndex = newFirstIndex < 0 ? 0 : newFirstIndex; // Если элементов в слайдере меньше видимых элиментов
            }

            newLast = $previewItems.eq( newLastIndex );
            newFirst = $previewItems.eq( newFirstIndex );


            extremeItems.first = newFirst;
            extremeItems.last = newLast;

            return{
                  first: newFirst
                , last: newLast
            };
        }
      

        return {
              init: init
            , slideOnExtremeEl: slideOnExtremeEl
            , alignmentItems: alignmentItems
            , checkActiveOverBounds: checkActiveOverBounds
            , changeCurrentEl: changeCurrentEl
        };

    }
    
    return Preview;
});