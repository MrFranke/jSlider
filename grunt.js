/*global module:false*/

/**
 * Should be generated with a build system
 * Filesystem path, like '/www/project-name/static/scripts'
 * 
 * Template: build/templates/static/grunt.tpl.js
 * 
 * Generate: paths section and requirejs.compile.options.packages path
 */

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    paths: {
      service: {
        src: 'static/service',
        dst: 'static/service'
      },

      scripts: {
        src: 'static/scripts',
        dst: 'static/scripts'
      },

      styles: {
        src: 'static/styles',
        dst: 'static/styles'
      }
    },


    /**
     * Task documentation: https://github.com/asciidisco/grunt-requirejs
     * Build options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
     */
    requirejs: {
      compile: {
        options: {
          baseUrl: '<%= paths.scripts.src %>',
          name: 'main',
          packages: require( './static/scripts/vendor/require.config.js' ).packages,
          out: '<%= paths.scripts.dst %>/_main.js'
        }
      }
    },


    lint: {
      files: [
        'grunt.js',
        '<%= paths.scripts.src %>/main.js',
        '<%= paths.scripts.src %>/pages/**/*.js',
        '<%= paths.scripts.src %>/repo/**/*.js',
        '<%= paths.scripts.src %>/widgets/**/*.js'
      ]
    },


    watch: {
      scripts: {
        files: '<config:lint.files>',
        tasks: 'tech-amd-update lint'
      },
      styles: {
        files: [
          '<%= paths.styles %>/*.less!(__main.less|__ie.less|__print.less)',
          '<%= paths.styles.src %>/**/*.less',
          '<%= paths.styles.src %>/vendor/**/*.css'
        ],
        tasks: 'tech-styles-update'
      }
    },


    clean: {
      // clear concat targets
      files: [
        '<%= paths.styles.src %>/__main.less',
        '<%= paths.styles.src %>/__ie.less',
        '<%= paths.styles.dst %>/__vendor.css',  //<-- dst
        '<%= paths.styles.src %>/__print.less'
      ]
      /**
       * It's possible to clear directories too
       * dirs: [
       *   '<%= paths.service.dst %>',
       *   '<%= paths.scripts.dst %>',
       *   '<%= paths.styles.dst %>'
       * ]
       */
    },


    concat: {
      styles: {
        src: [
          '<%= paths.styles.src %>/reset.less',
          '<%= paths.styles.src %>/__paths.less',
          '<%= paths.styles.src %>/variables.less',
          '<%= paths.styles.src %>/mixins.less',
          '<%= paths.styles.src %>/*.less!(reset.less|__paths.less|variables.less|mixins.less)',

          '<%= paths.styles.src %>/blocks/**/main.less',
          '<%= paths.styles.src %>/blocks/**/**/main.less'
        ],
        dest: '<%= paths.styles.src %>/__main.less'
      },
      ie: {
        src: [
          '<%= paths.styles.src %>/blocks/**/ie.less'
        ],
        dest: '<%= paths.styles.src %>/__ie.less'
      },
      vendor: {
        src: [
          '<%= paths.styles.src %>/vendor/**/*.css'
        ],
        dest: '<%= paths.styles.dst %>/__vendor.css'
      },
      print: {
        src: [
          '<%= paths.styles.src %>/blocks/**/print.less'
        ],
        dest: '<%= paths.styles.src %>/__print.less'
      }
    },


    /**
     * Documentation: https://github.com/gruntjs/grunt-contrib-less
     */
    less: {
      development: {
        files: {
          '<%= paths.styles.dst %>/__main.css': '<%= paths.styles.src %>/__main.less',
          '<%= paths.styles.dst %>/__ie.css': '<%= paths.styles.src %>/__ie.less',
          '<%= paths.styles.dst %>/__print.css': '<%= paths.styles.src %>/__print.less'
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          '<%= paths.styles.dst %>/_main.css': '<%= paths.styles.src %>/__main.less',
          '<%= paths.styles.dst %>/_ie.css': '<%= paths.styles.src %>/__ie.less',
          '<%= paths.styles.dst %>/_print.css': '<%= paths.styles.src %>/__print.less'
        }
      }
    },


    /**
     * Documentation: http://yui.github.com/yuidoc/args/index.html
     */
    yuidoc: {
      compile: {
        /**
         * Unnecessary properties
         *     "name": "project name",
         *     "description": "project description",
         *     "version": "1.0.0",
         */
        options: {
          paths: [
            '<%= paths.scripts.src %>/pages/',
            '<%= paths.scripts.src %>/repo/',
            '<%= paths.scripts.src %>/widgets/'
          ],
          outdir: '<%= paths.service.dst %>/__docs/scripts/'
        }
      }
    },


    /**
     * Documentation: http://www.jshint.com/docs/
     */
    jshint: {
      options: {
        devel: false,
        
        camelcase: true,
        curly: true,
        eqeqeq: false,
        immed: true,
        indent: 4,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: false,
        trailing: true,

        eqnull: true,
        laxcomma: true,

        browser: true,
        jquery: true,
        node: true,
        nonstandard: true,
        worker: true,

        white: false,

        //nomen: true,

        //boss: true,
        maxlen: 130
      },
      globals: {
        require: true,
        define: true,

        underscore: true,
        '_': true
      }
    }
  });


  // Default task.
  grunt.registerTask( 'default', 'lint' );

};
