/**
 * Прототип для всех скинов.
 * Содержит функции для инициализации и создания шаблона со стилями и версткой.
 */
define([
    'jquery',
    'underscore'
], function(
    $
) {
    function Skin () {

        this.setTmp = function () {
            tmp = _.template(this.tmp, {style: this.style});
            console.log('awd');
        };

    }

    return Skin;
});