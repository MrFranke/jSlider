define([
    'jquery'
], function(
    $
) {

    function Test (txt) {
        this.test = function () {
            alert(txt);
        }
    }


    return Test;
});