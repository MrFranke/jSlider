/**
 * Sends information to the server for logging.
 * Doesn't care about 'data' object,
 * converts any key-value pairs into string and sends it
 *
 * USE SHORT KEY NAMES! to reduce traffic
 *
 * @example log({
 *              m: message
 *            , u: url
 *            , l: linenumber
 *          }, function() {
 *              console.log( 'callback if needed' )
 *          });
 */
define(function() {
    var domain    = 'http://jse.rbc.ru/';
    

    /**
     * Modifies data and creates and image with needed src
     *
     * @param {Object} data
     * @param {Function} callback
     */
    function log( data, callback ) {
        if ( !data )
            return;

        var logData = getData( data )
          , logImg = new Image()

          , logUrl = domain + '?' + logData;

        logImg.src = logUrl;

        if ( callback && typeof callback === 'function' )
            callback();
    };


    /**
     * @returns key=value string separated '&' sign
     */
    function getData( data ) {
        var logData = [];

        for ( var key in data ) {
            logData.push( key + '=' + encodeURIComponent(data[key]) );
        };

        return logData.join( '&' );
    };

    return log;

});