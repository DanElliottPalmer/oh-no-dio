'use strict';

const CONFIG = require('./config.json');
const SpotifyListener = require('./SpotifyListener');

const spotify = require('spotify-node-applescript');
const io = require('socket.io-client');

let sl = null;
let tmr = false;
let socket = null;
let nextTrack = false;


connect();
initListener();


function applySocketListeners(socket){
	socket.on('connect', function(){
		sendCurrentTrack();
	});
	socket.on('track.current', sendCurrentTrack);
	socket.on('track.next', function(e){ nextTrack = e; });
}

function connect(){
	socket = io.connect(`${CONFIG.HOST}/${CONFIG.SECRET_CODE}/listener`);
	applySocketListeners(socket);
}

function createEvent(type, data){
	return { data, type };
}

function initListener(){
	sl = new SpotifyListener();
	sl.on('trackChange', sendCurrentTrack);
	sl.on('stateChange', sendCurrentTrack);
	sl.on('positionChange', function onPositionChange(){
		if(isTrackNearlyFinished() && nextTrack === false){
			sendQueueTrack();
		} else if(isTrackFinished()){
			playNextTrack()
				.then(sendRemoveNextTrack);
		}
	});
	tmr = setInterval(function(){
		if(sl.isSyncing) return;
		sl.sync().catch(function(err){
			console.error(err);
		});
	}, 500);
}

function isTrackNearlyFinished(){
	if(sl.state === null || sl.track === null) return false;
	return sl.position >= (sl.track.duration - CONFIG.THRESHOLD_TRACK_NEARLY_FINISH);
}

function isTrackFinished(){
	if(sl.state === null || sl.track === null) return false;
	return sl.position >= (sl.track.duration - CONFIG.THRESHOLD_TRACK_FINISH);
}

function playNextTrack(){
	return new Promise(function(resolve, reject){
		if(nextTrack === null){
			spotify.pause(function(){
				nextTrack = false;
				resolve();
			});
		} else {
			spotify.playTrack(`spotify:track:${nextTrack.id}`, function(){
				nextTrack = false;
				resolve();
			});
		}
	});
}

function sendCurrentTrack(){
	let data = null;
	if(sl.isHalted || sl.track == null){
		data = createEvent('track.current', {
			'track': false
		});
	} else {
		data = createEvent('track.current', {
			'track': [sl.track.id, sl.track.artist, sl.track.name]
		});
	}
	socket.emit('track.current', data);
}

function sendQueueTrack(){
	socket.emit('track.next');
}

function sendRemoveNextTrack(){
	socket.emit('track.shift');
}
