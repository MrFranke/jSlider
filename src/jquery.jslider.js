if ( typeof define === 'function' ) {
    define(['jquery'], function($) {startSlider();});
}else{
    startSlider();
}

function startSlider () {

$.fn.jSlider = function( options ) {
        
    var settings = $.extend( {
                SLIDER_CSS_CLASS: 'js-slider' // Класс для слайдера. Если такой класс уже есть, его можно переопределить
              , verticalDirection: false
              , animation: true  // Анимирует перелистывание картинок
              , autoRatating: false     // Автоматическое перелистывание (принимает значение в миллисекундах)
              , activEl: 1              // Элемент, который будет активным при инициализации слайдера
              , alignment: !options.verticalDirection // Автоматическое выравниывние элементов (все превью должны быть одинаковы)
              , review: true
              , rotator: true
              , pagination: false
              , tests: false
              , touch: true
              , visableElements: 4  // Колличество видимых \на странице элементов
              , step: options.verticalDirection ? 1 : 4     // Если вертикальный слайдер, то перематываем на 1 шаг вперед (если не указанно другое)
              , slideOnLastFirstEl: !options.verticalDirection // Крутит слайдер при нажатии на крайние элементы
              , maxDiffForImageRotating: 5  // Колличество изображений которое прокручиваетсяс анимацией, если нужно прокрутить больше картинок, то запускается альтернативная анимация
              , motionlessPreview: false // Если true, то превью не перемещается
              , resizable: false


              , preloadCallback: null // Функция, которая вызывается сразу после инициализации слайдера
              , changeActiveElCallback: null // Функция, которая вызывается во время смены активного элемента

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
          ;

        // TODO: Придумать более надежную систему подгрузки модулей. 
        var modules = [settings.review?     '../../../src/modules/frames'     : null,
                       settings.rotator?    '../../../src/modules/preview'    : null,
                       settings.pagination? '../../../src/modules/pagination' : null,
                       settings.touch?      '../../../src/modules/touchEvents': null,
                       settings.tests?      '../../../src/modules/tests'      : null];

        // Инициализируем все модули для слайдера
        function init () {
            // Подгружает и инициализирует модули слайдера
            require(modules, function () {
                modules = [];
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
        
        /*
         * Функция ждет загрузки всех картинок в слайдере и после того как они все прогрузятся, она его запускает
         */
        function waitingAllImg ( callback ) {
            var counter = 0
              , errors = 0
              , numImg = $slider.find('img').length
              ;
            
            $slider.find('img').each(function(){
                if ( this.complete ) {
                    counter++;
                    if ( counter === numImg ) {
                        console.log('done! with complete', $slider);
                        callback(errors, counter);
                    }
                    
                }
                
                $(this).load(function(){
                    counter++;
                    $slider.trigger('jSlider.loadImage', [counter]);

                    if ( counter === numImg ){
                        console.log('done! with load', $slider);
                        callback(errors, counter);
                    }
                });
                
                $(this).error(function(){
                    counter++;
                    errors++;
                    $slider.trigger('jSlider.loadImage', [counter]);

                    if ( counter === numImg ) {
                        console.log('done! with error', $slider);
                        callback(errors, counter);
                    }

                    var index = $(this).parents('.js-slider_review_item').index();
                    remove(index);
                });
                $(this).attr('src', $(this).attr('src'));
            });
        }

        /**
         * Проверяет переданный индекс
         */
        function checkIndexOverBounds (i) {
            return i >= 0 && i < numItems;
        }
        
        function changeActiveElement ( index ) {
            if ( !checkIndexOverBounds(index) ) { return false; }     // Если индекс больше колличества картинок, или меньше - ничего не делаем
            $slider.trigger('jSlider.activeElementChanged', [index]);
            settings.activEl = index;
            return this;
        }
        
        function remove ( index ) {
            if ( isInit ) {
                $slider.trigger('jSlider.remove', [index]);
                console.log(index);
                console.log( $('.js-slider_preview_item').eq(index) );
                return this;
            }
            $slider.find('.js-slider_review_item:eq('+index+')').remove();
            $slider.find('.js-slider_preview_item:eq('+index+')').remove();
            return this;
        }
        
        function stopAutoRatating () {
            $slider.trigger('jSlider.stopAutoRatating');
            return this;
        }

        function startAutoRatating ( dalay ) {
            $slider.trigger('jSlider.startAutoRatating', [dalay]);
            return this;
        }
        

        // Запускаем слайдер
        waitingAllImg(function(errors, counter){
            
            if ( !isInit ) {
                isInit = true;
                console.log(errors, counter);
                init();
            }
        });

        // Собирает API для работа со слайдером
        var API = {
              stopAutoRatating  : stopAutoRatating
            , startAutoRatating : startAutoRatating
            , changeActiveElement: changeActiveElement
            , $el: $slider
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
    function getCurrentAPI ($slider) {
        var slider = $slider.get? $slider.get(0) : $slider;
        for (var i = 0; i < this.length; i++) {
            if ( this[i].$el.get(0) === slider ) {
                return this[i];
            }
        }
        return null;
    }

    // Объект для ъранения всех API слайдеров
    APIStack = function () {};
    APIStack.prototype = Array.prototype;
    APIStack.prototype.getCurrentAPI = getCurrentAPI;

}