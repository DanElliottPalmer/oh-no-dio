'use strict';

module.exports = {

    'js': {
        'files': [
            'client/js/**/*',
        ],
        'tasks': ['webpack:dev']
    },

    'sass': {
        'files': [
            'client/sass/**/*'
        ],
        'tasks': ['sass:dev']
    }

};