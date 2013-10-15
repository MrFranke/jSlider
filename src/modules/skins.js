define([
    'jquery',

    '../skins/standart/main',
], function(
    $,
    standart
) {

    var tmpClass
      , args = arguments
      , skinsMap = { standart: standart }; // Карта, для соотношения конструкторов скинов и аргументов

    function Skins ( slider ) {
        var $slider = slider.$slider
          , skin = slider.settings.skin;

        $slider.on('jSlider.deploy', init);

        function init (e, done) {
            choiceSkin();
            done();
        }

        function choiceSkin () {
            skin.obj = new skinsMap[ skin.name ]( $slider );
            console.log(skin.obj);
        }

        return {
            init: init
        };

    }

    return Skins;

});