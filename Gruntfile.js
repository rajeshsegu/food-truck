/* jshint node: true */

module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        jasmine : {
            src : [
                'public/js/lib/underscore.js',
                'public/js/lib/jquery.js',
                'public/js/lib/backbone.js',
                'public/js/*.js'
            ],
            options : {
                specs : 'test/**/*.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');


    grunt.registerTask('test', 'jasmine');
    grunt.registerTask('default', 'test');
};