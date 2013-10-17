/**
 * Прототип для всех скинов.
 * Содержит функции для инициализации и создания шаблона со стилями и версткой.
 * Для запуска инициализации шаблона нужно запустить метод deploy() после передачи всех необходимых параметров.
 */
define([
    'jquery',
    'lodash'
], function(
    $,
    _
) {
    function Skin () {
        var frames, previews;

        this.deploy = function () {
            this.getItems();
            this.setTmp();
        };

        /**
         * Парсит шаблон и вставляет в слайдер
         */
        this.setTmp = function () {
            tmp = _.template(this.tmp, { style   : this.style,
                                         frames  : frames,
                                         previews: previews,
                                         skinName: this.slider.settings.skin.name,
                                         data    : this.dataForTmp });

            this.slider.$slider.html(tmp);
            this.slider.settings.skin.done();
        };

        
        this.getItems = function () {
            frames = _.map(this.slider.$slider.find('.js-slider__frames__list > *'), getHtml);
            previews = _.map(this.slider.$slider.find('.js-slider__preview__list > *'), getHtml);
        };

        function getHtml (item) {
            return $(item).html();
        }
    }

    return Skin;
});