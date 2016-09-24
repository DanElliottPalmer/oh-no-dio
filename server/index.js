'use strict';

const SERVER_PORT = process.env.PORT || 8008;

const createApp = require('./app');
const createSocket = require('./socket');

const http = require('http');

const app = createApp();
const server = http.createServer(app);
const io = createSocket(server);

server.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});
