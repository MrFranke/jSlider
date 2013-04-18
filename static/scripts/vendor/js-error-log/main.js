/**
 * Rewrites 'onerror' event to prevent error messages
 * and passes JS error information to 'log' module
 * which sends the information to server.
 *
 * Sends up to @LIMIT messages from 'onerror' event
 */
define([ './log' ], function( log ) {
    var LIMIT            = 5
      , counter          = 0
      , showDefaultError = true;


    function init( params ) {
        setSettings( params );

        bindEvents();
    }

    function bindEvents() {
        window.onerror = function( message, url, linenumber ) {
            counter++;

            if ( counter === LIMIT || counter > LIMIT ) {
                if ( !showDefaultError ) {
                    return true;
                } else {
                    return;
                };
            };

            // using short key names to reduce traffic
            var data = {
                m: message
              , u: url
              , l: linenumber
            };

            log( data );


            if ( !showDefaultError ) {
                return true;
            };
        };
    }

    function setSettings( params ) {
        if ( params ) {
            ( params.limit || params.limit === 0 ) ? LIMIT = params.limit : '';
            ( params.showDefaultError === false ) ? showDefaultError = params.showDefaultError : '';
        };
    };


    return {
        init: init
    };
});