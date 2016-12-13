'use strict';

const EventEmitter2 = require('eventemitter2');
const isEqual = require('lodash.isequal');

class State extends EventEmitter2 {

    constructor(){
        super({
            'newListener': false,
            'verboseMemoryLeak': true,
            'wildcard': true
        });

        this._ = new Map();
    }

    get(key){
        return this._.get(key);
    }

    has(key){
        return this._.has(key);
    }

    set(key, value){
        if(this.has(key) && !isEqual(this.get(key), value)){
            this.emit('change', key, value, this.get(key));
        }
        return this._.set(key, value);
    }

}

const state = new State();
state.set('queue', []);
state.set('current', false);

module.exports = state;
