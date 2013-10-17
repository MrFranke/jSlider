define([
    'jquery'
], function(
    $
) {

    function Pagination (slider) {

        var $slider = slider.$slider
          , settings = slider.settings
          ;

      $slider.on('jSlider.start', init);
        
        var indexActiveItem = settings.activEl - 1 < 0 ? 0 : settings.activEl - 1
          , numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__review__item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item').length
          , isVisable = $slider.is(':visible')
          ;

        var $prev
          , $next
          , $list
          , $items
          , $overflow
          , numVisableEl
          , lastOrFirstPaginationItems = {};

        /**
         * Инициализация пагинации.
         * @method init
         * @private
         */
        function init () {
            var $htmlPagination = $slider.find( '.'+settings.SLIDER_CSS_CLASS+'__pagination__list' );

            if ( $htmlPagination.length ) {
                $htmlPagination.empty(); // Если пагинация уже была созданна, отчищаем ее
                $htmlPagination.append( createPaginationTmp('list') );

            }else{
                $slider.prepend( createPaginationTmp() );
            }
            updateVars();
            bindEvent();
        }
        
        function bindEvent () {
            $slider.on('jSlider.activeElementChanged', function (e, index) {
                move(index);
            });

            $next.on('click.slider.pagination', function () {
                slider.changeActiveElement(indexActiveItem+1);
                slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                return false;
            });
            $prev.on('click.slider.pagination', function () {
                slider.changeActiveElement(indexActiveItem-1);
                slider.stopAutoRatating(); // Останавливаем автоматическое вращение
                return false;
            });
            $items.on('click.slider.pagination', click);
        }

        function updateVars () {
            $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__pagination__nav__prev');
            $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__pagination__nav__next');
            $list = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__pagination__list');
            $items = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__pagination__item');
            $overflow = $('.'+settings.SLIDER_CSS_CLASS+'__pagination__overflow');

            lastOrFirstPaginationItems = searchVisableEl();
        }

        /**
         * Временная функция создания шаблона. Потом шаблон будет создаваться с помощью шаблонизатора
         */
        function createPaginationTmp ( returnList ) {
            var tmp = ''
              , top = '<div class="'+settings.SLIDER_CSS_CLASS+'__pagination">'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'__pagination__nav '+settings.SLIDER_CSS_CLASS+'__pagination__nav__prev"></div>'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'__pagination__nav '+settings.SLIDER_CSS_CLASS+'__pagination__nav__next"></div>'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'__pagination__overflow">'
                            +'<ul class="'+settings.SLIDER_CSS_CLASS+'__pagination__list">'
              , list = ''

              , bottom =    '</ul>'
                        +'</div>'
                     +'</div>';

            for (var i = 0; i < numItems; i++) {
                if ( indexActiveItem === i ) { // Активный элемент
                    list += '<li class="'+settings.SLIDER_CSS_CLASS+'__pagination__item active"><a href="javascript:void(0)">'+(i+1)+'</a></li>';
                    continue;
                }
                list += '<li class="'+settings.SLIDER_CSS_CLASS+'__pagination__item"><a href="javascript:void(0)">'+(i+1)+'</a></li>';
            }

            if ( returnList ) {
                return list;
            }

            tmp = top + list + bottom;
            return tmp;
        }

        /**
         * Находит последний видимый элемент в пагинации <br>
         * @method searchLastVisableEl
         * @returns $lastItem {Object} jQuery объект. Последний видимый элемент
         */
        function searchVisableEl () {
            var itemsLength = $items.length
              , $item = $items.eq( itemsLength > 1 ? 1 : 0 )
              , margin = parseInt( $item.css('marginLeft'), 10) + parseInt( $item.css('marginRight'), 10)
              , itemWidth = $item.width() + margin
              , paginatorWidth = $overflow.width()
              , numVisable = Math.floor(paginatorWidth / itemWidth)
              , indexLastItem = Math.floor( numVisableEl - 1 )
              , $firstItem = $items.eq(0)
              , $lastItem = $items.eq( indexLastItem );

            numVisableEl = numVisable;

            return {
                  first: $firstItem
                , last: $lastItem
            };
        }

        /**
         * Обработка клика на элементе пагинатора
         * @method click
         * @private
         */
        function click () {
            var i = $(this).index();
            slider.changeActiveElement(i);

            slider.stopAutoRatating(); // Останавливаем автоматическое вращение
        }

        /**
         * Перемещает указатель в пагинации на элемент с переданным индексом
         * @method: move
         * @param index {Number} Индекс нового активного элемента в пагинации
         * @public
         */
        function move ( index ) {
            $items
                .removeClass('active')
                    .eq(index)
                        .addClass('active');

            $prev.removeClass('disable');
            $next.removeClass('disable');

            if ( index === 0 ) {
                $prev.addClass('disable');
            }
            if ( index === numItems-1 ) {
                $next.addClass('disable');
            }
            indexActiveItem = index;
            rotationList( index );
        }

        /**
         * Листает список пагинации, если элемент с переданным индексом выходит за область видимости
         * @method rotationList
         * @param i {Number} Индекс активного элемента
         * @public
         */
        function rotationList ( i ) {
            var i = typeof i === 'number' ? i : i.index()
              , offset = Math.floor( numVisableEl/2 ) // Сдвигаем область видимости, что бы активный элемент
              , offsetIndex = i - offset              // был по середине
              , newOffsetEl = changeLastNFirstEl( offsetIndex,
                                                  numVisableEl,
                                                  $items,
                                                  lastOrFirstPaginationItems).first
              , pos = newOffsetEl.position().left;

            $list.stop(true, false).animate({left: -pos});
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

        return{
              init: init
            , move: move
            , rotationList: rotationList
        };
    }


    return Pagination;
});