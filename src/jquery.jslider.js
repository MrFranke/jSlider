if ( typeof define === 'function' ) {
    define(['jquery'], function($) {startSlider();});
}else{
    startSlider();
}

function startSlider () {

$.fn.jSlider = function( options ) {
        
    var settings = $.extend( true, {
                SLIDER_CSS_CLASS: 'js-slider' // Класс для слайдера. Если такой класс уже есть, его можно переопределить
              , verticalDirection: false
              , autoRatating: false     // Автоматическое перелистывание (принимает значение в миллисекундах)
              , activEl: 1              // Элемент, который будет активным при инициализации слайдера
              , pagination: false,

              touch: true,

              // Стандартные настройки для слайдов
              frames: {
                maxDiffForImageRotating: 5,
                animation: true,
                elements: {}
              },

              // Стандартные настройки превью
              preview: {
                visableElements: 4, // Колличество видимых превью на странице элементов
                alignment: !options.verticalDirection,  // Выравнивание превью по ширине видимой области
                slideOnExtremeEl: !options.verticalDirection, // Перемещение превью при нажатие на крайние элементы
                dontRotate: false,  // Если true, список превью не будет крутиться
                step: options.verticalDirection ? 1 : 4,  // На сколько элементов перемещается список превью
                elements: {}
              },

              resize: {
                height: 300,
                width: 300
              }

        }, options);


    // Создаем класс для слайдера
    var Slider = function ( $slider ) {

        var that = this;
        this.settings = settings;
        this.$slider = $slider;

        this.changeActiveElement = changeActiveElement;
        this.stopAutoRatating = stopAutoRatating;

        // Первый и последний элементы превью в видимой области и индекс активной картинки
        var numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'_review_item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'_preview_item').length
          , isVisable = $slider.is(':visible')
          , isInit = false
          , errorImages = []
          ;

        // TODO: Придумать более надежную систему подгрузки модулей. 
        var modules = [settings.frames?     '../../../src/modules/frames'     : null,
                       settings.preview?    '../../../src/modules/preview'    : null,
                       settings.pagination? '../../../src/modules/pagination' : null,
                       settings.touch?      '../../../src/modules/touchEvents': null,
                       settings.resize?     '../../../src/modules/resize'     : null];

        // Инициализируем все модули для слайдера
        function init () {
            // Удаляем все картинки с ошибками
            var index, $prev, $rev;
            
            for (var i = 0; i < errorImages.length; i++) {
                index = errorImages[i].parents('.'+settings.SLIDER_CSS_CLASS+'__frames__item').length  ? 
                        errorImages[i].parents('.'+settings.SLIDER_CSS_CLASS+'__frames__item').index() : 
                        errorImages[i].parents('.'+settings.SLIDER_CSS_CLASS+'__preview__item').index();
                $rev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item:eq('+index+')');
                $prev = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__item:eq('+index+')');
                
                remove( $rev, $prev );
            }
            
            numItems = $slider.find('.'+settings.SLIDER_CSS_CLASS+'__frames__item').length || $slider.find('.'+settings.SLIDER_CSS_CLASS+'__preview__item').length;
            
            // Подгружает и инициализирует модули слайдера
            require(modules, function () {
                //modules = []; // Перезаписываем массив с модулями, заменяя ссылки на класс модуля
                for (var i = 0; i < arguments.length; i++) {
                    if ( arguments[i] ) {
                        modules.push( new arguments[i]( that ) );
                    }
                }

                // Включает листалку
                if ( settings.autoRatating ) {
                    autoRatating( settings.autoRatating );
                }

                // TODO: если слайдер скрыт, неправильно считает положение всего списка (список уезжает вверх)
                if ( isVisable ) {
                    changeActiveElement( settings.activEl-1 );
                }

                if ( settings.preloadCallback ) { settings.preloadCallback($slider); }
                // Это событие запускает инициализацию всех модулей
                $slider.trigger('jSlider.start', [this]);
            });

        }
        $slider.on('jSlider.loadImage', function (e, error, counter, errorImages) {
            //console.log(error, ' ', counter);
        });

        /**
         * Функция автоматического пролистывания слайдера
         * @method autoRatating
         * @param dalay {Number} Задержка при перелистывании в миллисекундах
         * @private
         */
        function autoRatating ( delay ) {
            var itl = setInterval(function () {
                if ( settings.activEl >= numItems-1 ) {
                    changeActiveElement( 0 );
                    return false;
                }
                
                changeActiveElement( settings.activEl+1 );
            }, delay);

            interval = itl;
        }
        
        /**
         * Функция для обработки загрузки картинок. Удаляет не прогрузившиеся картинки
         */
        function waitingAllImg ( callback ) {
            var counter = 0
              , error = 0
              , numImg = $slider.find('img').length
              ;

            $slider.find('img').each(function(){
                var src = $(this).attr('src')
                  , $this = $(this);

                $this.load(function () {
                   counter++;
                   $slider.trigger('jSlider.loadImage', [error, counter, errorImages]);
                   if ( counter === numImg ) {callback();}
                });

                $this.error(function () {
                    // Записываем ошибку, для того что бы потом удалить эту картинку
                    error++;
                    errorImages.push( $(this) );

                    counter++;
                    $slider.trigger('jSlider.loadImage', [error, counter, errorImages]);
                    if ( counter === numImg ) {
                        callback();
                    }
                });
                
                // Хак для того что бы сработали все события ошибок и загрузки
                $this.attr('src', '#');
                $this.attr('src', src);
            });
            
        }

        function remove ( $rev, $prev ) {
            $rev.remove();
            $prev.remove();
        }

        /**
         * Проверяет переданный индекс
         */
        function checkIndexOverBounds (i) {
            return i >= 0 && i < numItems;
        }

        /**
         * Выравнивает превью
         */
        function alignmentPreview () {
            $slider.trigger('jSlider.alignmentPreview');
        }
        
        /**
         * Менет активный элемент
         * @param {Number} Индекс элемента, который нужно сделать активным
         */
        function changeActiveElement ( index ) {
            if ( !checkIndexOverBounds(index) ) { return false; }     // Если индекс больше количества картинок, или меньше - ничего не делаем
            $slider.trigger('jSlider.activeElementChanged', [index]);
            settings.activEl = index;
            return this;
        }

        function next () {
            changeActiveElement(settings.activEl+1);
        }

        function prev () {
            changeActiveElement(settings.activEl-1);
        }
        
        function stopAutoRatating () {
            $slider.trigger('jSlider.stopAutoRatating');
            return this;
        }

        function startAutoRatating ( dalay ) {
            $slider.trigger('jSlider.startAutoRatating', [dalay]);
            return this;
        }
        

        // Запускаем слайдер после проверки подгрузки всех картинок
        waitingAllImg(init);

        // Собирает API для работа со слайдером
        var API = {
              stopAutoRatating  : stopAutoRatating
            , startAutoRatating : startAutoRatating
            , changeActiveElement: changeActiveElement
            , alignmentPreview: alignmentPreview
            , $slider: $slider
        };

        return API;

    }

    var setOfSlider = new APIStack; // Массив из возвращаемых слайдеров 

    // Проходимся по всем элементам и создаем слайдер для каждого
    this.each(function () {
        setOfSlider.push( new Slider( $(this) ) );
    });

    // Возвращаем объекты слайдера для использония их API ( Пример: $('#slider').jSlider().stopAutoRatating() )
    return setOfSlider.length === 1? setOfSlider[0] : setOfSlider;

};


    /**
     * Функция для поиска API для нужного слайдера.
     * @param $slider {Object} Объект jQuery или DOMNode элемент
     */
    function getCurrentAPI ( $slider ) {
        var slider = $slider.get? $slider.get(0) : $slider;
        for (var i = 0; i < this.length; i++) {
            if ( this[i].$el.get(0) === slider ) {
                return this[i];
            }
        }
        return null;
    }

    // Объект для хранения всех API слайдеров
    APIStack = function () {this.getCurrentAPI = getCurrentAPI;};
    APIStack.prototype = Array.prototype;

}