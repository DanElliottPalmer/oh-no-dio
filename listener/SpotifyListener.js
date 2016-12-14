'use strict';

const EventEmitter2 = require('eventemitter2');
const spotify = require('spotify-node-applescript');
const SpotifyTrack = require('./SpotifyTrack');

class SpotifyListener extends EventEmitter2 {

    constructor(){
        super({
            'newListener': false,
            'verboseMemoryLeak': true,
            'wildcard': true
        });

        this._isSyncing = false;
        this._position = null;
        this._state = null;
        this._track = null;
    }

    get isHalted(){
        return this.isPaused || this.isStopped;
    }

    get isPaused(){
        if(this.state === null) return false;
        return this.state === 'paused';
    }

    get isPlaying(){
        if(this.state === null) return false;
        return this.state === 'playing';
    }

    get isStopped(){
        if(this.state === null) return false;
        return this.state === 'stopped';
    }

    get isSyncing(){
        return this._isSyncing;
    }

    get position(){
        return this._position;
    }

    get state(){
        return this._state;
    }

    sync(){
        this._isSyncing = true;
        return Promise.all([
            this.syncState(),
            this.syncTrack()
        ]).then(() => {
            this._isSyncing = false;
            this.emit('sync');
            return Promise.resolve();
        }, (err) => {
            this._isSyncing = false;
            this.emit('error', err);
            return Promise.reject();
        });
    }

    syncState(){
        return new Promise((resolve, reject) => {
            spotify.getState((err, state) => {
                if(err){
                    this.emit('error.state', err);
                    reject(err);
                } else {

                    if(this.state === null || this.state !== state.state){
                        const previousState = this.state;
                        this._state = state.state;
                        this.emit('stateChange', this.state, previousState);
                    }

                    if(this.position === null || this.position !== state.position){
                        const previousPosition = this.position;
                        this._position = state.position;
                        this.emit('positionChange', this.position, previousPosition);
                    }

                    this.emit('sync.state', this.state);
                    resolve(this.state);
                }
            });
        });
    }

    syncTrack(){
        return new Promise((resolve, reject) => {
            spotify.getTrack((err, track) => {
                if(err){
                    this.emit('error.track', err);
                    reject(err);
                } else {

                    const currentTrack = SpotifyTrack.fromSpotify(track);
                    if(this.track === null || currentTrack.spotifyId !== this.track.spotifyId){
                        const previousTrack = this.track;
                        this._track = currentTrack;
                        this.emit('trackChange', currentTrack, previousTrack);
                    }

                    this.emit('sync.track', this.track);
                    resolve(this.track);
                }
            });
        });
    }

    get track(){
        return this._track;
    }

}

module.exports = SpotifyListener;
