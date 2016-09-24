'use strict';

const CONFIG = require('./config.json');
const STATE = require('./State');

const socketio = require('socket.io');
const ModelTrack = require('./Track');

let listenerSocket = null;

module.exports = function createSocket(server){
	const io = socketio(server);
	io.of(`/${CONFIG.SECRET_CODE}`)
		.on('connection', onSocketConnection);
	return io;
};

function applyListenerEvents(listenerSocket){
	listenerSocket.on('track.current', function(e){
		if(e.data.track === false){
			STATE.set('current', false);
		} else {
			STATE.set('current', ModelTrack.fromArray(e.data.track));
		}
	});
	listenerSocket.on('track.next', function(){
		if(STATE.get('queue').length === 0){
			listenerSocket.emit('track.next', null);
		} else {
			listenerSocket.emit('track.next', STATE.get('queue')[0].toJSON());
		}
	});
	listenerSocket.on('track.shift', function(){
		STATE.get('queue').shift();
	});
}

function onSocketConnection(socket){
	listenerSocket = socket;
	applyListenerEvents(socket);
}
