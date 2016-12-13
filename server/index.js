'use strict';

const SERVER_PORT = process.env.PORT || 8008;

const ClientSocket = require('./ClientSocket');
const ListenerSocket = require('./ListenerSocket');
const createApp = require('./app');

const http = require('http');
const socketio = require('socket.io');

const app = createApp();
const server = http.createServer(app);
const ioServer = socketio(server);

const listenerSocket = new ListenerSocket();
listenerSocket.listen(ioServer);

server.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});
