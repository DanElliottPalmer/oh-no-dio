'use strict';

const CONFIG = require('./config.json');

const spotify = require('spotify-node-applescript');
const io = require('socket.io-client');

let currentTrackId = false;
let tmr = false;
let socket = null;
let spotifyState = null;
let spotifyTrack = null;

update();
connect();
initInterval();

function applySocketListeners(socket){
	socket.on('connect', function(){
		console.log('connect');
		sendCurrentTrack();
	});
	socket.on('disconnect', function(){
		console.log('disconnect');
	});
	socket.on('track.current', sendCurrentTrack);
}

function connect(){
	socket = io.connect(`${CONFIG.HOST}/${CONFIG.SECRET_CODE}`);
	applySocketListeners(socket);
}

function createEvent(type, data){
	return {
		data,
		type
	};
}

function emitTrackChange(){
	clearInterval(tmr);
	tmr = false;
	sendCurrentTrack();
	initInterval();
}

function initInterval(){
	if(tmr) return;
	tmr = setInterval(update, 1000);
}

function isPlayerHalted(){
	return (
		spotifyState === null ||
		spotifyState.state === 'stopped' ||
		spotifyState.state === 'paused'
	);
}

function sendCurrentTrack(){
	let data = null;
	console.log(spotifyState);
	if(isPlayerHalted()){
		data = createEvent('track.current', {
			'track': false
		});
	} else {
		data = createEvent('track.current', {
			'track': [spotifyTrack.id, spotifyTrack.artist, spotifyTrack.name]
		});
	}
	socket.emit('track.current', data);
}

function updateSpotifyState(){
	return new Promise(function(resolve, reject){
		spotify.getState(function(err, state){
			if(err) throw err;
			spotifyState = state;
			resolve(state);
		});
	});
}

function updateSpotifyTrack(){
	return new Promise(function(resolve, reject){
		spotify.getTrack(function(err, track){
			if(err) throw err;
			spotifyTrack = track;
			resolve(track);
		});
	});
}

function update(){
	updateSpotifyState()
		.then(updateSpotifyTrack)
		.then(function(){
			if(spotifyState.state === 'playing' && spotifyTrack.id !== currentTrackId){
				currentTrackId = spotifyTrack.id;
				emitTrackChange();
			} else if(currentTrackId && isPlayerHalted()){
				currentTrackId = null;
				emitTrackChange();
			}
		})
		.catch(function(err){
			console.error(err);
		});
}
