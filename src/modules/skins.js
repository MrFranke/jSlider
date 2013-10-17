define([
    'jquery',

    '../skins/standart/main',
    '../skins/simple/main',
    '../skins/small/main',
    '../skins/vertical/main',
], function(
    $,
    standart,
    simple,
    small,
    vertical
) {

    var tmpClass
      , args = arguments
      , skinsMap = { standart: standart,
                     simple  : simple,
                     small   : small,
                     vertical: vertical }; // Карта, для соотношения конструкторов скинов и аргументов

    function Skins ( slider ) {
        var $slider = slider.$slider
          , skin = slider.settings.skin;

        $slider.on('jSlider.deploy', init);

        function init (e, done) {
            // Если вместо параметров шаблона передали имя, превращаем его в объект
            if ( typeof skin === 'string' ) {
                slider.settings.skin = skin = {name: skin, done: done};
            }

            // Если нету функции done, то добавляем ее
            slider.settings.skin.done = slider.settings.skin.done? slider.settings.skin.done : done;

            skin.obj = new skinsMap[ skin.name ]( slider );
        }

        return {
            init: init
        };

    }

    return Skins;

});