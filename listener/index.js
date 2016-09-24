'use strict';

const CONFIG = require('./config.json');

const applescript = require('applescript');
const io = require('socket.io-client');

let currentTrackId = false;
let currentTrack = false;
let tmr = false;
const script = `
tell application "Spotify"
	set playerState to player state as string

	if (playerState = "playing") then
		set currentArtist to artist of current track as string
		set currentTrack to name of current track as string
		set currentId to id of current track as string
		return {currentId, currentArtist, currentTrack}
	end if

	return {False}
end tell
`;
const reSpotifyRemoval = /^spotify:track:/;
let socket = null;

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

function getCurrentTrack() {
	return new Promise(function(resolve){
		applescript.execString(script, function(err, rtn) {
			if (err) {
				console.error(err);
				currentTrack = false;
			} else {
				if(rtn[0] !== currentTrackId){
					if(rtn[0] === "false"){
						currentTrackId = currentTrack = rtn[0];
					} else {
						const id = rtn[0].replace(reSpotifyRemoval, '');
						currentTrackId = rtn[0];
						currentTrack = [id, rtn[1], rtn[2]];
					}
					emitTrackChange();
				}
			}
			resolve();
		});
	});
}

function initInterval(){
	if(tmr) return;
	tmr = setInterval(getCurrentTrack, 1000);
}

function sendCurrentTrack(){
	const data = createEvent('track.current', {
		'track': currentTrack
	});
	socket.emit('track.current', data);
}