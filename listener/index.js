'use strict';

const applescript = require('applescript');

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

initInterval();

function emitTrackChange(){
	clearInterval(tmr);
	tmr = false;
	console.log("track changed");
	console.log(currentTrack);
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