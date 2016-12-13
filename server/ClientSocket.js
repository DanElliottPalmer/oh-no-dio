'use strict';

const CONFIG = require('./config.json');
// const STATE = require('./State');

const socketio = require('socket.io');


class ClientServer {

    _onClientConnect(socket){
        this._sockets.push(socket);
        console.log('connected');

        socket.on('disconnect', function(){
            console.log('disconnected');
        });
        socket.on('disconnect', this._removeSocket.bind(this, socket));
        socket.on('data', function(value){
            console.log('data', value);
        });
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

    emit(...args){
        this._server.emit(...args);
    }

    listen(server){
        this._server = server.of(`/${CONFIG.CLIENT_SECRET_CODE}/client`)
            .on('connection', this._onClientConnect.bind(this));
    }

    get server(){
        return this._server;
    }

    get sockets(){
        return this._sockets;
    }

}

module.exports = ClientServer;
