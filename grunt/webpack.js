'use strict';

const path = require('path');

const DIR_FRONTEND = path.join(__dirname, '../client');
const PAGES = {
    'page': path.join(DIR_FRONTEND, 'js/page.js')
};

module.exports = {
    'dev': {
        'entry': PAGES,
        'module': {
            'loaders': [{
                'exclude': /(node_modules|bower_components)/,
                'loader': 'babel',
                'query': {
                    'presets': ['es2015']
                },
                'test': /\.js/
            }]
        },
        'plugins': [],
        'output': {
            'filename': '[name].js',
            'path': 'client/public/js'
        },
        'stats': {
            'colors': true,
            'modules': true,
            'reasons': true
        }
    }
};