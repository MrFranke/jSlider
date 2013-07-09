/*

<div class="slider js-slider">
    <div class="js-slider_pagination">
        <div class="js-slider_pagination_nav js-slider_pagination_nav_prev disable"></div>
        <div class="js-slider_pagination_nav js-slider_pagination_nav_next"></div>
        <div class="js-slider_pagination_overflow">
            <ul class="js-slider_pagination_list" style="left: 0px;"></ul>
        </div>
    </div>

    <div class="slider-big_images-wrapper">            
        <div class="slider-big_images-overflow js-slider_review_overflow">
            <ul class="slider-big_images js-slider_review">
                
                <li class="slider-image js-slider_review_item">
                    <a href="#">
                        <img src="http://fpoimg.com/650x360?text=1">
                    </a>
                </li>
                
                <li class="slider-image js-slider_review_item">
                    <a href="#">
                        <img src="http://fpoimg.com/650x360?text=2">
                    </a>
                </li>
                
                <li class="slider-image js-slider_review_item">
                    <a href="#">
                        <img src="http://fpoimg.com/650x360?text=3">
                    </a>
                </li>

            </ul>
        </div>
    </div>  
    <div class="slider-list-wrapper">
        <div class="slider-list-wrapper-bg"></div>
    
        <div class="slider-nav slider-nav-prev js-slider_nav_prev"></div>
        <div class="slider-nav slider-nav-next js-slider_nav_next"></div>
        
        <div class="slider-list-overfow js-slider_preview_overflow">
            <ul class="slider-list js-slider_preview">                  
                <li class="slider-item js-slider_preview_item">
                    <div class="slider-item-border"></div>
                    <img src="http://fpoimg.com/145x90?text=1">
                </li>
                
                <li class="slider-item js-slider_preview_item">
                    <div class="slider-item-border"></div>
                    <img src="http://fpoimg.com/145x90?text=2">
                </li>
                
                <li class="slider-item js-slider_preview_item">
                    <div class="slider-item-border"></div>
                    <img src="http://fpoimg.com/145x90?text=3">
                </li>
            </ul>
        </div>
    </div>
</div>

*/

