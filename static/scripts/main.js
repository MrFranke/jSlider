require([
   'js-error-log'
  , 'console-log'

  , 'jquery'
  , 'Modernizr'

  , './pages/__main'
  , './widgets/__main'
], function(
    jsErrorLog
  , consoleLog

  , $
  , Modernizr

  , pages
  , widgets
) {

    jsErrorLog.init();

    $(function() {
        runPages();

        if ( widgets ) {
            widgets.init();
        }
    });

    function runPages() {
        if ( !pages ) {
            return;
        }

        var autorun = $( 'body' ).attr( 'data-autorun' );
        if ( !autorun ) {
          return;
        }

        autorun = autorun.split( ' ' );

        for ( var i = 0; i < autorun.length; i++ ) {
            var page = pages[ getPageName(autorun[i]) ];

            if (
                page &&
                page.init &&
                typeof page.init === 'function'
            ) {
                page.init();
            }
        }
    }

    function getPageName( name ) {
        var delimiter = getDelimiter( name );

        if ( delimiter ) {
            var name = name.toLowerCase()
              , name = $.trim( name )
              , chunks = name.split( delimiter )
              , firstPart = chunks.shift();

            chunks = $.map( chunks, capitaliseFirstLetter );
            chunks = chunks.join( '' );

            name = firstPart + chunks;
        }

        return name;
    }

    function getDelimiter( name ) {
        var delimiters = [ '_', '-' ];

        for ( var i = 0; i < delimiters.length; i++ ) {
            var delimiter = delimiters[ i ];

            if ( name.indexOf(delimiter) !== -1 ) {
                return delimiter;
            }
        };
    }

    function capitaliseFirstLetter( string ) {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
    }

});