'use strict';

function Track(id, name, artist){
	this.artist = artist;
	this.id = id;
	this.name = name;
	this.spotifyUrl = `https://open.spotify.com/track/${id}`;
}

Track.prototype = {

	"constructor": Track,

	"toJSON": function(){
		let artist = null;
		if(Array.isArray(this.artist)){
			artist = niceArtistLabel(this.artist);
		} else {
			artist = this.artist;
		}

		return {
			"artist": artist,
			"id": this.id,
			"name": this.name,
			"spotifyUrl": this.spotifyUrl
		}
	}

};

Track.fromArray = function(arr){
	const model = new Track(arr[0], arr[2], arr[1]);
	return model;
};

Track.fromSpotify = function(item){
	const model = new Track(
		item.id, item.name, item.artists.map( a => a.name ));
	return model;
};

function niceArtistLabel(artists){
	switch(artists.length){
		case 1:
			return artists[0];
		case 2:
			return `${artists[0]} and ${artists[1]}`;
		default:
			return artists.reverse().reduce(function(previous, current, index){
				switch(index){
					case 0:
						return current;
					case 1:
						return `${current} and ${previous}`;
					default:
						return `${current}, ${previous}`;
				}
			});
	}
}

module.exports = Track;
