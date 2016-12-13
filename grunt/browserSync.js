'use strict';

const PROXY_URL = 'localhost:8008'

module.exports = {

    'dev': {
        'bsFiles': {
            'src': [
                'client/public/**/*'
            ]
        },
        'options': {
            'ghostMode': false,
            'proxy': PROXY_URL,
            'watchTask': true
        }
    }

};