$.fn.jSlider = function( options, verticalDirection ) {
    
    var settings = $.extend( {
                SLIDER_CSS_CLASS: 'js-slider' // Класс для слайдера. Если такой класс уже есть, его можно переопределить
              , animation: false  // Анимирует перелистывание картинок, может принимать вид функции, которая будет вызываться при смене картинки
              , autoRatating: false     // Автоматическое перелистывание (принимает значение в миллисекундах)
              , activEl: 0              // Элемент, который будет активным при инициализации слайдера
              , alignment: !verticalDirection // Автоматическое выравниывние элементов (все превью должны быть одинаковы)
              , review: true
              , rotator: true
              , pagination: false
              , visableElements: 4  // Колличество видимых на странице элементов
              , step: verticalDirection ? 1 : 4     // Если вертикальный слайдер, то перематываем на 1 шаг вперед (если не указанно другое)
              , slideOnLastFirstEl: !verticalDirection // Крутит слайдер при нажатии на крайние элементы
              , maxDiffForImageRotating: 5  // Колличество изображений которое прокручиваетсяс анимацией, если нужно прокрутить больше картинок, то запускается альтернативная анимация
              , fullscreen: false    // Инициализация colorbox'a. Можно передать объект настроек colorbox'a

              , preloadCallback: null // Функция, которая вызывается сразу после инициализации слайдера

        }, options);

    
    // Создаем класс для слайдера
    var Slider = function ( $slider, VERTICAL ) {
        
        // Первый и последний элементы превью в видимой области и индекс активной картинки
        var indexActiveItem = settings.activEl < 0 ? 0 : settings.activEl
          , numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item').length
          , VERTICAL = VERTICAL
          , isVisable = $slider.is(':visible')
        
        
        // Инициализируем все модули для слайдера
        function init () {
            if ( settings.review ) { review.init(); } // Инициализируем сам слайдер
            if ( settings.rotator ) { rotator.init(); } // Инициализируем мреаью
            if ( settings.pagination ) { pagination.init(); } // Инициализируем пагинацию
            if ( settings.fullscreen ) { fullscreen.init(); } // Инициализируем fullscreen

            // TODO: если слайдер скрыт, неправильно считает положение всего списка (список уезжает вверх)
            if ( isVisable ) {
                changeActiveElement( indexActiveItem ); // Если при загрузке страницы активный элемент не 1й
            }

            if ( settings.preloadCallback ) { settings.preloadCallback($slider); }
            
        }

        


        /**
         * Методы превью слайдера
         * ==========================================================================
         */


         /**
          * Объект превью слайдера.
          */
        var rotator = (function () {
            // Элементы управления превью слайдера
            var $preview = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview')
              , $previewItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item')
              , $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_nav_prev')
              , $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_nav_next')
              , lastOrFirstRotatorItems = {
                  first: $previewItems.eq(0)
                , last: $previewItems.eq( settings.visableElements-1 )
            };
             
            function init () {                
                // Выравнивание элементов превью по ширине видимой области
                if ( settings.alignment ){ alignmentItems(); }

                $previewItems.eq( indexActiveItem ).addClass('active');

                bindEvents();
            }

            function bindEvents () {
                
                // Вешаем события на стрелки, только если необходимо листать превью
                if ( shouldMove() ) {
                    $next.bind('click.slider.rotator', function () {
                        move( settings.step );
                        review.stopAutoRatating(); // Останавливаем автоматическое вращение
                    });
                    $prev.bind('click.slider.rotator', function () {
                        move( -settings.step );
                        review.stopAutoRatating(); // Останавливаем автоматическое вращение
                    });
                
                // Если превью не нужно листать дизейблим стрелки
                } else {
                    disableRotator();
                }

                $previewItems.bind('click.slider.rotator', click);
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
                var i = $(this).index();
                changeActiveElement( i ); // Меняет картинку
                changeCurrentEl( i )
                review.stopAutoRatating(); // Останавливаем автоматическое вращение
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
                }
                if ( item.get(0) === lastOrFirstRotatorItems.last.get(0) ) { 
                    move(1); 
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

                if ( i > l || i < f ) {
                    if (VERTICAL) {
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
                if ( VERTICAL ) {
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
                });
            }

            
            /**
             * Вызывает нужный метод для выравнивания превью
             * @method: alignmentItems
             * @private
             */
            function alignmentItems () {
                if ( VERTICAL ) {
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
                  , itemWidth = $previewItems.eq(0).width()
                  , previewsWidth = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow').width()
                  , marginLeft
                  , marginLeft

                if ( !isVisable ) {
                    var itemImage = new Image()
                    itemImage.src = $previewItems.first().find('img').attr('src');

                    // Для хрома обязательно нужно дождаться загрузки картинки
                    itemImage.onload = function () {
                        itemWidth = itemImage.width;
                        setLeft();
                    }

                }else{
                    setLeft();
                }

                function setLeft () {
                    marginLeft = ( previewsWidth - ( itemWidth * (visableElements+1) ) ) / visableElements;
                    marginLeft = marginLeft.toFixed(0);

                    $previewItems.css({
                        marginLeft: marginLeft + 'px'
                    });
                };

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
                  , itemHeight = $previewItems.eq(0).height()
                  , previewsHeight = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_overflow').height()
                  , marginTop

                // Если слайдер скрыт, то высчитываем ширину элемента через картинку
                if ( !isVisable ) {
                    var itemImage = new Image()
                    itemImage.src = $previewItems.first().find('img').attr('src');

                    // Для хрома обязательно нужно дождаться загрузки картинки
                    itemImage.onload = function () {
                        itemHeight = itemImage.height;
                        setTop();
                    }
                    
                }else{
                    setTop();
                }

                function setTop () {
                    marginTop = ( previewsHeight - ( itemHeight * (visableElements+1) ) ) / visableElements
                    marginTop = marginTop.toFixed(0);

                    $previewItems.css({
                        marginTop: marginTop + 'px'
                    });   
                }


                return marginTop;
            }

            return {
                  init: init
                , slideOnSideElements: slideOnSideElements
                , alignmentItems: alignmentItems
                , checkActiveOverBounds: checkActiveOverBounds
                , changeCurrentEl: changeCurrentEl
            }

        })();

        /**
         * Методы изображения слайдера
         * ==========================================================================
         */

        var review = (function () {

            var $review = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review')
              , $reviewItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item')
              , $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_prev')
              , $next = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_next')
              , reviewWidth = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_overflow').width() // Записываем ширину списка превью и картинок
              , interval = false
              , activeElIndex = indexActiveItem
             
            function init () {
                $reviewItems.width(reviewWidth); // Делаем ширину контейнера с картинкой равной ширине слайдера
                bindEvents();

                if ( settings.autoRatating ) {
                    autoRatating( settings.autoRatating );
                }
            }

            function bindEvents () {
                // Вешаем события только если слайдев больше 1, иначе дизейблим стрелки
                if ( shouldMove() ) {
                    $next.bind('click.slider.review', function () {
                       changeActiveElement( indexActiveItem+1 );
                       review.stopAutoRatating(); // Останавливаем автоматическое вращение
                    });
                    $prev.bind('click.slider.review', function () {
                        changeActiveElement( indexActiveItem-1 );
                        review.stopAutoRatating(); // Останавливаем автоматическое вращение
                    });
                } else {
                    disableSlider();
                }
            }

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
                  , diff = Math.abs( index - activeElIndex );


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

                indexActiveItem = index;
                activeElIndex = index;

                // Если пользователь передал функцию, то выполняем ее вместо стандартной анимации
                if ( typeof settings.animation === 'function' ) {
                    settings.animation($review, $el, diff, index );
                    return false;
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

            /**
             * Функция автоматического пролистывания слайдера
             * @method autoRatating
             * @param dalay {Number} Задержка при перелистывании в миллисекундах
             * @private
             */
            function autoRatating ( delay ) {
                var itl = setInterval(function () {
                    if ( indexActiveItem >= numItems-1 ) {
                        changeActiveElement( 0 );
                        return false;
                    }
                    
                    changeActiveElement( indexActiveItem+1 );
                }, delay);

                interval = itl;
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
                , stopAutoRatating: stopAutoRatating
                , autoRatating: autoRatating
            }

        })();


        /**
         * Методы пагинации
         * ==========================================================================
         */

        var pagination = (function () {

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
                var $item = $items.eq(1)
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
                changeActiveElement(i);

                review.stopAutoRatating(); // Останавливаем автоматическое вращение
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

            return{
                  init: init
                , move: move
                , rotationList: rotationList
            }

        })();


        var fullscreen = (function () {
            
            var CSS_CLASS = 'js-slider_fullscreen'
              , $fullscreen = $('.'+CSS_CLASS)
              , standartColorboxSettings = {  opacity : 0.5
                                            , rel     : 'photo'
                                            , current : '{current}/{total}' }

              , ColorboxSettings = typeof settings.fullscreen === 'boolean'      // Если в настройках передали объект,
                                   ? standartColorboxSettings                   // записываем его в параметры colorbox'a
                                   : settings.fullscreen;


            function init () {
                if( !$.colorbox ) return false;
                bindEvents();
            }

            function bindEvents () {
                $fullscreen.colorbox( ColorboxSettings );
            }

            return{
                init: init
            };

        })();


        /**
         * Общие методы
         * ==========================================================================
         */

        /**
         * Через этот метод необходимо работать с изменением картинки в слайдере.<br>
         * На нем завязанны слайдер, превью и пагинация
         * @method changeActiveElement
         * @param index {Number} Индекс элемента, на который переключаем слайдер
         * @private
         */
        function changeActiveElement ( index ) {
            if ( !checkIndexOverBounds(index) ) { return false; }

            if ( settings.pagination ) {
                pagination.move( index );               // Перемещаем пагинатор
            }

            if ( settings.rotator ) {
                rotator.slideOnSideElements( index );    // Если это крайний элемент, то двигаем слайдер
                rotator.checkActiveOverBounds( index );  // Если активный элемент за видимой обастью, скроллим до него
                rotator.changeCurrentEl( index );        // Меняет активный элимент в превью (необходимо для смены рамки вокруг активного элемента)
            }

            if ( settings.review ) {
                review.move( index );                  // Меняем картинку
            }


            indexActiveItem = index; // Меняем активный элемент в слайдере
        }

        /**
         * Проверяет переданный индекс на 
         */
        function checkIndexOverBounds (i) {
            return i >= 0 && i < numItems;
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

        // Запускаем слайдер
        init();

        // Собирает API для работа со слайдером
        var API = {
              stopAutoRatating: settings.review ? review.stopAutoRatating : function () {return null}
            , startAutoRatating: settings.review ? review.autoRatating : function () {return null}
        }

        return API;

    }

    var setOfSlider = []; // Массив из возвращаемых слайдеров 

    // Проходимся по всем элементам и создаем слайдер для каждого
    this.each(function () {
        var VERTICAL = !!$(this).data('vertical') ? true : verticalDirection // Если нет data-аттребута, берем значение из переданного слайдеру
          , jSlider = new Slider( $(this), VERTICAL );

        setOfSlider.push( jSlider );
    });

    // Возвращаем объекты слайдера для использония их API ( Пример: $('#slider').jSlider().stopAutoRatating() )
    return setOfSlider.length === 1? setOfSlider[0] : setOfSlider;

};