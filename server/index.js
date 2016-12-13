'use strict';

const SERVER_PORT = process.env.PORT || 8008;

const ClientSocket = require('./ClientSocket');
const ListenerSocket = require('./ListenerSocket');
const createApp = require('./app');
const state = require('./State');
const VIEW_CONTEXTS = require('./contexts');

const http = require('http');
const mustacheExpress = require('mustache-express');
const socketio = require('socket.io');

const app = createApp();
const server = http.createServer(app);
const ioServer = socketio(server);

const listenerSocket = new ListenerSocket();
listenerSocket.listen(ioServer);

const clientSocket = new ClientSocket();
clientSocket.listen(ioServer);



const mustache = mustacheExpress(`${__dirname}/../client/views`, '.mustache');
state.on('change', function(key, newValue, previousValue){
    switch(key){
        case 'current':
            updateCurrentTrack(newValue);
            break;
    }
});

server.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});


function updateCurrentTrack(currentTrack){
    let templateData = {};
    if(currentTrack !== false){
        templateData.current = VIEW_CONTEXTS.renderCurrent(currentTrack);
    }

    mustache(`${__dirname}/../client/views/current.mustache`, templateData, function(err, data){
        clientSocket.emit('trackChange', data);
    });
}