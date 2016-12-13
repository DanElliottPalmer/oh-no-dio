'use strict';

const RE_SPOTIFY_TRACK = /^spotify:track:/g;

class Track {

    constructor(artist, name, duration){
        this.album = null;
        this.albumArtwork = null;
        this.artist = artist;
        // divide by 1000 as duration is in miliseconds
        this.duration = duration / 1000;
        this.name = name;
        this.popularity = 0;
        this.spotifyId = null;
        this.spotifyUrl = null;
    }

    static fromSpotify(data){
        const model = new Track(data.artist, data.name, data.duration);
        model.album = data.album;
        model.albumArtwork = data.artwork_url;
        model.popularity = data.popularity;
        model.spotifyId = data.id.replace(RE_SPOTIFY_TRACK, '');
        model.spotifyUrl = data.spotify_url;
        return model;
    }

}

module.exports = Track;
