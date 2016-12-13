'use strict';

const CONFIG = require('./config.json');
const STATE = require('./State');
const ModelTrack = require('./Track');

class ListenerSocket {

    _onClientConnect(socket){
        socket.on('disconnect', this._removeSocket.bind(this, socket));
        socket.on('track.current', function(e){
            if(e.data.track === false){
                STATE.set('current', false);
            } else {
                STATE.set('current', ModelTrack.fromArray(e.data.track));
            }
        });
        socket.on('track.next', function(){
            if(STATE.get('queue').length === 0){
                listenerSocket.emit('track.next', null);
            } else {
                listenerSocket.emit('track.next', STATE.get('queue')[0].toJSON());
            }
        });
        socket.on('track.shift', function(){
            STATE.get('queue').shift();
        });

        this._sockets.push(socket);
    }

    _removeSocket(socket){
        socket.removeAllListeners();
        const index = this._sockets.indexOf(socket);
        this._sockets.splice(index, 1);
    }

    constructor(){
        this._server = null;
        this._sockets = [];
    }

    listen(server){
        this._server = server.of(`/${CONFIG.SECRET_CODE}/listener`)
            .on('connection', this._onClientConnect.bind(this));
    }

    get server(){
        return this._server;
    }

    get sockets(){
        return this._sockets;
    }

}

module.exports = ListenerSocket;

