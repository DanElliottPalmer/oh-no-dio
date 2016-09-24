'use strict';

const CONFIG = require('./config.json');

const spotify = require('spotify-node-applescript');
const io = require('socket.io-client');

const TRACK_FINISH_THRESHOLD = 5;
const RE_SPOTIFY_TRACK = /^spotify:track:/g;

let currentTrackId = false;
let tmr = false;
let socket = null;
let spotifyState = null;
let spotifyTrack = null;
let nextTrack = false;

update();
connect();
initInterval();

function applySocketListeners(socket){
	socket.on('connect', function(){
		sendCurrentTrack();
	});
	// socket.on('disconnect', function(){
	// 	console.log('disconnect');
	// });
	socket.on('track.current', sendCurrentTrack);
	socket.on('track.next', function(e){
		nextTrack = e;
	});
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

function isTrackNearlyFinished(){
	if(spotifyState === null) return false;
	return (
		spotifyState.position >=
		(spotifyTrack.duration/1000 - TRACK_FINISH_THRESHOLD)
	);
}

function isTrackFinished(){
	if(spotifyState === null) return false;
	return spotifyState.position >= (spotifyTrack.duration/1000 - 2);
}

function playNextTrack(){
	return new Promise(function(resolve, reject){
		if(nextTrack === false){
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

function sendQueueTrack(){
	socket.emit('track.next');
}

function sendRemoveNextTrack(){
	socket.emit('track.shift');
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
			spotifyTrack.id = spotifyTrack.id.replace(RE_SPOTIFY_TRACK, '');
			resolve(spotifyTrack);
		});
	});
}

function update(){
	updateSpotifyState()
		.then(updateSpotifyTrack)
		.then(function(){
			// Track updates
			if(spotifyState.state === 'playing' && spotifyTrack.id !== currentTrackId){
				currentTrackId = spotifyTrack.id;
				emitTrackChange();
			} else if(currentTrackId && isPlayerHalted()){
				currentTrackId = null;
				emitTrackChange();
			}

			// Queue updates
			if(isTrackNearlyFinished() && nextTrack === false){
				sendQueueTrack();
			} else if(isTrackFinished()){
				playNextTrack()
					.then(sendRemoveNextTrack);
			}
		})
		.catch(function(err){
			console.error(err);
		});
}
