'use strict';

module.exports = function(grunt) {
    require('load-grunt-config')(grunt, {
        'pkg': grunt.file.readJSON('package.json')
    });

    grunt.registerTask('dev', [
        'browserSync:dev', 'watch'
    ]);
};