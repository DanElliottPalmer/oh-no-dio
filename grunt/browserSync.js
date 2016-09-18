'use strict';

const PROXY_URL = 'localhost:3000'

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