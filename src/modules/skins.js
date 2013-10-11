define([
    'jquery',
    'jslider/skins/standart'
], function(
    $
) {

    function Skins ( slider ) {
        var $slider = slider.$slider
          , skin = slider.settings.skin;

        $slider.on('jSlider.deploy', init);

        function init (e, callback) {
            console.log('deploy with skin: ', skin.name);
            attachFiles();
            callback();
        }

        function attachFiles () {
            
        }

        return {
            init: init
        };

    }

    return Skins;

});