define([
    'jquery'
], function(
    $
) {

    function Pagination (slider) {

    	var $slider = slider.$slider
          , settings = slider.settings
          ;
    	
    	var indexActiveItem = settings.activEl - 1 < 0 ? 0 : settings.activEl - 1
          , numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item').length
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
            var $htmlPagination = $slider.find( '.'+settings.SLIDER_CSS_CLASS+'_pagination_list' );

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
            $next.bind('click.slider.pagination', function () {
                changeActiveElement(indexActiveItem+1);
                review.stopAutoRatating(); // Останавливаем автоматическое вращение
            });
            $prev.bind('click.slider.pagination', function () {
                changeActiveElement(indexActiveItem-1);
                review.stopAutoRatating(); // Останавливаем автоматическое вращение
            });
            $items.bind('click.slider.pagination', click);
        }

        function updateVars () {
            $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_pagination_nav_prev');
            $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_pagination_nav_next');
            $list = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_pagination_list');
            $items = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_pagination_item');
            $overflow = $('.'+settings.SLIDER_CSS_CLASS+'_pagination_overflow');

            lastOrFirstPaginationItems = searchVisableEl();
        }

        /**
         * Временная функция создания шаблона. Потом шаблон будет создаваться с помощью шаблонизатора
         */
        function createPaginationTmp ( returnList ) {
            var tmp = ''
              , top = '<div class="'+settings.SLIDER_CSS_CLASS+'_pagination">'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'_pagination_nav '+settings.SLIDER_CSS_CLASS+'_pagination_nav_prev"></div>'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'_pagination_nav '+settings.SLIDER_CSS_CLASS+'_pagination_nav_next"></div>'
                        +'<div class="'+settings.SLIDER_CSS_CLASS+'_pagination_overflow">'
                            +'<ul class="'+settings.SLIDER_CSS_CLASS+'_pagination_list">'
              , list = ''

              , bottom =    '</ul>'
                        +'</div>'
                     +'</div>';

            for (var i = 0; i < numItems; i++) {
                if ( indexActiveItem === i ) { // Активный элемент
                    list += '<li class="'+settings.SLIDER_CSS_CLASS+'_pagination_item active">'+(i+1)+'</li>';
                    continue;
                }
                list += '<li class="'+settings.SLIDER_CSS_CLASS+'_pagination_item">'+(i+1)+'</li>';
            };

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
              , margin = parseInt( $item.css('marginLeft'), 10)
              , itemWidth = $item.width() + margin
              , paginatorWidth = $overflow.width()
              , numVisable = paginatorWidth / itemWidth
              , indexLastItem = Math.floor( numVisableEl - 1 )
              , $firstItem = $items.eq(0)
              , $lastItem = $items.eq( indexLastItem );

            numVisableEl = numVisable;

            return {
                  first: $firstItem
                , last: $lastItem
            }
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

            $list.animate({left: -pos});
        }

        init();

        return{
              init: init
            , move: move
            , rotationList: rotationList
        };
    }


    return Pagination;
});